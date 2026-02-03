/**
 * @file This is the main entry point and orchestrator for the application.
 * It coordinates the config, api, display, and scheduler modules to run the crypto watcher.
 */

import { fetchTickerData } from "@/api";
import config from "@/config";
import { logAppStart, logPriceData } from "@/display";
import { startScheduler } from "@/scheduler";

/**
 * The main task function that is executed on each scheduled interval.
 * It fetches the latest cryptocurrency prices and logs them to the console.
 */
async function runTask() {
	const coinSymbols = Object.keys(config.coins);
	const prices = await fetchTickerData(coinSymbols);

	if (prices) {
		await logPriceData(prices);
	}
}

// --- Application Startup ---
logAppStart();
await runTask(); // Execute the task immediately on startup.
startScheduler(runTask); // Set up and start the recurring task scheduler.
