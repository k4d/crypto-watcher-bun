/**
 * @file This file centralizes all shared type definitions and Zod schemas for the application.
 */
import { z } from "zod";

// --- Zod Schemas for API Validation ---

/**
 * Zod schema for a single ticker object from the Binance `/api/v3/ticker/24hr` endpoint.
 * Ensures the response has the required price fields.
 */
export const Binance24hrTickerSchema = z.object({
	symbol: z.string(),
	lastPrice: z.string(),
	highPrice: z.string(),
	lowPrice: z.string(),
	weightedAvgPrice: z.string(),
});

/**
 * Zod schema for the Binance API error response.
 * Ensures that an error response contains a 'code' and a 'msg'.
 */
export const BinanceErrorSchema = z.object({
	code: z.number(),
	msg: z.string(),
});

/**
 * Zod schema for the application configuration (`config.yml`).
 * Ensures the configuration file has the correct structure and data types.
 */
export const ConfigSchema = z.object({
	currency: z.string().min(1),
	fetch_interval: z
		.string()
		.regex(
			/^\d+[smh]$/,
			"Invalid fetch_interval format. Use 's', 'm', or 'h' (e.g., '30s', '5m', '1h').",
		),
	coins: z.record(z.string(), z.string().min(1)),
});

// --- Inferred TypeScript Types ---

/**
 * Type for the application configuration, inferred from the Zod schema.
 */
export type Config = z.infer<typeof ConfigSchema>;

/**
 * Type for a single 24hr ticker from the Binance API, inferred from the Zod schema.
 */
export type Binance24hrTicker = z.infer<typeof Binance24hrTickerSchema>;

/**
 * Type for a Binance API error response, inferred from the Zod schema.
 */
export type BinanceError = z.infer<typeof BinanceErrorSchema>;

// --- Internal Application Types ---

/**
 * Defines the structure for a single coin's detailed price data, used internally.
 */
export interface PriceData {
	current: number;
	high: number;
	low: number;
	avg: number;
}

/**
 * Defines the structure for data collected in the first pass of logPriceData,
 * before final table construction and ranking.
 */
export interface IntermediateDataItem {
	id: string; // The original ID from config.coins
	symbol: string; // The base symbol (e.g., "BTC")
	priceData: PriceData; // The detailed price data for the coin
	volatility: number; // Calculated volatility
}

/**
 * Defines the structure for the transformed response, mapping a symbol to its detailed price data.
 * @example
 * {
 *   "BTCUSDT": { current: 97000, high: 98000, low: 96000, avg: 97500 },
 * }
 */
export interface TransformedBinanceResponse {
	[symbol: string]: PriceData;
}
