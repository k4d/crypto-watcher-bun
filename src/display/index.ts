/**
 * @file This module centralizes all functions related to console output and formatting.
 */

import chalk from "chalk";
import config from "@/config";
import db from "@/db"; // Import the database instance
import type { IntermediateDataItem, TransformedBinanceResponse } from "@/types";
import { formatPrice } from "./formatters";
import { getRunCount, getState, setState } from "./stateHelpers";

/**
 * Logs the prices and 24h statistics of cryptocurrencies to the console in a tabular format.
 * @param currentPrices - The transformed price data from the current API fetch.
 */
export async function logPriceData(currentPrices: TransformedBinanceResponse) {
	const runCount = getRunCount();
	console.log(
		chalk.gray(
			`\n[${runCount}] Task run at ${new Date().toLocaleTimeString()}`,
		),
	);

	// Retrieve previous and initial prices from SQLite
	const initialPrices = getState("initialPrices");
	const previousPrices = getState("previousPrices");

	// Store initial prices on the very first run.
	if (initialPrices === null) {
		setState("initialPrices", currentPrices);
	}

	const coinSymbols = Object.keys(config.coins);
	const intermediateData: IntermediateDataItem[] = [];
	const now = Date.now();
	const HISTORY_PRUNE_MS = 35 * 60 * 1000;

	// --- Pass 1: Collect data and update history in SQLite ---
	const insertHistoryQuery = db.query(
		"INSERT INTO price_history (symbol_id, timestamp, price) VALUES (?1, ?2, ?3);",
	);
	const deleteOldHistoryQuery = db.query(
		"DELETE FROM price_history WHERE timestamp < ?1;",
	);

	const addHistoryAndPrune = db.transaction(
		(currentCoinPrices: TransformedBinanceResponse) => {
			for (const id of coinSymbols) {
				const priceData = currentCoinPrices[id];
				if (priceData) {
					insertHistoryQuery.run(id, now, priceData.current);
				}
			}
			deleteOldHistoryQuery.run(now - HISTORY_PRUNE_MS);
		},
	);
	addHistoryAndPrune(currentPrices);

	for (const id of coinSymbols) {
		const priceData = currentPrices[id];
		const symbol = config.coins[id];
		if (priceData && symbol) {
			const oldPrice = previousPrices?.[id]?.current;
			const volatility =
				oldPrice !== undefined
					? Math.abs(((priceData.current - oldPrice) / oldPrice) * 100)
					: 0;
			intermediateData.push({ id, symbol, priceData, volatility });
		} else {
			console.log(
				chalk.yellow(`Warning: Could not find price data for: ${id}.`),
			);
		}
	}

	// --- Pass 2: Calculate max lengths and volatility ranks ---
	let maxHighLen = 0,
		maxLowLen = 0,
		maxAvgLen = 0,
		maxBaseSymbolLen = 0;
	const quoteSymbol = config.currency.toUpperCase();
	const rankMap = new Map<string, number>();

	for (const data of intermediateData) {
		maxHighLen = Math.max(maxHighLen, formatPrice(data.priceData.high).length);
		maxLowLen = Math.max(maxLowLen, formatPrice(data.priceData.low).length);
		maxAvgLen = Math.max(maxAvgLen, formatPrice(data.priceData.avg).length);
		maxBaseSymbolLen = Math.max(maxBaseSymbolLen, data.symbol.length);
	}

	if (previousPrices !== null) {
		[...intermediateData]
			.sort((a, b) => b.volatility - a.volatility)
			.forEach((data, index) => {
				rankMap.set(data.id, index + 1);
			});
	}

	// --- Pass 3: Pre-calculate all change strings and signals for padding ---
	const findPriceAgoQuery = db.query(
		"SELECT price FROM price_history WHERE symbol_id = ?1 AND timestamp <= ?2 ORDER BY timestamp DESC LIMIT 1;",
	);

	const preFormattedChanges = await Promise.all(
		intermediateData.map(async (data) => {
			const currentPrice = data.priceData.current;
			let priceColor = chalk.white;

			const formatChange = (change: number) => {
				if (change > 0) return chalk.green(`▲ +${change.toFixed(2)}%`);
				if (change < 0) return chalk.red(`▼ ${change.toFixed(2)}%`);
				return chalk.white("   0.00%");
			};

			// Change from previous fetch
			let changeString = chalk.gray("N/A");
			const oldPrice = previousPrices?.[data.id]?.current;
			if (oldPrice !== undefined) {
				const change = ((currentPrice - oldPrice) / oldPrice) * 100;
				if (change > 0) priceColor = chalk.green;
				if (change < 0) priceColor = chalk.red;
				changeString = formatChange(change);
			}

			// IMPORTANT: If current price is at 24h high, override the color
			// This check must come *after* other coloring to take precedence.
			if (currentPrice >= data.priceData.high) {
				priceColor = chalk.bgHex("#006400").white;
			}
			// IMPORTANT: If current price is at 24h low, override the color (takes precedence over change, but not high)
			if (currentPrice <= data.priceData.low) {
				priceColor = chalk.bgHex("#8B0000").white;
			}

			// Find historical prices from SQLite
			const findPriceAgo = (ms: number) => {
				const result = findPriceAgoQuery.get(data.id, now - ms) as {
					price: number;
				} | null;
				return result?.price;
			};

			const price15mAgo = findPriceAgo(15 * 60 * 1000);
			const price30mAgo = findPriceAgo(30 * 60 * 1000);

			let change15m = 0,
				change15mString = chalk.gray("N/A");
			if (price15mAgo) {
				change15m = ((currentPrice - price15mAgo) / price15mAgo) * 100;
				change15mString = formatChange(change15m);
			}

			let change30m = 0,
				change30mString = chalk.gray("N/A");
			if (price30mAgo) {
				change30m = ((currentPrice - price30mAgo) / price30mAgo) * 100;
				change30mString = formatChange(change30m);
			}

			// Session change
			let sessionChangeString = chalk.gray("N/A");
			const initialPrice = initialPrices?.[data.id]?.current;
			if (initialPrice !== undefined && initialPrices !== currentPrices) {
				const sessionChange =
					((currentPrice - initialPrice) / initialPrice) * 100;
				sessionChangeString = formatChange(sessionChange);
			}

			// --- Signal Generation ---
			let signalString = chalk.gray("Neutral");
			if (change15m > 1 && change30m > 1) {
				signalString = chalk.green.bold("Buy");
			} else if (change15m < -1 && change30m < -1) {
				signalString = chalk.red.bold("Sell");
			}

			return {
				id: data.id,
				changeString,
				change15mString,
				change30mString,
				sessionChangeString,
				priceColor,
				signalString,
			};
		}),
	);

	// --- Pass 4: Calculate max lengths for change strings and build final table data ---
	let maxChange1mLen = 0;
	let max15mChangeLen = 0;
	let max30mChangeLen = 0;
	let maxSessionChangeLen = 0;

	for (const changeData of preFormattedChanges) {
		maxChange1mLen = Math.max(maxChange1mLen, changeData.changeString.length);
		max15mChangeLen = Math.max(
			max15mChangeLen,
			changeData.change15mString.length,
		);
		max30mChangeLen = Math.max(
			max30mChangeLen,
			changeData.change30mString.length,
		);
		maxSessionChangeLen = Math.max(
			maxSessionChangeLen,
			changeData.sessionChangeString.length,
		);
	}

	const tableData = intermediateData
		.map((data) => {
			const preFormatted = preFormattedChanges.find((pc) => pc.id === data.id);
			if (!preFormatted) {
				return null; // Should not happen
			}

			return {
				Symbol: `${chalk.blue(
					data.symbol.padEnd(maxBaseSymbolLen),
				)} ${chalk.yellow(quoteSymbol)}`,
				Price: preFormatted.priceColor(formatPrice(data.priceData.current)),
				"24h High/Low/AVG": `${chalk.green(
					formatPrice(data.priceData.high).padEnd(maxHighLen),
				)} ${chalk.red(
					formatPrice(data.priceData.low).padEnd(maxLowLen),
				)} ${chalk.gray(formatPrice(data.priceData.avg).padEnd(maxAvgLen))}`,
				[`% Change ${config.fetch_interval}/15m/30m/Session`]: `${preFormatted.changeString.padEnd(
					maxChange1mLen,
				)} ${preFormatted.change15mString.padEnd(
					max15mChangeLen,
				)} ${preFormatted.change30mString.padEnd(
					max30mChangeLen,
				)} ${preFormatted.sessionChangeString.padEnd(maxSessionChangeLen)}`,
				"V#":
					previousPrices === null ? chalk.gray("N/A") : rankMap.get(data.id),
				Signal: preFormatted.signalString,
			};
		})
		.filter(Boolean); // Filter out any nulls if preFormatted was not found

	// Display the collected price data in a table.
	if (tableData.length > 0) {
		const tableObject: { [key: number]: unknown } = {};
		tableData.forEach((row, index) => {
			tableObject[index + 1] = row;
		});
		console.table(tableObject);
	}

	// Update previousPrices for the next comparison in SQLite
	setState("previousPrices", currentPrices);
}
