import { afterEach, beforeEach, expect, test } from "bun:test";
import { AppStartMessage } from "./AppStartMessage";

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

test("AppStartMessage should display application start message with version", async () => {
	await AppStartMessage();
	expect(consoleOutput).toHaveLength(1);
	expect(consoleOutput[0]).toMatch(/Crypto Watcher v\d+\.\d+\.\d+ started\./);
});
