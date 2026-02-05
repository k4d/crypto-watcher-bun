/**
 * @file This module contains helper functions for managing application state in the SQLite database.
 */
import db from "@/db";
import type { TransformedBinanceResponse } from "@/types";

export function getState(key: string): TransformedBinanceResponse | null {
	const query = db.query("SELECT value FROM key_value_store WHERE key = ?1;");
	const result = query.get(key) as { value: string } | null;
	return result ? JSON.parse(result.value) : null;
}

export function setState(key: string, value: TransformedBinanceResponse) {
	const query = db.query(
		"INSERT OR REPLACE INTO key_value_store (key, value) VALUES (?1, ?2);",
	);
	query.run(key, JSON.stringify(value));
}

export function getRunCount(): number {
	const query = db.query(
		"INSERT INTO key_value_store (key, value) VALUES ('runCount', '0') ON CONFLICT(key) DO UPDATE SET value = CAST(value AS INTEGER) + 1 RETURNING value;",
	);
	const result = query.get() as { value: string };
	return parseInt(result.value, 10);
}
