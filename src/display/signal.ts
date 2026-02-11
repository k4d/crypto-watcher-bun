import chalk from "chalk";

/**
 * Generates trading signals based on multiple indicators and price movements
 * @param change15m Percentage change over 15 minutes
 * @param change30m Percentage change over 30 minutes
 * @param currentPrice Current price of the coin
 * @param high24h 24-hour high price
 * @param low24h 24-hour low price
 * @returns Colored signal string ("Buy", "Sell", "Neutral", etc.)
 */
export function generateSignal(
	change15m: number,
	change30m: number,
	currentPrice: number,
	high24h: number,
	low24h: number,
): string {
	// Calculate RSI-like indicator based on position within 24h range
	const priceRange = high24h - low24h;
	const rsiLike =
		priceRange !== 0 ? 100 - (100 * (high24h - currentPrice)) / priceRange : 50; // Neutral if range is 0

	const isOverbought = rsiLike > 70;
	const isOversold = rsiLike < 30;

	// Trend strength based on multiple timeframes
	const shortTermTrend = change15m;
	const mediumTermTrend = change30m;
	const trendConsistency =
		Math.sign(shortTermTrend) === Math.sign(mediumTermTrend);

	// Momentum indicator
	const momentum = Math.abs(change15m - change30m);
	const highMomentum = momentum > 1.0;

	// Generate signal based on combination of factors
	if (trendConsistency && shortTermTrend > 1 && mediumTermTrend > 0.5) {
		// Consistent positive trend with momentum
		if (isOverbought) {
			// Overbought but trending up - potential reversal or strong momentum
			return chalk.yellow.bold("Hold*"); // Hold with caution due to overbought condition
		} else {
			return chalk.green.bold("Buy");
		}
	} else if (
		trendConsistency &&
		shortTermTrend < -1 &&
		mediumTermTrend < -0.5
	) {
		// Consistent negative trend with momentum
		if (isOversold) {
			// Oversold but trending down - potential reversal or continued decline
			return chalk.yellow.bold("Wait*"); // Wait with caution due to oversold condition
		} else {
			return chalk.red.bold("Sell");
		}
	} else if (highMomentum) {
		// High momentum but inconsistent trends - potential reversal
		if (shortTermTrend > 1.5) {
			return chalk.green("Buy?");
		} else if (shortTermTrend < -1.5) {
			return chalk.red("Sell?");
		} else {
			return chalk.yellow("Wait?");
		}
	} else if (isOversold && shortTermTrend > 0.3) {
		// Oversold but showing early signs of recovery
		return chalk.green("Buy?");
	} else if (isOverbought && shortTermTrend < -0.3) {
		// Overbought but showing early signs of decline
		return chalk.red("Sell?");
	} else if (
		Math.abs(shortTermTrend) < 0.5 &&
		Math.abs(mediumTermTrend) < 0.5
	) {
		// Very low movement - likely ranging
		return chalk.gray("Neutral");
	} else {
		// Mixed signals or weak trends
		return chalk.blue("Watch");
	}
}

/**
 * Simple signal generation based on basic trend analysis
 * @param change15m Percentage change over 15 minutes
 * @param change30m Percentage change over 30 minutes
 * @returns Colored signal string ("Buy", "Sell", "Neutral")
 */
export function generateSimpleSignal(
	change15m: number,
	change30m: number,
): string {
	if (change15m > 1 && change30m > 1) {
		return chalk.green.bold("Buy");
	} else if (change15m < -1 && change30m < -1) {
		return chalk.red.bold("Sell");
	} else {
		return chalk.gray("Neutral");
	}
}
