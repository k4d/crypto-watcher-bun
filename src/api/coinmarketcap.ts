/**
 * @file This module provides a client for fetching global cryptocurrency metrics from the CoinMarketCap API.
 */

import chalk from "chalk";
import { CmcGlobalMetricsSchema } from "@/types";

// --- API Client ---

/**
 * Fetches global cryptocurrency metrics from the CoinMarketCap API.
 * @param apiKey The CoinMarketCap API key.
 * @param convertCurrency The currency to convert the metrics to (e.g., "USD", "USDT").
 * @returns An object containing total market cap, 24h volume, and BTC dominance.
 * @throws If the API key is missing, the request fails, or the response is invalid.
 */
export async function fetchGlobalMetrics(
	apiKey: string,
	convertCurrency: string,
) {
	if (!apiKey) {
		throw new Error(
			"CoinMarketCap API key is missing. Please set CMC_API_KEY environment variable.",
		);
	}

	const url = `https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest?convert=${convertCurrency}`;

	try {
		const response = await fetch(url, {
			headers: {
				"X-CMC_PRO_API_KEY": apiKey,
			},
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error(
				chalk.red(
					`CoinMarketCap API Error (${response.status}): ${JSON.stringify(
						errorData,
					)}`,
				),
			);
			throw new Error(`CoinMarketCap API returned status ${response.status}`);
		}

		const rawData = await response.json();
		const validatedData = CmcGlobalMetricsSchema.parse(rawData);

		const quote = validatedData.data.quote[convertCurrency];
		if (!quote) {
			throw new Error(
				`CoinMarketCap API response missing quote for ${convertCurrency}`,
			);
		}

		return {
			totalMarketCap: quote.total_market_cap, // Corrected path
			totalVolume24h: quote.total_volume_24h, // Corrected path
			btcDominance: validatedData.data.btc_dominance,
		};
	} catch (error) {
		console.error(
			chalk.red.bold("\nError fetching CoinMarketCap global metrics!"),
			error,
		);
		throw error;
	}
}
