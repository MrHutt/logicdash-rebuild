// Shared decimal-to-binary math for the "Writing a Byte" page — the worked
// examples, the interactive converter, and the practice quiz all derive from
// these same functions so the division steps, formatting, and final binary
// string can never drift out of sync with each other.

export interface DivisionStep {
	dividend: number;
	quotient: number;
	remainder: 0 | 1;
}

/** Repeatedly divides by 2, top to bottom, the way you'd work it by hand. */
export function computeDivisionSteps(n: number): DivisionStep[] {
	if (n <= 0) return [{ dividend: 0, quotient: 0, remainder: 0 }];

	const steps: DivisionStep[] = [];
	let dividend = n;
	while (dividend > 0) {
		const quotient = Math.floor(dividend / 2);
		const remainder = (dividend % 2) as 0 | 1;
		steps.push({ dividend, quotient, remainder });
		dividend = quotient;
	}
	return steps;
}

/** Reads the remainders bottom to top — the actual "convert to binary" step. */
export function binaryFromSteps(steps: DivisionStep[]): string {
	const bits = steps
		.map((s) => s.remainder)
		.reverse()
		.join("");
	return bits || "0";
}

/** The site's standard 8-tile byte representation, zero-padded on the left. */
export function decimalToBinary8(n: number): string {
	return Math.max(0, Math.min(255, n)).toString(2).padStart(8, "0");
}

/**
 * Renders the division steps as the aligned plain-text block used in the
 * worked examples, e.g.:
 *   13 ÷ 2 = 6  remainder 1
 *    6 ÷ 2 = 3  remainder 0
 * Each column is padded to its own widest value, matching how you'd
 * naturally write this out by hand.
 */
export function formatDivisionText(steps: DivisionStep[]): string {
	const dividendWidth = Math.max(...steps.map((s) => String(s.dividend).length));
	const quotientWidth = Math.max(...steps.map((s) => String(s.quotient).length));
	return steps
		.map(
			(s) =>
				`${String(s.dividend).padStart(dividendWidth)} ÷ 2 = ${String(s.quotient).padStart(quotientWidth)}  remainder ${s.remainder}`,
		)
		.join("\n");
}

/** [128, 64, 32, ...] for the given bit-string length. */
export function placeValuesForLength(length: number): number[] {
	return Array.from({ length }, (_, i) => 2 ** (length - 1 - i));
}
