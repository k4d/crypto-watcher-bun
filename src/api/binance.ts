import chalk from "chalk";
import config from "../config";
import type {
	BinanceError,
	BinanceTicker,
	TransformedBinanceResponse,
} from "../types";

// This module contains the logic for interacting with the Binance API.

// Fetches cryptocurrency price data for given symbols from the Binance API.
// Takes an array of Binance-compatible coin symbols (e.g., ["BTCUSDT", "ETHUSDT"]) as input.
// Returns a Promise that resolves to a transformed response containing prices or null if an error occurs.
export async function fetchCoinData(
	coinSymbols: string[],
): Promise<TransformedBinanceResponse | null> {
	// Binance API requires symbols to be in a URL-encoded JSON array string format.
	const params = new URLSearchParams({
		symbols: JSON.stringify(coinSymbols),
	});
	const url = `https://api.binance.com/api/v3/ticker/price?${params.toString()}`;

	try {
		const response = await fetch(url); // Makes an HTTP request to Binance API.

		// Checks if the API response was successful.
		if (!response.ok) {
			// If the error is a 400 Bad Request, it indicates an invalid symbol or malformed request.
			// Parse the error data from Binance for a more specific message.
			if (response.status === 400) {
				const errorData = (await response.json()) as BinanceError;
				console.log(
					chalk.red(
						`Ошибка API: ${errorData.msg || "Bad Request"}. Проверьте символы в config.yml.`,
					),
				);
			} else {
				console.log(
					chalk.red(`Ошибка сети: ${response.statusText}`),
				);
			}
			return null;
		}

		// Parses the JSON response, which is an array of BinanceTicker objects.
		const data = (await response.json()) as BinanceTicker[];

		// Transform the array-based response from Binance into a more accessible dictionary format.
		const transformedData: TransformedBinanceResponse = {};
		for (const ticker of data) {
			transformedData[ticker.symbol] = {
				[config.currency]: Number(ticker.price),
			};
		}

		return transformedData;
	} catch (error) {
		// Handles network errors or other unexpected issues during the fetch.
		if (error instanceof Error) {
			console.log(chalk.red(`Ошибка сети: ${error.message}`));
		} else {
			console.log(chalk.red("Произошла неизвестная сетевая ошибка"));
		}
		return null;
	}
}
