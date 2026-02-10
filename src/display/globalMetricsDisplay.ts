/**
 * @file This module contains functions specifically for formatting and logging global cryptocurrency metrics.
 */

import chalk from "chalk";
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

// New helper function for color-coding the change percentage
function formatChangePercentage(change: number): string {
	if (change > 0) return chalk.green(`▲ +${change.toFixed(2)}%`);
	if (change < 0) return chalk.red(`▼ ${change.toFixed(2)}%`);
	return chalk.white(`  ${change.toFixed(2)}%`);
}

// New helper function for color-coding the value itself based on change
function formatValueWithChangeColor(value: string, change: number): string {
	if (change > 0) return chalk.green(value);
	if (change < 0) return chalk.red(value);
	return chalk.white(value); // Neutral color
}

/**
 * Logs global cryptocurrency metrics in a formatted table.
 * @param metrics The global metrics object.
 * @param currency The base currency for display.
 */
// New helper function to format the combined Value and Unit string with padding and color
function formatCombinedValueUnit(
	value: string,
	unit: string,
	change: number,
	maxValueLen: number,
): string {
	const formattedValue = value.padEnd(maxValueLen); // Right align the value part
	const coloredUnit = chalk.yellow(unit); // Apply yellow color to the unit
	const combinedString = `${formattedValue} ${coloredUnit}`;
	return formatValueWithChangeColor(combinedString, change);
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
	const dataForTable = [
		{
			Metric: "Total Market Cap",
			ValueRaw: formatCurrency(metrics.totalMarketCap),
			Unit: currency,
			Change: metrics.totalMarketCapChange24h,
		},
		{
			Metric: "24h Volume",
			ValueRaw: formatCurrency(metrics.totalVolume24h),
			Unit: currency,
			Change: metrics.totalVolume24hChange24h,
		},
		{
			Metric: "BTC Dominance",
			ValueRaw: metrics.btcDominance.toFixed(2),
			Unit: "%",
			Change: metrics.btcDominanceChange24h,
		},
	];

	// Calculate max length for the ValueRaw part
	const maxValueRawLen = Math.max(
		...dataForTable.map((item) => item.ValueRaw.length),
		"Value".length,
	);

	const finalTableData = dataForTable.map((item) => {
		return {
			Metric: chalk.blue(item.Metric),
			Value: formatCombinedValueUnit(
				item.ValueRaw,
				item.Unit,
				item.Change,
				maxValueRawLen,
			),
			"24h Change": formatChangePercentage(item.Change),
		};
	});

	if (finalTableData.length > 0) {
		const tableObject: { [key: number]: unknown } = {};
		finalTableData.forEach((row, index) => {
			tableObject[index + 1] = row;
		});
		console.table(tableObject);
	}
}
