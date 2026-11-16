// Shared types and helpers for the pseudocode practice engine.
import type { Facing } from "./interpreter";

export type Topic = "variables" | "arithmetic" | "boolean" | "selection" | "iteration" | "lists" | "procedures" | "robots";
export type Level = "easy" | "medium" | "challenging";
export type QType = "output" | "final-state" | "missing" | "error" | "choose-code" | "bug-input" | "compare" | "input" | "concept";

export const TOPICS: Topic[] = ["variables", "arithmetic", "boolean", "selection", "iteration", "lists", "procedures", "robots"];
export const LEVELS: Level[] = ["easy", "medium", "challenging"];

export const TOPIC_LABELS: Record<Topic, string> = {
	variables: "Variables & output",
	arithmetic: "Arithmetic & MOD",
	boolean: "Boolean logic",
	selection: "Selection",
	iteration: "Iteration",
	lists: "Lists",
	procedures: "Procedures",
	robots: "Robots",
};

export const LEVEL_LABELS: Record<Level, string> = { easy: "Easy", medium: "Medium", challenging: "Challenging" };
export const LEVEL_HINTS: Record<Level, string> = {
	easy: "One idea, short code",
	medium: "Two ideas, more to track",
	challenging: "Several ideas, edge cases",
};

export const TYPE_LABELS: Record<QType, string> = {
	output: "Predict the output",
	"final-state": "Final state",
	missing: "Missing code",
	error: "Spot the error",
	"choose-code": "Choose the code",
	"bug-input": "Find the bug",
	compare: "Compare code",
	input: "Find an input",
	concept: "Concept",
};

export interface Grid {
	rows: string[]; // "." open, "#" blocked, "A"–"D" labelled open squares
	robot: { row: number; col: number; facing: Facing };
}

export interface Option {
	text: string;
	correct: boolean;
	/** Shown when this (wrong) option is chosen: the likely misconception. */
	why?: string;
	/** Options that are whole code segments are shown as code. */
	code?: boolean;
}

/** What "Show trace" runs: usually the question's own code. */
export interface TraceSpec {
	code: string;
	grid?: Grid;
	inputs?: string[];
	/** Shown above the trace, e.g. "Tracing the code with the correct line filled in". */
	note?: string;
}

export interface Question {
	id: string; // stable: "<templateId>#<seed>" or a fixed bank ID
	source: string; // template ID, or fixed bank ID — used to avoid repeats
	group: string; // structure group: questions in one group count as one structure
	seed: number | null;
	topic: Topic; // main topic
	topics: Topic[];
	skill: string; // skill tag used for review and progress
	level: Level;
	type: QType;
	prompt: string;
	code?: string;
	grid?: Grid;
	options: Option[]; // exactly 4, exactly one correct
	explanation: string;
	trace: TraceSpec | null;
	/** Keep options in the given order (e.g. squares A–D, directions) instead of shuffling. */
	fixedOrder?: boolean;
}

export interface Template {
	id: string;
	topic: Topic;
	topics?: Topic[];
	skill: string;
	level: Level;
	type: QType;
	/** One-line description of the structure, for the coverage report. */
	structure: string;
	build(r: Rng): Omit<Question, "id" | "source" | "group" | "seed" | "topic" | "topics" | "skill" | "level" | "type">;
}

// ---------------------------------------------------------------------------
// Seeded random numbers (mulberry32): the same seed always builds the same question.

export class Rng {
	private s: number;
	constructor(seed: number) {
		this.s = seed >>> 0 || 1;
	}
	next(): number {
		let t = (this.s += 0x6d2b79f5);
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	}
	int(a: number, b: number): number {
		return a + Math.floor(this.next() * (b - a + 1));
	}
	pick<T>(items: readonly T[]): T {
		return items[Math.floor(this.next() * items.length)];
	}
	shuffle<T>(items: readonly T[]): T[] {
		const a = [...items];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(this.next() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}
	/** n distinct integers from a..b. */
	distinct(n: number, a: number, b: number): number[] {
		const out = new Set<number>();
		while (out.size < n) out.add(this.int(a, b));
		return [...out];
	}
	bool(): boolean {
		return this.next() < 0.5;
	}
}

// ---------------------------------------------------------------------------
// Options

export interface Distractor {
	text: string;
	why?: string;
}

/**
 * The correct answer plus up to three distractors, in that priority order.
 * Distractors that duplicate the answer (or each other) are dropped, and
 * fillers are used to reach four. Throws if four distinct options can't be
 * made — the caller then rerolls with a different seed.
 */
export function options(correct: string, distractors: Distractor[], fillers: string[] = [], code = false): Option[] {
	const out: Option[] = [{ text: correct, correct: true, code }];
	const seen = new Set([correct]);
	for (const d of [...distractors, ...fillers.map((text) => ({ text }))]) {
		if (out.length === 4) break;
		if (seen.has(d.text)) continue;
		seen.add(d.text);
		out.push({ text: d.text, correct: false, why: (d as Distractor).why, code });
	}
	if (out.length < 4) throw new Error("Not enough distinct options");
	return out;
}

export const listText = (l: (number | string | boolean)[]) => `[${l.join(", ")}]`;
export const say = (n: number) => String(Math.round(n * 1e9) / 1e9);
