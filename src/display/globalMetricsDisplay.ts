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
	if (Number.isNaN(change)) return chalk.gray("N/A");
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
		{
			Metric: "ETH Dominance",
			ValueRaw: metrics.ethDominance ? metrics.ethDominance.toFixed(2) : "N/A",
			Unit: "%",
			Change: metrics.ethDominance ? metrics.ethDominanceChange24h || 0 : NaN, // Use 0 if change is not available, or NaN if ethDominance itself is not available
		},
		{
			Metric: "Others",
			ValueRaw: metrics.ethDominance
				? (100 - metrics.btcDominance - metrics.ethDominance).toFixed(2)
				: "N/A",
			Unit: "%",
			Change: metrics.ethDominance
				? 0 -
					metrics.btcDominanceChange24h -
					(metrics.ethDominanceChange24h || 0)
				: NaN, // Calculate others change as inverse of BTC+ETH change
		},
		{
			Metric: "Fear & Greed Index",
			ValueRaw: metrics.fearAndGreedIndex.toFixed(0), // F&G is usually an integer
			Unit: metrics.fearAndGreedClassification, // Classification as the unit
			Change: NaN, // No 24h change available for Fear and Greed Index on free tier
		},
	];

	// Calculate max length for the ValueRaw part (only for valid strings)
	const validValueLengths = dataForTable
		.map((item) =>
			typeof item.ValueRaw === "string" ? item.ValueRaw.length : 0,
		)
		.filter((length) => length > 0);
	const maxValueRawLen = Math.max(...validValueLengths, "Value".length);

	const finalTableData = dataForTable.map((item) => {
		return {
			Metric: chalk.blue(item.Metric),
			Value:
				typeof item.ValueRaw === "string"
					? formatCombinedValueUnit(
							item.ValueRaw,
							item.Unit,
							item.Change,
							maxValueRawLen,
						)
					: chalk.white(item.ValueRaw),
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
