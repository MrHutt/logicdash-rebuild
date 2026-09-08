// Segment geometry + digit maps shared by the three genuinely segment-based
// digit styles on /tools/countdown-clock — VFD, LED, and LCD, the same real
// 7-segment technology differing only in material/glow. Nixie tube and
// green-phosphor Terminal are structurally different technologies (real
// font/numeral glyphs, rendered via NixieGlyphDigit.astro and
// TerminalDigit.astro respectively) and don't use this module, same as the
// split-flap style in splitFlap.ts. Deliberately independent
// from hammingGame.ts's binary bit-tile segments (SEGMENT_POINTS/
// SEGMENTS_BY_DIGIT there only define "0" and "1") — this is a full 0-9
// decimal 7-segment display for a separate, unrelated tool.

/** Standard 7-segment polygon points, same viewBox (0 0 60 100) as the site's
 *  other segmented-digit displays for a consistent tile shape. */
export const SEGMENT_POINTS: Record<string, string> = {
	a: "8,8 14,2 46,2 52,8 46,14 14,14",
	b: "52,8 58,14 58,44 52,50 46,44 46,14",
	c: "52,50 58,56 58,86 52,92 46,86 46,56",
	d: "8,92 14,86 46,86 52,92 46,98 14,98",
	e: "8,50 14,56 14,86 8,92 2,86 2,56",
	f: "8,8 14,14 14,44 8,50 2,44 2,14",
	g: "8,50 14,44 46,44 52,50 46,56 14,56",
};

/** Which segments are lit for each decimal digit 0-9. */
export const SEGMENTS_BY_DIGIT: Record<string, string[]> = {
	"0": ["a", "b", "c", "d", "e", "f"],
	"1": ["b", "c"],
	"2": ["a", "b", "g", "e", "d"],
	"3": ["a", "b", "g", "c", "d"],
	"4": ["f", "g", "b", "c"],
	"5": ["a", "f", "g", "c", "d"],
	"6": ["a", "f", "g", "e", "c", "d"],
	"7": ["a", "b", "c"],
	"8": ["a", "b", "c", "d", "e", "f", "g"],
	"9": ["a", "b", "c", "d", "f", "g"],
};

/** Toggles a digit cell's segments to display `value` — the same "set of lit
 *  segments" approach as hammingGame.ts's applyDigit(), so the clock's client
 *  script can update the display every tick without re-rendering any markup. */
export function applySegmentDigit(root: Element, value: string) {
	const active = new Set(SEGMENTS_BY_DIGIT[value] ?? []);
	root.querySelectorAll<SVGPolygonElement>(".segment").forEach((segment) => {
		const segId = segment.getAttribute("data-seg");
		segment.classList.toggle("is-on", segId !== null && active.has(segId));
	});
}

export function padTwo(n: number): string {
	return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}
