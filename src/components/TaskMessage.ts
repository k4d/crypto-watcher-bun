/**
 * @file Component for logging the task run message with a timestamp.
 */
import chalk from "chalk";

/**
 * Logs a message indicating when a task run has started, including a run count.
 * @param runCount The number of times the task has been executed.
 */
export function TaskMessage(runCount: number) {
	console.log(
		chalk.gray(
			`
[${runCount}] Task run at ${new Date().toLocaleTimeString()}`,
		),
	);
}
