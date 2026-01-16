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
 * It also colors the price based on changes compared to the previous fetch:
 * - Green if the price increased.
 * - Red if the price decreased.
 * - White (default) if the price remained the same or on the first fetch.
 * @param currentPrices - The transformed price data from the current API fetch.
 */
export function logPriceData(currentPrices: TransformedBinanceResponse) {
	console.log(chalk.gray(`\nTask run at ${new Date().toLocaleTimeString()}`));

	// Store initial prices on the very first run.
	if (initialPrices === null) {
		initialPrices = currentPrices;
	}

	const coinSymbols = Object.keys(config.coins);
	const tableData = [];

	// Iterate through each configured coin and collect its price data.
	for (const id of coinSymbols) {
		const currentPrice = currentPrices[id]?.[config.currency];
		const symbol = config.coins[id];

		// Only proceed if we have a valid price for the current coin.
		if (currentPrice !== undefined) {
			let priceColor = chalk.white; // Default color function is white
			let changeString = chalk.gray("N/A"); // Default for first run
			let totalChangeString = chalk.gray("N/A"); // Default for first run

			// --- Calculate change from PREVIOUS fetch ---
			const oldPrice = previousPrices?.[id]?.[config.currency];
			if (oldPrice !== undefined) {
				if (currentPrice > oldPrice) {
					const percentageChange =
						((currentPrice - oldPrice) / oldPrice) * 100;
					priceColor = chalk.green; // Price went up
					changeString = chalk.green(`▲ +${percentageChange.toFixed(2)}%`);
				} else if (currentPrice < oldPrice) {
					const percentageChange =
						((currentPrice - oldPrice) / oldPrice) * 100;
					priceColor = chalk.red; // Price went down
					changeString = chalk.red(`▼ ${percentageChange.toFixed(2)}%`);
				} else {
					changeString = "(0.00%)";
				}
			}

			// --- Calculate change from INITIAL fetch ---
			// Only calculate if initialPrices is available and not the same as currentPrices (i.e., not the very first run after initialPrices was set).
			const initialPrice = initialPrices?.[id]?.[config.currency];
			if (initialPrice !== undefined && initialPrices !== currentPrices) {
				if (currentPrice > initialPrice) {
					const totalPercentageChange =
						((currentPrice - initialPrice) / initialPrice) * 100;
					totalChangeString = chalk.green(
						`▲ +${totalPercentageChange.toFixed(2)}%`,
					);
				} else if (currentPrice < initialPrice) {
					const totalPercentageChange =
						((currentPrice - initialPrice) / initialPrice) * 100;
					totalChangeString = chalk.red(
						`▼ ${totalPercentageChange.toFixed(2)}%`,
					);
				} else {
					totalChangeString = "(0.00%)";
				}
			}

			tableData.push({
				Symbol: chalk.blue(symbol),
				Price: priceColor(currentPrice),
				Currency: chalk.yellow(config.currency.toUpperCase()),
				"% Change": changeString,
				"Total % Change": totalChangeString,
			});
		} else {
			// Log a warning if price data is missing for a specific coin.
			console.log(
				chalk.yellow(`Warning: Could not find price data for: ${id}.`),
			);
		}
	}

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
