/**
 * @file This module initializes and configures the SQLite database using bun:sqlite.
 */

import { Database } from "bun:sqlite";
import { dbStart } from "@/components";

// Determine the database file based on the environment
const isProduction = Bun.env.NODE_ENV === "production";
const dbFile = isProduction
	? "data/prod_history.sqlite"
	: "data/dev_history.sqlite";

// Initialize the database. It will be created if it doesn't exist.
const db = new Database(dbFile);

dbStart(dbFile);

// --- Schema Initialization ---

// Create a simple key-value store for application state
db.run(`
  CREATE TABLE IF NOT EXISTS key_value_store (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Create a table for storing price history
db.run(`
  CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    price REAL NOT NULL
  );
`);

// Create an index on the timestamp for faster queries
db.run(
	"CREATE INDEX IF NOT EXISTS idx_price_history_timestamp ON price_history (symbol_id, timestamp);",
);

export default db;
