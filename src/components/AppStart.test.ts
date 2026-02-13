import { afterEach, beforeEach, expect, test } from "bun:test";
import { AppStart } from "./AppStart";

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

test("AppStart should call both logo and message components", async () => {
	await AppStart();
	// Может быть больше 2 сообщений из-за многострочного ASCII-арта
	expect(consoleOutput).toHaveLength(2); // или увеличьте число, если ASCII-арт выводится в несколько строк
	expect(
		consoleOutput.some((output) => output.includes("Crypto Watcher")),
	).toBe(true);
	expect(
		consoleOutput.some((output) =>
			/Crypto Watcher v\d+\.\d+\.\d+ started\./.test(output),
		),
	).toBe(true);
});
