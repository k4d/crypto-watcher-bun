/**
 * @file Component for logging the scheduler start message.
 */
import chalk from "chalk";

/**
 * Logs the message indicating that the scheduler has started.
 * @param interval - The fetch interval string (e.g., "5m").
 */
export function SchedulerStart(interval: string) {
	console.log(chalk.green(`Scheduler started: fetching every ${interval}.`));
}
