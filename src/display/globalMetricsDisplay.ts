/**
 * @file This module contains functions specifically for formatting and logging global cryptocurrency metrics.
 */

import type { GlobalMetrics } from "@/types";

/**
 * Helper to format large numbers for market cap/volume.
 */
function formatCurrency(num: number): string {
	if (num >= 1_000_000_000_000)
		return `${(num / 1_000_000_000_000).toFixed(2)}T`;
	if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
	if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
	return num.toFixed(2);
}

/**
 * Logs global cryptocurrency metrics in a formatted table.
 * @param metrics The global metrics object.
 * @param currency The base currency for display.
 */
export function logGlobalMetricsTable(
	metrics: GlobalMetrics,
	currency: string,
) {
	const tableData = {
		"Total Market Cap": `${formatCurrency(metrics.totalMarketCap)} ${currency}`,
		"24h Volume": `${formatCurrency(metrics.totalVolume24h)} ${currency}`,
		"BTC Dominance": `${metrics.btcDominance.toFixed(2)}%`,
	};

	console.table(tableData);
}
