import { afterEach, beforeEach, expect, test } from "bun:test";
import { SchedulerStart } from "./SchedulerStart";

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

test("SchedulerStart should display scheduler start message with interval", () => {
	const interval = "5m";
	SchedulerStart(interval);
	expect(consoleOutput).toHaveLength(1);
	expect(consoleOutput[0]).toContain("Scheduler started: fetching every 5m.");
});

test("SchedulerStart should handle different intervals", () => {
	SchedulerStart("30s");
	expect(consoleOutput).toHaveLength(1);
	expect(consoleOutput[0]).toContain("Scheduler started: fetching every 30s.");
});
