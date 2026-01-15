// This module centralizes all functions related to console output and formatting.

import chalk from "chalk";
import config from "@/config";
import type { TransformedBinanceResponse } from "@/types";

/**
 * Logs the prices of cryptocurrencies to the console.
 * @param prices - The transformed price data from the API.
 */
export function logPriceData(prices: TransformedBinanceResponse) {
	console.log(chalk.gray(`\nTask run at ${new Date().toLocaleTimeString()}`));

	const coinSymbols = Object.keys(config.coins);

	// Iterate through each configured coin and display its price.
	for (const id of coinSymbols) {
		// Check if price data is available for the current coin and currency.
		if (prices[id]?.[config.currency]) {
			const price = prices[id][config.currency];
			const symbol = config.coins[id];

			console.log(
				// Formats and logs the coin symbol, price, and currency.
				`${chalk.blue(symbol.padEnd(8, " "))} : ${chalk.green(price)} ${chalk.yellow(config.currency.toUpperCase())}`,
			);
		} else {
			console.log(
				chalk.yellow(`Warning: Could not find price data for: ${id}.`),
			);
		}
	}
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
