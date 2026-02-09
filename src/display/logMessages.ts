/**
 * @file This module contains simple logging functions for application events.
 */
import chalk from "chalk";
import figlet from "figlet";
import pkg from "../../package.json";

const fontResource = Bun.file("./node_modules/figlet/fonts/Slant.flf");

/**
 * Logs the initial application startup message, including the version number.
 */
export async function logAppStart() {
	const asciiText = "Z Crypto Watcher";
	const fontData = await fontResource.text();
	figlet.parseFont("Slant", fontData);

	const asciiArt = figlet.textSync(asciiText, {
		font: "Slant",
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
