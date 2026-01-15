// This file centralizes all shared type definitions and Zod schemas for the application.
import { z } from "zod";

// --- Zod Schemas for API Validation ---

// Schema for a single ticker from the Binance API
export const BinanceTickerSchema = z.object({
	symbol: z.string(),
	price: z.string(),
});

// Schema for the Binance API error response
export const BinanceErrorSchema = z.object({
	code: z.number(),
	msg: z.string(),
});

// --- Inferred TypeScript Types ---

// Type for a single ticker from Binance API, inferred from the Zod schema
export type BinanceTicker = z.infer<typeof BinanceTickerSchema>;

// Type for a Binance API error response, inferred from the Zod schema
export type BinanceError = z.infer<typeof BinanceErrorSchema>;

// --- Internal Application Types ---

// Define the structure for the transformed response, used internally in the application.
// This makes it easier to work with the data after it has been fetched and validated.
export interface TransformedBinanceResponse {
	[symbol: string]: {
		[currency: string]: number;
	};
}
