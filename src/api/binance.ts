import chalk from "chalk";
import { z, ZodError } from "zod"; // Import 'z'
import config from "../config";
import {
	BinanceErrorSchema,
	BinanceTickerSchema,
	type TransformedBinanceResponse,
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
		const responseData = await response.json(); // Get the JSON body once.

		// Checks if the API response was successful.
		if (!response.ok) {
			// If the error is a 400 Bad Request, it indicates an invalid symbol or malformed request.
			// Parse the error data from Binance for a more specific message.
			if (response.status === 400) {
				const parsedError = BinanceErrorSchema.safeParse(responseData);
				if (parsedError.success) {
					console.log(
						chalk.red(
							`Ошибка API: ${parsedError.data.msg || "Bad Request"}. Проверьте символы в config.yml.`,
						),
					);
				} else {
					console.log(
						chalk.red(
							`Не удалось разобрать сообщение об ошибке от API: ${response.statusText}`,
						),
					);
				}
			} else {
				console.log(chalk.red(`Ошибка сети: ${response.statusText}`));
			}
			return null;
		}

		// Use Zod to safely parse the successful response.
		const parsedData = BinanceTickerSchema.array().safeParse(responseData);

		if (!parsedData.success) {
			console.log(
				chalk.red(
					"Ошибка валидации: Ответ API не соответствует ожидаемой структуре.",
				),
			);
			// Optionally log parsedData.error for detailed debugging
			return null;
		}

		// Transform the array-based response from Binance into a more accessible dictionary format.
		const transformedData: TransformedBinanceResponse = {};
		for (const ticker of parsedData.data) {
			transformedData[ticker.symbol] = {
				[config.currency]: Number(ticker.price),
			};
		}

		return transformedData;
	} catch (error) {
		// Handles network errors, JSON parsing errors, or Zod errors.
		if (error instanceof ZodError) {
			console.log(chalk.red("Ошибка валидации Zod:"), z.treeifyError(error)); // Use z.treeifyError
		} else if (error instanceof Error) {
			console.log(chalk.red(`Ошибка сети: ${error.message}`));
		} else {
			console.log(chalk.red("Произошла неизвестная сетевая ошибка"));
		}
		return null;
	}
}
