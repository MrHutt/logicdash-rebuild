// Scheduling for /learn/pseudocode-practice — an endless, random practice
// loop rather than a fixed quiz:
//
// - Missed questions are requeued, not dropped: they come back after a short
//   gap (2–4 other questions) and keep coming back until answered correctly.
// - Correct answers are deprioritized, not removed: their weight drops, then
//   recovers a little every question, so they can still reappear later.
// - No score — just a streak of correct answers in a row, with milestones at
//   powers of two (2, 4, 8, 16, …).
//
// Pure functions over a plain JSON-able state object, so the page can save
// it to localStorage and this logic can be tested on its own.
import type { PseudoCategory, PseudoLevel, PseudoQuestion } from "./pseudocodeQuestions";

export interface QuestionProgress {
	/** Relative chance of being picked (1 = normal). */
	weight: number;
	/** Set after a miss: questions until it comes back. null = not waiting. */
	dueIn: number | null;
}

export interface PracticeState {
	version: 2;
	progress: Record<string, QuestionProgress>;
	streak: number;
	best: number;
	answered: number;
	/** Most recently shown IDs, newest last — avoids immediate repeats. */
	recent: string[];
	/** Topics the student has switched on. */
	categories: PseudoCategory[];
	/** Difficulty the student has chosen. */
	level: PseudoLevel;
	/** Best streak reached on each level. */
	bestByLevel: Partial<Record<PseudoLevel, number>>;
}

const CORRECT_WEIGHT = 0.2; // how far a correct answer drops a question
const RECOVERY_PER_QUESTION = 0.08; // how fast it climbs back towards 1
const REQUEUE_MIN = 2; // a missed question returns after this many others…
const REQUEUE_SPREAD = 3; // …plus 0–2 more, so it isn't predictable
const RECENT_LENGTH = 3;

export function freshState(categories: PseudoCategory[], level: PseudoLevel = "easy"): PracticeState {
	return {
		version: 2,
		progress: {},
		streak: 0,
		best: 0,
		answered: 0,
		recent: [],
		categories: [...categories],
		level,
		bestByLevel: {},
	};
}

function progressFor(state: PracticeState, id: string): QuestionProgress {
	return state.progress[id] ?? { weight: 1, dueIn: null };
}

/**
 * Questions at the chosen level that touch at least one switched-on topic.
 * (Most medium/challenging questions combine topics, so "touches any" keeps
 * a narrow topic choice from emptying the pool.) Falls back to the whole
 * level if the topic choice matches nothing.
 */
export function eligibleQuestions(state: PracticeState, questions: PseudoQuestion[]): PseudoQuestion[] {
	const atLevel = questions.filter((q) => q.level === state.level);
	const inTopics = atLevel.filter((q) => q.topics.some((t) => state.categories.includes(t)));
	if (inTopics.length > 0) return inTopics;
	return atLevel.length > 0 ? atLevel : questions;
}

/** Missed questions currently waiting to come back. */
export function waitingCount(state: PracticeState, questions: PseudoQuestion[]): number {
	return eligibleQuestions(state, questions).filter((q) => progressFor(state, q.id).dueIn !== null).length;
}

export function pickNext(state: PracticeState, questions: PseudoQuestion[], random: () => number = Math.random): PseudoQuestion {
	const eligible = eligibleQuestions(state, questions);
	const last = state.recent[state.recent.length - 1];

	// 1. A missed question whose gap is up comes back first (most overdue wins).
	const due = eligible
		.filter((q) => q.id !== last)
		.map((q) => ({ q, p: progressFor(state, q.id) }))
		.filter(({ p }) => p.dueIn !== null && p.dueIn <= 0)
		.sort((a, b) => a.p.dueIn! - b.p.dueIn!);
	if (due.length > 0) return due[0].q;

	// 2. Otherwise a weighted random pick, skipping the last few shown and any
	//    missed question that's still waiting out its gap.
	const avoid = new Set(state.recent.slice(-Math.min(RECENT_LENGTH, eligible.length - 1)));
	let pool = eligible.filter((q) => !avoid.has(q.id) && progressFor(state, q.id).dueIn === null);
	if (pool.length === 0) pool = eligible.filter((q) => q.id !== last);
	if (pool.length === 0) pool = eligible;

	const weights = pool.map((q) => Math.max(0.01, progressFor(state, q.id).weight));
	const total = weights.reduce((a, b) => a + b, 0);
	let roll = random() * total;
	for (let i = 0; i < pool.length; i++) {
		roll -= weights[i];
		if (roll <= 0) return pool[i];
	}
	return pool[pool.length - 1];
}

/** Records that a question was shown (call when it appears). */
export function markShown(state: PracticeState, id: string): PracticeState {
	const recent = [...state.recent.filter((r) => r !== id), id].slice(-RECENT_LENGTH);
	return { ...state, recent };
}

export interface AnswerResult {
	state: PracticeState;
	/** Set when this answer hit a power-of-two streak (2, 4, 8, …). */
	milestone: number | null;
}

export function recordAnswer(
	state: PracticeState,
	id: string,
	correct: boolean,
	random: () => number = Math.random,
): AnswerResult {
	const progress: Record<string, QuestionProgress> = {};

	// Every *other* question moves one step: waiting ones get closer to
	// coming back, deprioritized ones recover a little weight.
	for (const [otherId, p] of Object.entries(state.progress)) {
		if (otherId === id) continue;
		progress[otherId] = {
			weight: Math.min(1, p.weight + RECOVERY_PER_QUESTION),
			dueIn: p.dueIn === null ? null : p.dueIn - 1,
		};
	}

	progress[id] = correct
		? { weight: CORRECT_WEIGHT, dueIn: null }
		: { weight: 1, dueIn: REQUEUE_MIN + Math.floor(random() * REQUEUE_SPREAD) };

	const streak = correct ? state.streak + 1 : 0;
	return {
		state: {
			...state,
			progress,
			streak,
			best: Math.max(state.best, streak),
			bestByLevel: { ...state.bestByLevel, [state.level]: Math.max(state.bestByLevel[state.level] ?? 0, streak) },
			answered: state.answered + 1,
		},
		milestone: correct && isPowerOfTwoMilestone(streak) ? streak : null,
	};
}

export function isPowerOfTwoMilestone(n: number): boolean {
	return n >= 2 && (n & (n - 1)) === 0;
}

/** Switching level starts a fresh streak (a streak belongs to one level). */
export function setLevel(state: PracticeState, level: PseudoLevel): PracticeState {
	return level === state.level ? state : { ...state, level, streak: 0, recent: [] };
}

/**
 * Loose validation for state read back from localStorage. Version 1 saves
 * (before levels existed) are upgraded in place: their question history is
 * kept, and they start on Easy.
 */
export function loadPracticeState(value: unknown): PracticeState | null {
	if (!value || typeof value !== "object") return null;
	const v = value as Partial<PracticeState> & { version?: number };
	const valid =
		(v.version === 1 || v.version === 2) &&
		typeof v.progress === "object" &&
		v.progress !== null &&
		typeof v.streak === "number" &&
		typeof v.best === "number" &&
		typeof v.answered === "number" &&
		Array.isArray(v.recent) &&
		Array.isArray(v.categories);
	if (!valid) return null;
	const levelOk = v.level === "easy" || v.level === "medium" || v.level === "challenging";
	return {
		...(v as PracticeState),
		version: 2,
		level: levelOk ? v.level! : "easy",
		bestByLevel: v.bestByLevel && typeof v.bestByLevel === "object" ? v.bestByLevel : {},
	};
}
