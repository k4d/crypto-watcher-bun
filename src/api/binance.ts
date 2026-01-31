import chalk from "chalk";
import { ZodError, z } from "zod";
import {
	Binance24hrTickerSchema,
	BinanceErrorSchema,
	type TransformedBinanceResponse,
} from "@/types";

/**
 * @file This module contains the logic for interacting with the Binance API.
 */

/**
 * Fetches 24-hour price change statistics for given symbols from the Binance API.
 * It validates the response using Zod schemas and transforms the data for internal use.
 * @param coinSymbols An array of Binance-compatible coin symbols (e.g., ["BTCUSDT", "ETHUSDT"]).
 * @returns A Promise that resolves to a transformed response containing detailed price data, or null if an error occurs.
 */
export async function fetchTickerData(
	coinSymbols: string[],
): Promise<TransformedBinanceResponse | null> {
	// Binance API requires symbols to be in a URL-encoded JSON array string format.
	const params = new URLSearchParams({
		symbols: JSON.stringify(coinSymbols),
	});
	const url = `https://api.binance.com/api/v3/ticker/24hr?${params.toString()}`;

	try {
		const response = await fetch(url); // Makes an HTTP request to Binance API.
		const responseData = await response.json(); // Get the JSON body once.

		// Checks if the API response was successful.
		if (!response.ok) {
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
		const parsedData = Binance24hrTickerSchema.array().safeParse(responseData);

		if (!parsedData.success) {
			console.log(
				chalk.red(
					"Ошибка валидации: Ответ API не соответствует ожидаемой структуре.",
				),
			);
			return null;
		}

		// Transform the array-based response from Binance into a more accessible dictionary format.
		const transformedData: TransformedBinanceResponse = {};
		for (const ticker of parsedData.data) {
			transformedData[ticker.symbol] = {
				current: Number(ticker.lastPrice),
				high: Number(ticker.highPrice),
				low: Number(ticker.lowPrice),
				avg: Number(ticker.weightedAvgPrice),
			};
		}

		return transformedData;
	} catch (error) {
		// Handles network errors, JSON parsing errors, or Zod errors.
		if (error instanceof ZodError) {
			console.log(chalk.red("Ошибка валидации Zod:"), z.treeifyError(error));
		} else if (error instanceof Error) {
			console.log(chalk.red(`Ошибка сети: ${error.message}`));
		} else {
			console.log(chalk.red("Произошла неизвестная сетевая ошибка"));
		}
		return null;
	}
}
