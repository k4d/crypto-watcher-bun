import { afterEach, beforeEach, expect, test } from "bun:test";
import { InvalidIntervalError } from "./InvalidIntervalError";

// Мокаем console.log для проверки вывода
const originalLog = console.log;
let consoleOutput: string[];

beforeEach(() => {
	consoleOutput = [];
	console.log = (...args) => {
		consoleOutput.push(args.join(" "));
	};
});

afterEach(() => {
	console.log = originalLog;
});

test("InvalidIntervalError should display invalid interval error message", () => {
	const interval = "invalid";
	InvalidIntervalError(interval);
	expect(consoleOutput).toHaveLength(1);
	expect(consoleOutput[0]).toContain(
		'Invalid interval format: invalid. Use "5m", "1h", or "30s".',
	);
});

test("InvalidIntervalError should handle different invalid intervals", () => {
	InvalidIntervalError("10years");
	expect(consoleOutput).toHaveLength(1);
	expect(consoleOutput[0]).toContain(
		'Invalid interval format: 10years. Use "5m", "1h", or "30s".',
	);
});
