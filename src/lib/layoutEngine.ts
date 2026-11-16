// Seat layout math for /tools/seating-chart — the four templates (Rows,
// Pods, Pairs, U-Shape), each reduced to a fixed, ordered list of seat
// indices plus an adjacency list. Kept as pure functions with no DOM/storage
// concerns so both the constraint solver (seatingChart.ts) and the page's
// own rendering code build on the exact same notion of "which seats count as
// neighbors" — that logic is defined here once, not duplicated.

export type LayoutTemplate = "rows" | "pods" | "pairs" | "u-shape";

export interface LayoutConfig {
	template: LayoutTemplate;
	params: Record<string, number>;
}

export interface SeatLayout {
	template: LayoutTemplate;
	seatCount: number;
	/** adjacency[seatIndex] = the other seat indices considered "neighbors"
	 *  of that seat, for keep-apart/keep-together/no-repeat purposes. */
	adjacency: number[][];
	/** Pod index per seat — only present for the 'pods' template, used by
	 *  the group-mode skill-balance round-robin in seatingChart.ts. */
	podOf?: number[];
}

function clampInt(value: number | undefined, min: number, max: number, fallback: number): number {
	const n = Math.round(Number(value));
	if (!Number.isFinite(n)) return fallback;
	return Math.min(max, Math.max(min, n));
}

function buildRows(params: Record<string, number>): SeatLayout {
	const rows = clampInt(params.rows, 1, 12, 5);
	const cols = clampInt(params.cols, 1, 12, 6);
	const seatCount = rows * cols;
	const adjacency: number[][] = Array.from({ length: seatCount }, () => []);
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const i = r * cols + c;
			// Adjacency is same row, neighboring column only — front-to-back
			// isn't counted as "sitting next to" for keep-apart/no-repeat
			// purposes (see the spec's "front row" note: that's a future named
			// pin shortcut, not an adjacency concept).
			if (c > 0) adjacency[i].push(i - 1);
			if (c < cols - 1) adjacency[i].push(i + 1);
		}
	}
	return { template: "rows", seatCount, adjacency };
}

function buildPods(params: Record<string, number>): SeatLayout {
	const podSize = clampInt(params.podSize, 2, 8, 4);
	const podCount = clampInt(params.podCount, 1, 16, 6);
	const seatCount = podSize * podCount;
	const adjacency: number[][] = Array.from({ length: seatCount }, () => []);
	const podOf: number[] = new Array(seatCount);
	for (let p = 0; p < podCount; p++) {
		const seats = Array.from({ length: podSize }, (_, k) => p * podSize + k);
		// Everyone in a pod counts as a neighbor of everyone else in it, not
		// just left/right — a pod is one shared cluster, not a mini-row.
		for (const seat of seats) {
			podOf[seat] = p;
			adjacency[seat] = seats.filter((other) => other !== seat);
		}
	}
	return { template: "pods", seatCount, adjacency, podOf };
}

function buildPairs(params: Record<string, number>): SeatLayout {
	const pairCount = clampInt(params.pairCount, 1, 30, 12);
	const seatCount = pairCount * 2;
	const adjacency: number[][] = Array.from({ length: seatCount }, (_, i) => [i % 2 === 0 ? i + 1 : i - 1]);
	return { template: "pairs", seatCount, adjacency };
}

/** Splits a U-Shape's seats across its left arm, top row, and right arm.
 *  Exported separately from buildUShape() so the page's rendering code can
 *  lay seats out with the same split the adjacency math assumes, without
 *  duplicating the arithmetic. */
export function uShapeArms(seatCount: number): { left: number; top: number; right: number } {
	const total = Math.max(1, Math.round(seatCount));
	let side = Math.floor(total * 0.3);
	// Back off the arm length until the top row keeps at least one seat —
	// small seat counts (e.g. 3-4) end up as a straight row rather than a
	// U with an empty top, which would look broken.
	while (side > 0 && total - side * 2 < 1) side--;
	return { left: side, top: total - side * 2, right: side };
}

function buildUShape(params: Record<string, number>): SeatLayout {
	const seatCount = clampInt(params.seatCount, 3, 60, 16);
	const adjacency: number[][] = Array.from({ length: seatCount }, () => []);
	// Seats are ordered as a single path around the horseshoe: up the left
	// arm, across the top, down the right arm. A plain sequential-path
	// adjacency (no wraparound) is all that's needed — the "gap in the
	// middle front" is exactly the open mouth of the U between seat 0
	// (bottom of the left arm) and the last seat (bottom of the right arm),
	// and a path's first/last seats are never adjacent to each other unless
	// explicitly wrapped, so the gap breaks adjacency for free.
	for (let i = 0; i < seatCount - 1; i++) {
		adjacency[i].push(i + 1);
		adjacency[i + 1].push(i);
	}
	return { template: "u-shape", seatCount, adjacency };
}

export function buildLayout(config: LayoutConfig): SeatLayout {
	switch (config.template) {
		case "rows":
			return buildRows(config.params);
		case "pods":
			return buildPods(config.params);
		case "pairs":
			return buildPairs(config.params);
		case "u-shape":
			return buildUShape(config.params);
	}
}

export interface ParamField {
	key: string;
	label: string;
	min: number;
	max: number;
}

export const PARAM_FIELDS: Record<LayoutTemplate, ParamField[]> = {
	rows: [
		{ key: "rows", label: "Rows", min: 1, max: 12 },
		{ key: "cols", label: "Columns", min: 1, max: 12 },
	],
	pods: [
		{ key: "podSize", label: "Pod size", min: 2, max: 8 },
		{ key: "podCount", label: "Number of pods", min: 1, max: 16 },
	],
	pairs: [{ key: "pairCount", label: "Number of pairs", min: 1, max: 30 }],
	"u-shape": [{ key: "seatCount", label: "Total seats", min: 3, max: 60 }],
};

export function defaultParams(template: LayoutTemplate): Record<string, number> {
	switch (template) {
		case "rows":
			return { rows: 5, cols: 6 };
		case "pods":
			return { podSize: 4, podCount: 6 };
		case "pairs":
			return { pairCount: 12 };
		case "u-shape":
			return { seatCount: 16 };
	}
}

export const TEMPLATE_LABELS: Record<LayoutTemplate, string> = {
	rows: "Rows",
	pods: "Pods",
	pairs: "Pairs",
	"u-shape": "U-Shape",
};
