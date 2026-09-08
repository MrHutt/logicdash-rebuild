// Coarse 4x6 dot-matrix digit patterns for /tools/countdown-clock's "Dot
// Matrix" Display Style — a low-res, chunky-pixel LCD phone-screen look.
// Deliberately a LOWER resolution than the Terminal style's rendering (which
// uses a real bitmap-style font, VT323, via TerminalDigit.astro) so the two
// "dot matrix"-sounding styles are genuinely different techniques — a
// manually-toggled grid of a handful of big square pixels here, vs a
// proper high-detail character-ROM font glyph there — rather than the same
// shapes in different colors. Each pattern is 6 rows of a 4-character
// "1"/"0" string (1 = lit pixel).

export const DOT_MATRIX_COLS = 4;
export const DOT_MATRIX_ROWS = 6;

export const DOT_MATRIX_DIGITS: Record<string, string[]> = {
	"0": ["0110", "1001", "1001", "1001", "1001", "0110"],
	"1": ["0010", "0110", "0010", "0010", "0010", "0111"],
	"2": ["0110", "1001", "0001", "0010", "0100", "1111"],
	"3": ["1110", "0001", "0110", "0001", "0001", "1110"],
	"4": ["0010", "0110", "1010", "1111", "0010", "0010"],
	"5": ["1111", "1000", "1110", "0001", "0001", "1110"],
	"6": ["0110", "1000", "1110", "1001", "1001", "0110"],
	"7": ["1111", "0001", "0010", "0100", "0100", "0100"],
	"8": ["0110", "1001", "0110", "1001", "1001", "0110"],
	"9": ["0110", "1001", "0111", "0001", "0001", "0110"],
};

/** Flat list of on/off booleans for a digit, in row-major order — matches
 *  the order DotMatrixDigit.astro renders its `.dmx-dot` grid in. */
export function dotsFor(value: string): boolean[] {
	const pattern = DOT_MATRIX_DIGITS[value] ?? DOT_MATRIX_DIGITS["0"];
	return pattern.flatMap((row) => row.split("").map((bit) => bit === "1"));
}
