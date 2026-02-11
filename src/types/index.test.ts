import { expect, test } from "bun:test";
import { z } from "zod";
import { ConfigSchema } from "./index"; // Use relative import for test file

test("ConfigSchema validates a correct configuration", () => {
	const validConfig = {
		currency: "USDT",
		fetch_interval: "5m",
		coins: {
			BTCUSDT: "BTC",
			ETHUSDT: "ETH",
		},
	};
	expect(() => ConfigSchema.parse(validConfig)).not.toThrow();
});

test("ConfigSchema validates a correct configuration with cmc_api_key", () => {
	const validConfig = {
		currency: "USDT",
		fetch_interval: "5m",
		coins: {
			BTCUSDT: "BTC",
			ETHUSDT: "ETH",
		},
		cmc_api_key: "test_api_key",
	};
	expect(() => ConfigSchema.parse(validConfig)).not.toThrow();
});

test("ConfigSchema throws error for missing currency", () => {
	const invalidConfig = {
		fetch_interval: "5m",
		coins: { BTCUSDT: "BTC" },
	};
	expect(() => ConfigSchema.parse(invalidConfig)).toThrow(z.ZodError);
});

test("ConfigSchema throws error for invalid fetch_interval format", () => {
	const invalidConfig = {
		currency: "USDT",
		fetch_interval: "5minutes", // Invalid format
		coins: { BTCUSDT: "BTC" },
	};
	expect(() => ConfigSchema.parse(invalidConfig)).toThrow(z.ZodError);
});

test("ConfigSchema throws error for empty currency string", () => {
	const invalidConfig = {
		currency: "", // Empty string
		fetch_interval: "5m",
		coins: { BTCUSDT: "BTC" },
	};
	expect(() => ConfigSchema.parse(invalidConfig)).toThrow(z.ZodError);
});

test("ConfigSchema throws error for empty coin symbol in coins object", () => {
	const invalidConfig = {
		currency: "USDT",
		fetch_interval: "5m",
		coins: { BTCUSDT: "" }, // Empty coin symbol
	};
	expect(() => ConfigSchema.parse(invalidConfig)).toThrow(z.ZodError);
});

test("ConfigSchema throws error for missing coins object", () => {
	const invalidConfig = {
		currency: "USDT",
		fetch_interval: "5m",
	};
	expect(() => ConfigSchema.parse(invalidConfig)).toThrow(z.ZodError);
});

test("ConfigSchema allows numbers in fetch_interval with 's'", () => {
	const validConfig = {
		currency: "USDT",
		fetch_interval: "10s",
		coins: { BTCUSDT: "BTC" },
	};
	expect(() => ConfigSchema.parse(validConfig)).not.toThrow();
});

test("ConfigSchema allows numbers in fetch_interval with 'h'", () => {
	const validConfig = {
		currency: "USDT",
		fetch_interval: "1h",
		coins: { BTCUSDT: "BTC" },
	};
	expect(() => ConfigSchema.parse(validConfig)).not.toThrow();
});

test("ConfigSchema allows optional cmc_api_key", () => {
	const validConfig = {
		currency: "USDT",
		fetch_interval: "5m",
		coins: { BTCUSDT: "BTC" },
		cmc_api_key: "some_valid_api_key",
	};
	expect(() => ConfigSchema.parse(validConfig)).not.toThrow();
});
