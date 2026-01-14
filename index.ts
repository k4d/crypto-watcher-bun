// Core modules for file system operations and YAML parsing

import fs from "node:fs";
// Utility for adding colors to console output
import chalk from "chalk";
// Module for scheduling recurring tasks (cron jobs)
import cron from "node-cron";
import YAML from "yaml";

// Define the structure for a single ticker from Binance API
interface BinanceTicker {
	symbol: string;
	price: string;
}

// Define the structure for the transformed response, similar to the old CoinGeckoResponse
// This makes it easier to integrate with the rest of the application
interface TransformedBinanceResponse {
	[symbol: string]: {
		[currency: string]: number;
	};
}

// Define the structure for a Binance API error response
interface BinanceError {
	code: number;
	msg: string;
}

// Load configuration from YAML file
// Reads 'config.yml', parses it, and stores it in the 'config' constant.
const config = YAML.parse(fs.readFileSync("config.yml", "utf8"));

// Fetches cryptocurrency price data for given symbols from the Binance API.
// Takes an array of Binance-compatible coin symbols (e.g., ["BTCUSDT", "ETHUSDT"]) as input.
// Returns a Promise that resolves to a transformed response containing prices or null if an error occurs.
async function fetchCoinData(
	coinSymbols: string[],
): Promise<TransformedBinanceResponse | null> {
	// Binance API requires symbols in a JSON array string format, which needs to be URL-encoded.
	const params = new URLSearchParams({
		symbols: JSON.stringify(coinSymbols),
	});
	const url = `https://api.binance.com/api/v3/ticker/price?${params.toString()}`;

	try {
		const response = await fetch(url); // Makes an HTTP request to Binance API

		// Checks if the API response was successful
		if (!response.ok) {
			// If the error is a 400 Bad Request, it indicates an invalid symbol or malformed request.
			// Parse the error data from Binance for a more specific message.
			if (response.status === 400) {
				const errorData = (await response.json()) as BinanceError;
				console.log(
					chalk.red(
						`Ошибка при получении цены: ${errorData.msg || "Bad Request"}. Проверьте символы в config.yml.`,
					),
				);
			} else {
				console.log(
					chalk.red(`Ошибка при получении цены: ${response.statusText}`),
				);
			}
			return null;
		}

		// Parses the JSON response which is an array of BinanceTicker objects
		const data = (await response.json()) as BinanceTicker[];

		// Transform the array response into a dictionary for easier access
		const transformedData: TransformedBinanceResponse = {};
		for (const ticker of data) {
			transformedData[ticker.symbol] = {
				[config.currency]: Number(ticker.price),
			};
		}

		return transformedData;
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

// Main task function to fetch and display cryptocurrency prices from Binance.
// It retrieves Binance-compatible coin symbols from the configuration,
// fetches their current data via the Binance API, and then logs the prices to the console.
async function runTask() {
	const coinSymbols = Object.keys(config.coins); // Get Binance-compatible coin symbols from config
	// config.currency (e.g., "USDT") now represents the quote asset in Binance trading pairs.
	const prices = await fetchCoinData(coinSymbols); // Fetch prices

	if (prices) {
		console.log(chalk.gray(`\nTask run at ${new Date().toLocaleTimeString()}`));

		// Iterate through each configured coin and display its price
		for (const id of coinSymbols) {
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
