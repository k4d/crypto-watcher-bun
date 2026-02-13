import { afterEach, beforeEach, expect, test } from "bun:test";
import { TaskMessage } from "./TaskMessage";

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

test("TaskMessage should display task run message with run count", () => {
	const runCount = 5;
	TaskMessage(runCount);
	expect(consoleOutput).toHaveLength(1);
	expect(consoleOutput[0]).toContain(`[${runCount}] Task run at`);
});

test("TaskMessage should handle different run counts", () => {
	TaskMessage(100);
	expect(consoleOutput).toHaveLength(1);
	expect(consoleOutput[0]).toContain("[100] Task run at");
});
