/**
 * @file Component for logging an invalid interval error.
 */
import chalk from "chalk";

/**
 * Logs an error message for an invalid fetch interval format.
 * @param interval - The invalid interval string from the config.
 */
export function InvalidIntervalError(interval: string) {
	console.log(
		chalk.red(
			`Invalid interval format: ${interval}. Use "5m", "1h", or "30s".`,
		),
	);
}
