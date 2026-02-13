import { afterEach, beforeEach, expect, test } from "bun:test";
import { dbStart } from "./dbStart";

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

test("dbStart should display database initialization message", () => {
	const dbFile = "data/test.sqlite";
	dbStart(dbFile);
	expect(consoleOutput).toHaveLength(1);
	expect(consoleOutput[0]).toContain(
		"Database initialized at data/test.sqlite and schema verified.",
	);
});
