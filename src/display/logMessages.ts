/**
 * @file This module contains simple logging functions for application events.
 */
import chalk from "chalk";
import figlet from "figlet";
import pkg from "../../package.json";

/**
 * Logs the initial application startup message, including the version number.
 */
export async function logAppStart() {
	const asciiArt = await figlet.text("Z Crypto Watcher", {
		font: "Slant", // Or choose another font
		horizontalLayout: "default",
		verticalLayout: "default",
		width: 80,
		whitespaceBreak: true,
	});
	console.log(chalk.blue(asciiArt));
	console.log(
		chalk.green(`Crypto Watcher v${pkg.version} started. Initial fetch...`),
	);
}

/**
 * Logs the message indicating that the scheduler has started.
 * @param interval - The fetch interval string (e.g., "5m").
 */
export function logSchedulerStart(interval: string) {
	console.log(chalk.green(`Scheduler started: fetching every ${interval}`));
}

/**
 * Logs an error message for an invalid fetch interval format and exits the process.
 * @param interval - The invalid interval string from the config.
 */
export function logInvalidIntervalError(interval: string) {
	console.log(
		chalk.red(
			`Неверный формат интервала: ${interval}. Используйте "5m", "1h", или "30s".`,
		),
	);
}
