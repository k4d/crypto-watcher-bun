/**
 * @file This module centralizes all functions related to console output and formatting.
 */

import chalk from "chalk";
import config from "@/config";
import type { TransformedBinanceResponse } from "@/types";

// Stores the prices from the previous fetch to compare against current prices.
let previousPrices: TransformedBinanceResponse | null = null;
// Stores the prices from the very first fetch to compare against current prices.
let initialPrices: TransformedBinanceResponse | null = null;

/**
 * Logs the prices of cryptocurrencies to the console in a tabular format.
 * It also colors the price based on changes and shows volatility ranks.
 * @param currentPrices - The transformed price data from the current API fetch.
 */
export function logPriceData(currentPrices: TransformedBinanceResponse) {
	console.log(chalk.gray(`\nTask run at ${new Date().toLocaleTimeString()}`));

	// Store initial prices on the very first run.
	if (initialPrices === null) {
		initialPrices = currentPrices;
	}

	const coinSymbols = Object.keys(config.coins);
	const intermediateData = [];

	// --- Pass 1: Collect data and calculate volatility ---
	for (const id of coinSymbols) {
		const currentPrice = currentPrices[id]?.[config.currency];
		const symbol = config.coins[id];

		if (currentPrice !== undefined) {
			let priceColor = chalk.white;
			let changeString = chalk.gray("N/A");
			let totalChangeString = chalk.gray("N/A");
			let volatility = 0;

			const oldPrice = previousPrices?.[id]?.[config.currency];
			if (oldPrice !== undefined) {
				volatility = Math.abs(((currentPrice - oldPrice) / oldPrice) * 100);
				if (currentPrice > oldPrice) {
					priceColor = chalk.green;
					changeString = chalk.green(`▲ +${volatility.toFixed(2)}%`);
				} else if (currentPrice < oldPrice) {
					priceColor = chalk.red;
					changeString = chalk.red(`▼ -${volatility.toFixed(2)}%`);
				} else {
					changeString = chalk.white("   0.00%");
				}
			}

			const initialPrice = initialPrices?.[id]?.[config.currency];
			if (initialPrice !== undefined && initialPrices !== currentPrices) {
				const totalPercentageChange =
					((currentPrice - initialPrice) / initialPrice) * 100;
				if (currentPrice > initialPrice) {
					totalChangeString = chalk.green(
						`▲ +${totalPercentageChange.toFixed(2)}%`,
					);
				} else if (currentPrice < initialPrice) {
					totalChangeString = chalk.red(
						`▼ ${totalPercentageChange.toFixed(2)}%`,
					);
				} else {
					totalChangeString = chalk.white("   0.00%");
				}
			}

			intermediateData.push({
				symbol,
				price: priceColor(currentPrice),
				currency: chalk.yellow(config.currency.toUpperCase()),
				change: changeString,
				totalChange: totalChangeString,
				volatility, // Keep raw volatility for sorting
			});
		} else {
			console.log(
				chalk.yellow(`Warning: Could not find price data for: ${id}.`),
			);
		}
	}

	// --- Pass 2: Create a volatility rank map ---
	const rankMap = new Map<string, number>();
	if (previousPrices !== null) {
		// Create a copy of the data to sort without affecting the original order
		[...intermediateData]
			.sort((a, b) => b.volatility - a.volatility)
			.forEach((data, index) => {
				rankMap.set(data.symbol, index + 1); // Rank is 1-based index
			});
	}

	// --- Pass 3: Build final table data with ranks ---
	const tableData = intermediateData.map((data) => ({
		Symbol: chalk.blue(data.symbol),
		Price: data.price,
		Currency: data.currency,
		"% Change": data.change,
		"Total % Change": data.totalChange,
		"Volatility Index":
			previousPrices === null ? chalk.gray("N/A") : rankMap.get(data.symbol),
	}));

	// Display the collected price data in a table.
	if (tableData.length > 0) {
		console.table(tableData);
	}

	// Update previousPrices for the next comparison.
	previousPrices = currentPrices;
}

/**
 * Logs the initial application startup message.
 */
export function logAppStart() {
	console.log(chalk.green("Crypto Watcher started. Initial fetch..."));
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
