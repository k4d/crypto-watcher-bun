/**
 * @file Component for logging database initialization messages.
 */
import chalk from "chalk";

/**
 * Logs messages related to the database initialization.
 * @param dbFile The path to the SQLite database file.
 */
export function dbStart(dbFile: string) {
	console.log(
		chalk.grey(`Database initialized at ${dbFile} and schema verified.`),
	);
}
