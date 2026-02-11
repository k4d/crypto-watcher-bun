import { expect, test } from "bun:test";
import chalk from "chalk";
import { generateSignal, generateSimpleSignal } from "./signal";

test("generateSignal returns correct Buy signal for strong uptrend", () => {
	const signal = generateSignal(2, 1.5, 100, 110, 90);
	expect(signal).toBe(chalk.green.bold("Buy"));
});

test("generateSignal returns correct Sell signal for strong downtrend", () => {
	const signal = generateSignal(-2, -1.5, 100, 110, 90);
	expect(signal).toBe(chalk.red.bold("Sell"));
});

test("generateSignal returns Hold* for overbought conditions", () => {
	// Simulate overbought condition with high RSI-like value
	const signal = generateSignal(2, 1.5, 109, 110, 90); // Price near high of range
	expect(signal).toContain("*"); // Should contain asterisk for caution
	expect(signal).toContain("Hold"); // Should suggest holding
});

test("generateSignal returns Wait* for oversold conditions", () => {
	// Simulate oversold condition with low RSI-like value
	const signal = generateSignal(-2, -1.5, 91, 110, 90); // Price near low of range
	expect(signal).toContain("*"); // Should contain asterisk for caution
	expect(signal).toContain("Wait"); // Should suggest waiting
});

test("generateSignal returns Buy? for oversold but recovering", () => {
	const signal = generateSignal(0.5, -0.2, 92, 110, 90); // Price rising from oversold
	expect(signal).toBe(chalk.green("Buy?")); // Potential buy with uncertainty
});

test("generateSignal returns Sell? for overbought but declining", () => {
	const signal = generateSignal(-0.5, 0.2, 108, 110, 90); // Price declining from overbought
	expect(signal).toBe(chalk.red("Sell?")); // Potential sell with uncertainty
});

test("generateSignal returns Watch for mixed signals", () => {
	const signal = generateSignal(0.7, -0.2, 100, 110, 90); // Conflicting trends with moderate movement
	expect(signal).toBe(chalk.blue("Watch")); // Suggest watching
});

test("generateSignal returns Neutral for low movement", () => {
	const signal = generateSignal(0.1, -0.1, 100, 110, 90); // Very low movement
	expect(signal).toBe(chalk.gray("Neutral")); // Neutral signal
});

test("generateSimpleSignal returns correct Buy signal", () => {
	const signal = generateSimpleSignal(2, 1.5);
	expect(signal).toBe(chalk.green.bold("Buy"));
});

test("generateSimpleSignal returns correct Sell signal", () => {
	const signal = generateSimpleSignal(-2, -1.5);
	expect(signal).toBe(chalk.red.bold("Sell"));
});

test("generateSimpleSignal returns correct Neutral signal", () => {
	const signal = generateSimpleSignal(0.5, -0.3);
	expect(signal).toBe(chalk.gray("Neutral"));
});
