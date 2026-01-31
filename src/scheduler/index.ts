/**
 * @file This module handles the scheduling of recurring tasks using node-cron.
 */

import cron from "node-cron";
import config from "@/config";
import { logInvalidIntervalError, logSchedulerStart } from "@/display";

/**
 * Sets up and starts a cron job based on the interval specified in the configuration.
 * @param task The function to be executed on each scheduled interval.
 */
export function startScheduler(task: () => void) {
	// Parses the fetch_interval from the configuration and sets up a cron job.
	const interval = config.fetch_interval; // e.g., "30s", "5m", "1h"
	const intervalMatch = interval.match(/^(\d+)([smh])$/); // Regex to parse value and unit

	if (intervalMatch) {
		const [, valueStr, unit] = intervalMatch;

		if (valueStr && unit) {
			const value = parseInt(valueStr, 10); // Numeric value of the interval

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
		}
	} else {
		// Handles cases where the interval format in config.yml is invalid.
		logInvalidIntervalError(interval);
		process.exit(1); // Exit if interval format is invalid
	}
}
