import { expect, test } from "bun:test";
import { formatPrice } from "./index"; // Use relative import for test file

test("formatPrice correctly formats numbers based on magnitude", () => {
	// > 10000 -> 1 decimal
	expect(formatPrice(12345.67)).toBe("12345.7");

	// > 100 -> 2 decimals
	expect(formatPrice(1234.567)).toBe("1234.57");
	expect(formatPrice(123.456)).toBe("123.46");

	// > 1 -> 3 decimals
	expect(formatPrice(1.2345)).toBe("1.234");

	// < 1 but >= 0.01 -> 4 decimals
	expect(formatPrice(0.12345)).toBe("0.1235");

	// < 0.01 -> 5 decimals
	expect(formatPrice(0.0012345)).toBe("0.00123");
});
