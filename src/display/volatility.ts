/**
 * @file This module contains functions for calculating and formatting volatility metrics.
 */

import chalk from "chalk";
import type { IntermediateDataItem, TransformedBinanceResponse } from "@/types";

// Define a type for the database query function
type QueryFunction = {
	get: (id: string, timestamp: number) => { price: number } | null | unknown;
};

// Define a type for the config
type Config = {
	coins: Record<string, string>;
	currency: string;
	fetch_interval: string;
	cmc_api_key?: string;
};

/**
 * Calculates improved volatility using multiple time intervals and weighted averages.
 * @param currentPrice The current price of the coin
 * @param symbolId The symbol identifier (e.g., "BTCUSDT")
 * @param findPriceAgoQuery A database query function to find historical prices
 * @param previousPrices Previous prices from the last fetch (to determine if this is the first run)
 * @param now The current timestamp
 * @returns The calculated volatility value
 */
export function calculateVolatility(
	currentPrice: number,
	symbolId: string,
	findPriceAgoQuery: QueryFunction, // Database query function
	previousPrices: TransformedBinanceResponse | null,
	now: number,
): number {
	// Calculate volatility based on whether we have previous prices from last fetch
	// If no previous prices exist (first run), set volatility to 0 to be displayed as N/A
	let volatility = 0;

	if (previousPrices !== null) {
		// Get historical prices from SQLite for improved volatility calculation
		const findPriceAgo = (ms: number) => {
			const result = findPriceAgoQuery.get(symbolId, now - ms) as {
				price: number;
			} | null;
			return result?.price;
		};

		// Get prices from different time intervals
		const price1mAgo = findPriceAgo(1 * 60 * 1000); // 1 minute ago
		const price5mAgo = findPriceAgo(5 * 60 * 1000); // 5 minutes ago
		const price15mAgo = findPriceAgo(15 * 60 * 1000); // 15 minutes ago
		const price30mAgo = findPriceAgo(30 * 60 * 1000); // 30 minutes ago

		// Calculate changes for different intervals
		const changes = [];
		if (price1mAgo)
			changes.push(Math.abs(((currentPrice - price1mAgo) / price1mAgo) * 100));
		if (price5mAgo)
			changes.push(Math.abs(((currentPrice - price5mAgo) / price5mAgo) * 100));
		if (price15mAgo)
			changes.push(
				Math.abs(((currentPrice - price15mAgo) / price15mAgo) * 100),
			);
		if (price30mAgo)
			changes.push(
				Math.abs(((currentPrice - price30mAgo) / price30mAgo) * 100),
			);

		// Calculate weighted average volatility only if we have historical data
		if (changes.length > 0) {
			// Give more weight to recent changes
			const weights = [1.5, 1.2, 1.0, 0.8]; // Weight for 1m, 5m, 15m, 30m respectively
			let weightedSum = 0;
			let totalWeight = 0;

			for (let i = 0; i < changes.length && i < weights.length; i++) {
				const change = changes[i];
				const weight = weights[i];
				if (change !== undefined && weight !== undefined) {
					weightedSum += change * weight;
					totalWeight += weight;
				}
			}

			volatility = weightedSum / totalWeight;
		}
	}
	// If previousPrices is null (first run), volatility remains 0 and will be displayed as N/A

	return volatility;
}

/**
 * Formats volatility value with appropriate color coding based on its level.
 * @param volatility The calculated volatility value
 * @param isInitial Whether this is the initial run (displays N/A if true)
 * @returns The formatted volatility string with color
 */
export function formatVolatility(
	volatility: number,
	isInitial: boolean,
): string {
	if (isInitial) return chalk.gray("N/A"); // Show N/A for initial run
	if (volatility >= 5) return chalk.red.bold(`${volatility.toFixed(2)}%`); // High volatility
	if (volatility >= 2) return chalk.yellow(`${volatility.toFixed(2)}%`); // Medium volatility
	return chalk.green(`${volatility.toFixed(2)}%`); // Low volatility
}

/**
 * Updates intermediate data items with calculated volatility values.
 * @param intermediateData The array of intermediate data items to update
 * @param currentPrices The current price data
 * @param coinSymbols The symbols of coins to process
 * @param config The application config
 * @param findPriceAgoQuery A database query function to find historical prices
 * @param previousPrices Previous prices from the last fetch
 */
export function updateIntermediateDataWithVolatility(
	intermediateData: IntermediateDataItem[],
	currentPrices: TransformedBinanceResponse,
	coinSymbols: string[],
	config: Config, // Application config
	findPriceAgoQuery: QueryFunction,
	previousPrices: TransformedBinanceResponse | null,
) {
	const now = Date.now();

	for (const id of coinSymbols) {
		const priceData = currentPrices[id];
		const symbol = config.coins[id];
		if (priceData && symbol) {
			// Calculate improved volatility using multiple time intervals
			const currentPrice = priceData.current;

			const volatility = calculateVolatility(
				currentPrice,
				id,
				findPriceAgoQuery,
				previousPrices,
				now,
			);

			intermediateData.push({ id, symbol, priceData, volatility });
		} else {
			console.log(
				chalk.yellow(`Warning: Could not find price data for: ${id}.`),
			);
		}
	}
}
