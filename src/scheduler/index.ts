import cron from "node-cron";
import config from "../config";
import { logSchedulerStart, logInvalidIntervalError } from "../display";

// This function sets up and starts the cron job for a given task.
export function startScheduler(task: () => void) {
	const interval = config.fetch_interval; // e.g., "30s", "5m", "1h"
	const intervalMatch = interval.match(/^(\d+)([smh])$/); // Regex to parse value and unit

	if (intervalMatch) {
		const value = parseInt(intervalMatch[1], 10); // Numeric value of the interval
		const unit = intervalMatch[2]; // Unit of the interval (s, m, h)

		let cronSchedule: string;
		// Determines the cron schedule string based on the unit
		if (unit === "s") {
			cronSchedule = `*/${value} * * * * *`; // Every 'value' seconds
		} else if (unit === "m") {
			cronSchedule = `0 */${value} * * * *`; // At second 0, every 'value' minutes
		} else if (unit === "h") {
			cronSchedule = `0 0 */${value} * * *`; // At second 0, minute 0, every 'value' hours
		} else {
			// This case is unlikely due to the regex, but it's a safeguard.
			logInvalidIntervalError(interval);
			process.exit(1); // Exit if interval format is unsupported
		}

		// Schedule the provided task using the generated cron schedule.
		cron.schedule(cronSchedule, task);
		logSchedulerStart(interval);
	} else {
		// Handles cases where the interval format in config.yml is invalid.
		logInvalidIntervalError(interval);
		process.exit(1); // Exit if interval format is invalid
	}
}
