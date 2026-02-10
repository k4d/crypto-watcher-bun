/**
 * @file This is the main entry point and orchestrator for the application.
 * It coordinates the config, api, display, and scheduler modules to run the crypto watcher.
 */

import { fetchTickerData } from "@/api";
import { fetchGlobalMetrics } from "@/api/coinmarketcap";
import config from "@/config";
import { logPriceData } from "@/display";
import { logGlobalMetricsTable } from "@/display/globalMetricsDisplay";
import { logAppStart } from "@/display/logMessages";
import { startScheduler } from "@/scheduler";
import type { GlobalMetrics } from "@/types";

/**
 * The main task function that is executed on each scheduled interval.
 * It fetches the latest cryptocurrency prices and logs them to the console.
 */
async function runTask() {
	const coinSymbols = Object.keys(config.coins);
	const prices = await fetchTickerData(coinSymbols);

	if (prices) {
		await logPriceData(prices); // No globalMetrics parameter
	}
}

// --- Application Startup ---
await logAppStart();

let globalMetrics: GlobalMetrics | undefined;
if (config.cmc_api_key) {
	try {
		globalMetrics = await fetchGlobalMetrics(
			config.cmc_api_key,
			config.currency,
		);
		logGlobalMetricsTable(globalMetrics, config.currency); // Display once at startup
	} catch (error) {
		console.error("Failed to fetch global metrics:", error);
		// Continue without global metrics
	}
}

await runTask(); // Execute the task immediately on startup.
startScheduler(runTask); // Fix: Pass interval to startScheduler
