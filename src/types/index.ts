// This file centralizes all shared type definitions for the application.

// Define the structure for a single ticker from Binance API
export interface BinanceTicker {
	symbol: string;
	price: string;
}

// Define the structure for the transformed response, similar to the old CoinGeckoResponse
// This makes it easier to integrate with the rest of the application
export interface TransformedBinanceResponse {
	[symbol: string]: {
		[currency: string]: number;
	};
}

// Define the structure for a Binance API error response
export interface BinanceError {
	code: number;
	msg: string;
}
