/**
 * @file This module contains utility functions for formatting display output.
 */

/**
 * Formats a given price number to a string with appropriate decimal places
 * based on its magnitude for better readability.
 * - For prices > 10000, uses 1 decimal place.
 * - For prices > 100, uses 2 decimal places.
 * - For prices > 1, uses 3 decimal places.
 * - For prices < 1 but >= 0.01, uses 4 decimal places.
 * - For prices < 0.01, uses 5 decimal places.
 * @param price The price number to format.
 * @returns The formatted price as a string.
 */
export function formatPrice(price: number): string {
	if (price > 10000) return price.toFixed(1);
	if (price > 100) return price.toFixed(2);
	if (price > 1) return price.toFixed(3);
	if (price < 0.01) return price.toFixed(5);
	return price.toFixed(4);
}
