import { afterEach, beforeEach, expect, test } from "bun:test";
import { AppStartLogo } from "./AppStartLogo";

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

test("AppStartLogo should display ASCII art logo", async () => {
	await AppStartLogo();
	expect(consoleOutput).toHaveLength(1);
	// Проверяем, что в выводе содержится какой-то ASCII-арт (многострочный текст)
	// ASCII-арт обычно содержит символы подчеркивания и косые черты
	expect(consoleOutput[0]).toContain("__");
	expect(consoleOutput[0]).toContain("/");
});
