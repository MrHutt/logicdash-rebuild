// Constraint algorithm + no-repeat-neighbor history for /tools/seating-chart.
//
// Approach is deliberately "shuffle + retry with constraint scoring," not
// full backtracking — simpler to implement reliably and fast enough for
// class-sized rosters (~20-35 students). Pinned seats are placed first as a
// hard constraint (never shuffled against); keep-apart/keep-together and
// no-repeat-neighbor are scored and the lowest-violation arrangement found
// within a capped number of attempts wins.
//
// Students are identified by name rather than a synthetic id, matching the
// roster schema this tool shares with /tools/student-picker (rosterStore.ts)
// — that storage has no per-student id, and adding one would mean touching
// the picker's schema too, so rules reference students by name instead.

import { shuffle } from "./studentPicker";
import type { SeatLayout } from "./layoutEngine";

export type RuleType = "keep-apart" | "keep-together" | "pinned" | "skill-balance";

export interface Rule {
	id: string;
	type: RuleType;
	/** 2 names for keep-apart/keep-together, 1 for pinned and skill-balance. */
	studentNames: string[];
	/** 'pinned' only. */
	seatIndex?: number;
	/** 'skill-balance' only — tags the one named student's tier. */
	skillTier?: 1 | 2 | 3;
}

export type Mode = "exam" | "group" | "general";

export interface GenerateOptions {
	layout: SeatLayout;
	/** Eligible (non-absent) student names. */
	students: string[];
	mode: Mode;
	rules: Rule[];
	avoidRepeatNeighbors: boolean;
	/** Adjacency pair keys (see pairKey()) seen in recent generations. */
	recentAdjacency: Set<string>;
}

export interface GenerateResult {
	/** seatIndex -> studentName, or null for an empty seat. */
	assignments: (string | null)[];
	/** Raw, unweighted count of constraint breaks in the returned arrangement. */
	violations: number;
	satisfied: boolean;
	/** This arrangement's realized adjacency pairs, for updating history. */
	adjacencyPairs: string[];
}

const MAX_ATTEMPTS = 200;

export function pairKey(a: string, b: string): string {
	return [a, b].sort().join("|");
}

function modeWeights(mode: Mode): { keepApart: number; keepTogether: number; repeatNeighbor: number } {
	// Modes don't change the algorithm's structure, just its weighting: Exam
	// prioritizes spacing (keep-apart, no-repeat) highest; Group and General
	// treat every rule type about equally.
	if (mode === "exam") return { keepApart: 3, keepTogether: 1, repeatNeighbor: 3 };
	return { keepApart: 1, keepTogether: 1, repeatNeighbor: 1 };
}

/** Distributes tiered students round-robin across pods before randomizing
 *  within-pod order, so pods end up mixed by design rather than by scoring
 *  it after the fact. Untiered students fill whatever seats are left. */
function skillBalancedShuffle(
	students: string[],
	remainingSeats: number[],
	layout: SeatLayout,
	skillTierOf: Map<string, 1 | 2 | 3>,
): (string | null)[] {
	const seatsByPod = new Map<number, number[]>();
	for (const seat of remainingSeats) {
		const pod = layout.podOf?.[seat] ?? 0;
		if (!seatsByPod.has(pod)) seatsByPod.set(pod, []);
		seatsByPod.get(pod)!.push(seat);
	}
	const pods = Array.from(seatsByPod.keys());
	const podStudents = new Map<number, string[]>(pods.map((p) => [p, []]));

	const tiered = shuffle(students.filter((s) => skillTierOf.has(s)));
	const untiered = shuffle(students.filter((s) => !skillTierOf.has(s)));

	tiered.forEach((name, i) => {
		const preferredPod = pods[i % pods.length];
		const capacity = seatsByPod.get(preferredPod)!.length;
		const list = podStudents.get(preferredPod)!;
		if (list.length < capacity) {
			list.push(name);
			return;
		}
		const fallback = pods.find((p) => podStudents.get(p)!.length < seatsByPod.get(p)!.length);
		if (fallback !== undefined) podStudents.get(fallback)!.push(name);
	});

	let untieredIndex = 0;
	for (const pod of pods) {
		const capacity = seatsByPod.get(pod)!.length;
		const list = podStudents.get(pod)!;
		while (list.length < capacity && untieredIndex < untiered.length) list.push(untiered[untieredIndex++]);
	}

	const nameForSeat = new Map<number, string>();
	for (const pod of pods) {
		const seats = seatsByPod.get(pod)!;
		const names = shuffle(podStudents.get(pod)!);
		seats.forEach((seat, i) => {
			if (names[i]) nameForSeat.set(seat, names[i]);
		});
	}

	return remainingSeats.map((seat) => nameForSeat.get(seat) ?? null);
}

export function generateSeatingChart(opts: GenerateOptions): GenerateResult {
	const { layout, students, mode, rules, avoidRepeatNeighbors, recentAdjacency } = opts;
	const weights = modeWeights(mode);

	const keepApartRules = rules.filter((r) => r.type === "keep-apart");
	const keepTogetherRules = rules.filter((r) => r.type === "keep-together");
	// Skill-balance is ignored in Exam mode even if present, per spec.
	const skillBalanceRules = mode === "group" ? rules.filter((r) => r.type === "skill-balance") : [];

	// Pinned seats are placed first, deterministically, before any
	// shuffling — a hard constraint, not something to retry against. First
	// rule wins on a seat or student collision.
	const pinnedStudentAt = new Map<number, string>();
	const pinnedSeats = new Set<number>();
	const pinnedNames = new Set<string>();
	for (const rule of rules) {
		if (rule.type !== "pinned" || rule.seatIndex === undefined) continue;
		const name = rule.studentNames[0];
		const seat = rule.seatIndex;
		if (!name || !students.includes(name)) continue;
		if (seat < 0 || seat >= layout.seatCount) continue;
		if (pinnedSeats.has(seat) || pinnedNames.has(name)) continue;
		pinnedStudentAt.set(seat, name);
		pinnedSeats.add(seat);
		pinnedNames.add(name);
	}

	const remainingSeats: number[] = [];
	for (let s = 0; s < layout.seatCount; s++) if (!pinnedSeats.has(s)) remainingSeats.push(s);
	const remainingStudents = students.filter((name) => !pinnedNames.has(name));

	const skillTierOf = new Map<string, 1 | 2 | 3>();
	for (const rule of skillBalanceRules) {
		if (rule.skillTier && rule.studentNames[0]) skillTierOf.set(rule.studentNames[0], rule.skillTier);
	}

	function shuffleRemaining(): (string | null)[] {
		if (mode === "group" && layout.podOf && skillTierOf.size > 0) {
			return skillBalancedShuffle(remainingStudents, remainingSeats, layout, skillTierOf);
		}
		return shuffle(remainingStudents);
	}

	function scoreArrangement(assignments: (string | null)[]): { raw: number; weighted: number; pairs: string[] } {
		const seatOfStudent = new Map<string, number>();
		assignments.forEach((name, seat) => {
			if (name) seatOfStudent.set(name, seat);
		});

		let raw = 0;
		let weighted = 0;

		for (const rule of keepApartRules) {
			const [a, b] = rule.studentNames;
			const sa = seatOfStudent.get(a);
			const sb = seatOfStudent.get(b);
			if (sa === undefined || sb === undefined) continue;
			if (layout.adjacency[sa]?.includes(sb)) {
				raw++;
				weighted += weights.keepApart;
			}
		}

		for (const rule of keepTogetherRules) {
			const [a, b] = rule.studentNames;
			const sa = seatOfStudent.get(a);
			const sb = seatOfStudent.get(b);
			if (sa === undefined || sb === undefined) continue;
			if (!layout.adjacency[sa]?.includes(sb)) {
				raw++;
				weighted += weights.keepTogether;
			}
		}

		// Collect each realized adjacency pair once, for the no-repeat check
		// and for updating history after a successful generate.
		const pairs: string[] = [];
		const seen = new Set<string>();
		assignments.forEach((name, seat) => {
			if (!name) return;
			for (const neighborSeat of layout.adjacency[seat] ?? []) {
				if (neighborSeat <= seat) continue;
				const neighborName = assignments[neighborSeat];
				if (!neighborName) continue;
				const key = pairKey(name, neighborName);
				if (seen.has(key)) continue;
				seen.add(key);
				pairs.push(key);
				if (avoidRepeatNeighbors && recentAdjacency.has(key)) {
					raw++;
					weighted += weights.repeatNeighbor;
				}
			}
		});

		return { raw, weighted, pairs };
	}

	let best: { assignments: (string | null)[]; raw: number; weighted: number; pairs: string[] } | null = null;
	// No point retrying when there's nothing left to shuffle — every attempt
	// would produce the identical arrangement.
	const attempts = remainingSeats.length === 0 || remainingStudents.length === 0 ? 1 : MAX_ATTEMPTS;

	for (let attempt = 0; attempt < attempts; attempt++) {
		const shuffled = shuffleRemaining();
		const assignments: (string | null)[] = new Array(layout.seatCount).fill(null);
		pinnedStudentAt.forEach((name, seat) => {
			assignments[seat] = name;
		});
		remainingSeats.forEach((seat, i) => {
			assignments[seat] = shuffled[i] ?? null;
		});

		const { raw, weighted, pairs } = scoreArrangement(assignments);
		if (!best || weighted < best.weighted) best = { assignments, raw, weighted, pairs };
		if (raw === 0) break;
	}

	return {
		assignments: best!.assignments,
		violations: best!.raw,
		satisfied: best!.raw === 0,
		adjacencyPairs: best!.pairs,
	};
}

// --- No-repeat-neighbor history ------------------------------------------
// Stores the last few generations' adjacency pairs per roster, so a later
// generate() call can penalize repeating the same neighbor. Keyed by roster
// name (the shared roster schema has no separate id).

const HISTORY_KEY_PREFIX = "logicdash-seating-chart-history:";
const MAX_HISTORY_GENERATIONS = 3;

function historyKey(rosterName: string): string {
	return HISTORY_KEY_PREFIX + rosterName;
}

export function loadAdjacencyHistory(rosterName: string): string[][] {
	try {
		const raw = localStorage.getItem(historyKey(rosterName));
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export function pushAdjacencyHistory(rosterName: string, pairs: string[]): void {
	try {
		const history = loadAdjacencyHistory(rosterName);
		history.push(pairs);
		while (history.length > MAX_HISTORY_GENERATIONS) history.shift();
		localStorage.setItem(historyKey(rosterName), JSON.stringify(history));
	} catch {
		// Convenience feature only — see rosterStore.ts's saveRoster() comment.
	}
}

export function recentAdjacencySet(rosterName: string): Set<string> {
	return new Set(loadAdjacencyHistory(rosterName).flat());
}
