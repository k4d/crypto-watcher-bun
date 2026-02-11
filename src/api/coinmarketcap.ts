/**
 * @file This module provides a client for fetching global cryptocurrency metrics from the CoinMarketCap API.
 */

import chalk from "chalk";
import { CmcGlobalMetricsSchema, FearAndGreedIndexSchema } from "@/types";

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
			ethDominance: validatedData.data.eth_dominance, // ETH Dominance
			totalMarketCapChange24h:
				quote.total_market_cap_yesterday_percentage_change || 0,
			totalVolume24hChange24h:
				quote.total_volume_24h_yesterday_percentage_change || 0,
			btcDominanceChange24h:
				validatedData.data.btc_dominance_24h_percentage_change || 0,
			ethDominanceChange24h:
				validatedData.data.eth_dominance_24h_percentage_change || 0, // ETH Dominance 24h change
		};
	} catch (error) {
		console.error(
			chalk.red.bold("\nError fetching CoinMarketCap global metrics!"),
			error,
		);
		throw error;
	}
}

/**
 * Fetches the latest CoinMarketCap Fear and Greed Index value and classification.
 * @param apiKey The CoinMarketCap API key.
 * @returns An object containing the Fear and Greed Index value and its classification.
 * @throws If the API key is missing, the request fails, or the response is invalid.
 */
export async function fetchFearAndGreedIndex(apiKey: string) {
	if (!apiKey) {
		throw new Error(
			"CoinMarketCap API key is missing for Fear and Greed Index. Please set CMC_API_KEY environment variable.",
		);
	}

	const url = `https://pro-api.coinmarketcap.com/v3/fear-and-greed/latest`;

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
					`CoinMarketCap API Error (Fear and Greed Index - ${response.status}): ${JSON.stringify(
						errorData,
					)}`,
				),
			);
			throw new Error(
				`CoinMarketCap API for Fear and Greed Index returned status ${response.status}`,
			);
		}

		const rawData = await response.json();
		const validatedData = FearAndGreedIndexSchema.parse(rawData);

		if (!validatedData.data) {
			throw new Error(
				`CoinMarketCap API response missing data for Fear and Greed Index`,
			);
		}

		return {
			fearAndGreedIndex: validatedData.data.value,
			fearAndGreedClassification: validatedData.data.value_classification,
		};
	} catch (error) {
		console.error(
			chalk.red.bold("\nError fetching CoinMarketCap Fear and Greed Index!"),
			error,
		);
		throw error;
	}
}
