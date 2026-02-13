/**
 * @file This component logs a simple application startup message with the version number.
 */
import chalk from "chalk";
import pkg from "../../package.json";

/**
 * Logs the application startup message to the console, including the version number.
 * This is a simplified startup message without ASCII art.
 */
export async function AppStartMessage() {
	console.log(chalk.green(`Crypto Watcher v${pkg.version} started.`));
}
