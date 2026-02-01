/**
 * @file This module centralizes all functions related to console output and formatting.
 */

import chalk from "chalk";
import config from "@/config";
import type { IntermediateDataItem, TransformedBinanceResponse } from "@/types";
import pkg from "../../package.json";

// Stores the prices from the previous fetch to compare against current prices.
let previousPrices: TransformedBinanceResponse | null = null;
// Stores the prices from the very first fetch to compare against current prices.
let initialPrices: TransformedBinanceResponse | null = null;
// A counter for the number of times the task has been run.
let runCount = 0;
// Stores a history of prices to calculate changes over different timeframes.
const priceHistory: {
	[symbolId: string]: { timestamp: number; price: number }[];
} = {};

/**
 * Formats a given price number to a string with appropriate decimal places
 * based on its magnitude for better readability.
 * - For prices > 10000, uses 1 decimal place.
 * - For prices > 100, uses 2 decimal places.
 * - For prices > 1, uses 3 decimal places.
 * - For prices < 1 but >= 0.01, uses 4 decimal places.
 * - For prices < 0.01, uses 5 decimal places.
 * @param price The price number to format.
 * @returns The formatted price as a string.
 */
export function formatPrice(price: number): string {
	if (price > 10000) {
		return price.toFixed(1);
	} else if (price > 100) {
		return price.toFixed(2);
	} else if (price > 1) {
		return price.toFixed(3);
	} else if (price < 0.01) {
		return price.toFixed(5);
	} else {
		return price.toFixed(4);
	}
}

/**
 * Logs the prices and 24h statistics of cryptocurrencies to the console in a tabular format.
 * @param currentPrices - The transformed price data from the current API fetch.
 */
export function logPriceData(currentPrices: TransformedBinanceResponse) {
	runCount++;
	console.log(
		chalk.gray(
			`\n[${runCount}] Task run at ${new Date().toLocaleTimeString()}`,
		),
	);

	// Store initial prices on the very first run.
	if (initialPrices === null) {
		initialPrices = currentPrices;
	}

	const coinSymbols = Object.keys(config.coins);
	const intermediateData: IntermediateDataItem[] = [];
	const now = Date.now();
	const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
	const THIRTY_MINUTES_MS = 30 * 60 * 1000;
	const HISTORY_PRUNE_MS = 35 * 60 * 1000; // Keep 35 mins of history

	// --- Pass 1: Collect data and update history ---
	for (const id of coinSymbols) {
		const priceData = currentPrices[id];
		const symbol = config.coins[id];

		if (priceData && symbol) {
			const currentPrice = priceData.current;
			let volatility = 0;
			const oldPrice = previousPrices?.[id]?.current;

			if (oldPrice !== undefined) {
				volatility = Math.abs(((currentPrice - oldPrice) / oldPrice) * 100);
			}

			// Update and prune price history
			if (!priceHistory[id]) {
				priceHistory[id] = [];
			}
			const history = priceHistory[id]; // Use a local variable for type safety
			history.push({ timestamp: now, price: currentPrice });
			while (
				history.length > 0 &&
				history[0] !== undefined && // Explicit check for undefined
				now - history[0].timestamp > HISTORY_PRUNE_MS
			) {
				history.shift();
			}

			intermediateData.push({
				id,
				symbol,
				priceData,
				volatility,
			});
		} else {
			console.log(
				chalk.yellow(`Warning: Could not find price data for: ${id}.`),
			);
		}
	}

	// --- Pass 2: Calculate max lengths and volatility ranks ---
	let maxHighLen = 0;
	let maxLowLen = 0;
	let maxAvgLen = 0;
	let maxBaseSymbolLen = 0;
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

	// --- Pass 3: Build final table data with all formatting ---
	const tableData = intermediateData.map((data) => {
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

		// 15m and 30m change
		const history = priceHistory[data.id] || [];
		const findPriceAgo = (ms: number) =>
			history.findLast((entry) => now - entry.timestamp >= ms);

		let change15m = 0;
		let change15mString = chalk.gray("N/A");
		const price15mAgo = findPriceAgo(FIFTEEN_MINUTES_MS);
		if (price15mAgo) {
			change15m =
				((currentPrice - price15mAgo.price) / price15mAgo.price) * 100;
			change15mString = formatChange(change15m);
		}

		let change30mString = chalk.gray("N/A");
		let change30m = 0;
		const price30mAgo = findPriceAgo(THIRTY_MINUTES_MS);
		if (price30mAgo) {
			change30m =
				((currentPrice - price30mAgo.price) / price30mAgo.price) * 100;
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

		// --- Signal Generation (Illustrative) ---
		let signalString = chalk.gray("Neutral");
		if (change15m > 1 && change30m > 1) {
			signalString = chalk.green.bold("Buy");
		} else if (change15m < -1 && change30m < -1) {
			signalString = chalk.red.bold("Sell");
		}

		return {
			Symbol: `${chalk.blue(
				data.symbol.padEnd(maxBaseSymbolLen),
			)} ${chalk.yellow(quoteSymbol)}`,
			Price: priceColor(formatPrice(currentPrice)),
			"24h High/Low/AVG": `${chalk.green(
				formatPrice(data.priceData.high).padEnd(maxHighLen),
			)} ${chalk.red(
				formatPrice(data.priceData.low).padEnd(maxLowLen),
			)} ${chalk.gray(formatPrice(data.priceData.avg).padEnd(maxAvgLen))}`,
			[`% Change ${config.fetch_interval}/15m/30m/Session`]: `${changeString} ${change15mString} ${change30mString} ${sessionChangeString}`,
			"V#": previousPrices === null ? chalk.gray("N/A") : rankMap.get(data.id),
			Signal: signalString,
		};
	});

	// Display the collected price data in a table.
	if (tableData.length > 0) {
		const tableObject: { [key: number]: unknown } = {};
		tableData.forEach((row, index) => {
			tableObject[index + 1] = row;
		});
		console.table(tableObject);
	}

	// Update previousPrices for the next comparison.
	previousPrices = currentPrices;
}

/**
 * Logs the initial application startup message, including the version number.
 */
export function logAppStart() {
	console.log(
		chalk.green(`Crypto Watcher v${pkg.version} started. Initial fetch...`),
	);
}

/**
 * Logs the message indicating that the scheduler has started.
 * @param interval - The fetch interval string (e.g., "5m").
 */
export function logSchedulerStart(interval: string) {
	console.log(chalk.green(`Scheduler started: fetching every ${interval}`));
}

/**
 * Logs an error message for an invalid fetch interval format and exits the process.
 * @param interval - The invalid interval string from the config.
 */
export function logInvalidIntervalError(interval: string) {
	console.log(
		chalk.red(
			`Неверный формат интервала: ${interval}. Используйте "5m", "1h", или "30s".`,
		),
	);
}
