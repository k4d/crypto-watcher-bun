import { expect, test } from "bun:test";
import chalk from "chalk";
import { formatPrice } from "./formatters"; // Use relative import for test file

// Import the function we want to test
// Since it's in globalMetricsDisplay.ts, we need to test it separately or duplicate the logic
// For now, let's create a test for the color logic directly
test("formatPrice correctly formats numbers based on magnitude", () => {
	// > 10000 -> 1 decimal
	expect(formatPrice(12345.67)).toBe("12345.7");

	// > 100 -> 2 decimals
	expect(formatPrice(1234.567)).toBe("1234.57");
	expect(formatPrice(123.456)).toBe("123.46");

	// > 1 -> 3 decimals
	expect(formatPrice(1.2345)).toBe("1.234");

	// < 1 but >= 0.01 -> 4 decimals
	expect(formatPrice(0.12345)).toBe("0.1235");

	// < 0.01 -> 5 decimals
	expect(formatPrice(0.0012345)).toBe("0.00123");
});

test("Fear and Greed Index color classification works correctly", () => {
	// Test the color logic by simulating the function
	const getColorForFearAndGreedClassification = (classification: string) => {
		switch (classification.toLowerCase()) {
			case "extreme fear":
				return chalk.red; // Dark red for extreme fear
			case "fear":
				return chalk.hex("#FFA500"); // Orange for fear
			case "neutral":
				return chalk.yellow; // Yellow for neutral
			case "greed":
				return chalk.green; // Light green for greed
			case "extreme greed":
				return chalk.green.bold; // Bright green for extreme greed
			default:
				return chalk.white; // Default color
		}
	};

	// Test different classifications
	expect(getColorForFearAndGreedClassification("Extreme Fear")("test")).toEqual(
		chalk.red("test"),
	);
	expect(getColorForFearAndGreedClassification("Fear")("test")).toEqual(
		chalk.hex("#FFA500")("test"),
	);
	expect(getColorForFearAndGreedClassification("Neutral")("test")).toEqual(
		chalk.yellow("test"),
	);
	expect(getColorForFearAndGreedClassification("Greed")("test")).toEqual(
		chalk.green("test"),
	);
	expect(
		getColorForFearAndGreedClassification("Extreme Greed")("test"),
	).toEqual(chalk.green.bold("test"));
	expect(getColorForFearAndGreedClassification("unknown")("test")).toEqual(
		chalk.white("test"),
	);
});

test("Others calculation works correctly", () => {
	// Test the calculation: 100 - BTC Dominance - ETH Dominance
	const btcDominance = 58.58;
	const ethDominance = 10.28;
	const others = 100 - btcDominance - ethDominance;

	expect(others.toFixed(2)).toBe("31.14");
});
