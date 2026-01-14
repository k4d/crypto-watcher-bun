// Core modules for file system operations and YAML parsing

import fs from "node:fs";
// Utility for adding colors to console output
import chalk from "chalk";
// Module for scheduling recurring tasks (cron jobs)
import cron from "node-cron";
import YAML from "yaml";

// Define the structure for a single coin's price data (e.g., { usd: 95000 })
interface CoinPriceData {
	[currency: string]: number; // Allows indexing with a string (currency code)
}

// Define the structure for the CoinGecko API response
interface CoinGeckoResponse {
	[coinId: string]: CoinPriceData; // Allows indexing with a string (coin ID)
}

// Load configuration from YAML file
// Reads 'config.yml', parses it, and stores it in the 'config' constant.
const config = YAML.parse(fs.readFileSync("config.yml", "utf8"));

// Fetches cryptocurrency data from the CoinGecko API.
// Takes an array of coin IDs and a target currency as input.
// Returns a Promise that resolves to CoinGeckoResponse (price data) or null if an error occurs.
async function fetchCoinData(
	coinIds: string[],
	currency: string,
): Promise<CoinGeckoResponse | null> {
	const ids = coinIds.join(","); // Joins coin IDs for the API request
	const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${currency}`;

	try {
		const response = await fetch(url); // Makes an HTTP request to CoinGecko API

		// Checks if the API response was successful
		if (!response.ok) {
			console.log(
				chalk.red(`Ошибка при получении цены: ${response.statusText}`),
			);
			return null;
		}

		// Parses the JSON response into CoinGeckoResponse type
		const data = (await response.json()) as CoinGeckoResponse;

		return data;
	} catch (error) {
		// Handles network or other unexpected errors
		if (error instanceof Error) {
			console.log(chalk.red(`Ошибка сети: ${error.message}`));
		} else {
			console.log(chalk.red("Произошла неизвестная сетевая ошибка"));
		}
		return null;
	}
}

// Main task function to fetch and display cryptocurrency prices.
// It retrieves coin IDs and the target currency from the configuration,
// fetches data, and then logs the prices to the console.
async function runTask() {
	const coinIds = Object.keys(config.coins); // Get coin IDs from config
	const currency = config.currency; // Get target currency from config
	const prices = await fetchCoinData(coinIds, currency); // Fetch prices

	if (prices) {
		console.log(chalk.gray(`\nTask run at ${new Date().toLocaleTimeString()}`));

		// Iterate through each configured coin and display its price
		for (const id of coinIds) {
			// Check if price data is available for the current coin and currency
			if (prices[id]?.[config.currency]) {
				const price = prices[id][config.currency];
				const symbol = config.coins[id];

				console.log(
					// Formats and logs the coin symbol, price, and currency
					`${chalk.blue(symbol.padEnd(8, " "))} : ${chalk.green(price)} ${chalk.yellow(config.currency.toUpperCase())}`,
				);
			} else {
				console.log(
					chalk.yellow(`Warning: Could not find price data for: ${id}.`),
				);
			}
		}
	}
}

// Start the Crypto Watcher.
console.log(chalk.green("Crypto Watcher started. Initial fetch..."));
runTask(); // Execute the task immediately on startup

// --- Scheduler Setup ---
// Parses the fetch_interval from the configuration and sets up a cron job.
const interval = config.fetch_interval; // e.g., "30s", "5m", "1h"
const intervalMatch = interval.match(/^(\d+)([smh])$/); // Regex to parse value and unit

if (intervalMatch) {
	const value = parseInt(intervalMatch[1], 10); // Numeric value of the interval
	const unit = intervalMatch[2]; // Unit of the interval (s, m, h)

	let cronSchedule: string;
	// Determines the cron schedule string based on the unit
	if (unit === "s") {
		cronSchedule = `*/${value} * * * * *`; // Every 'value' seconds
	} else if (unit === "m") {
		cronSchedule = `0 */${value} * * * *`; // At second 0, every 'value' minutes
	} else if (unit === "h") {
		cronSchedule = `0 0 */${value} * * *`; // At second 0, minute 0, every 'value' hours
	} else {
		// Should not be reached due to regex, but included for safety
		console.log(chalk.red(`Неподдерживаемый формат интервала: ${interval}`));
		process.exit(1); // Exit if interval format is unsupported
	}

	// Schedule the runTask function using the generated cron schedule
	cron.schedule(cronSchedule, runTask);
	console.log(chalk.green(`Scheduler started: fetching every ${interval}`));
} else {
	// Handles cases where the interval format in config.yml is invalid
	console.log(
		chalk.red(
			`Неверный формат интервала: ${interval}. Используйте "5m", "1h", или "30s".`,
		),
	);
	process.exit(1); // Exit if interval format is invalid
}
