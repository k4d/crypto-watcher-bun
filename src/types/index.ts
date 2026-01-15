/**
 * @file This file centralizes all shared type definitions and Zod schemas for the application.
 */
import { z } from "zod";

// --- Zod Schemas for API Validation ---

/**
 * Zod schema for a single ticker object from the Binance API.
 * Ensures that the API response for a ticker has a 'symbol' and a 'price'.
 */
export const BinanceTickerSchema = z.object({
	symbol: z.string(),
	price: z.string(),
});

/**
 * Zod schema for the Binance API error response.
 * Ensures that an error response contains a 'code' and a 'msg'.
 */
export const BinanceErrorSchema = z.object({
	code: z.number(),
	msg: z.string(),
});

// --- Inferred TypeScript Types ---

/**
 * Type for a single ticker from the Binance API, inferred from the Zod schema.
 */
export type BinanceTicker = z.infer<typeof BinanceTickerSchema>;

/**
 * Type for a Binance API error response, inferred from the Zod schema.
 */
export type BinanceError = z.infer<typeof BinanceErrorSchema>;

// --- Internal Application Types ---

/**
 * Defines the structure for the transformed response, used internally in the application.
 * This makes it easier to work with the data after it has been fetched and validated.
 * @example
 * {
 *   "BTCUSDT": { "USDT": 97000.00 },
 *   "ETHUSDT": { "USDT": 3400.50 }
 * }
 */
export interface TransformedBinanceResponse {
	[symbol: string]: {
		[currency: string]: number;
	};
}
