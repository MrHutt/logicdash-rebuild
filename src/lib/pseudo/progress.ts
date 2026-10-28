// Practice state, question choice, review and progress for Pseudocode Practice.
// Pure functions over a JSON-able state object (saved in localStorage by the
// page), so this logic can be tested on its own.
import { FIXED, TEMPLATES, generate, questionById } from "./bank";
import { LEVELS, TOPICS, type Level, type QType, type Question, type Topic } from "./core";

export const STORAGE_KEY = "logicdash:pseudocode-practice:v1"; // unchanged, so old saves are found and migrated

/** Configurable progression rules. */
export const RULES = {
	readyWindow: 10, // look at the last N eligible first attempts…
	readyCorrect: 8, // …and need at least this many correct…
	readyDistinct: 3, // …across at least this many different question structures
	struggleCorrect: 3, // ≤ this many right in the window → suggest an easier level
	checkpointEvery: 10,
	reviewGapMin: 2, // a missed skill comes back after 2–3 other questions
	reviewGapSpread: 2,
	maxAttempts: 600,
};

export type Route = "topic" | "mixed" | "review";
export interface Settings {
	route: Route;
	topic: Topic;
	level: Level;
}

export interface Attempt {
	id: string;
	source: string;
	group: string;
	topics: Topic[];
	topic: Topic;
	skill: string;
	level: Level;
	type: QType;
	correct: boolean;
	/** A re-ask from the review queue — excluded from readiness. */
	review: boolean;
	t: number;
}

export interface ReviewItem {
	skill: string;
	topic: Topic;
	level: Level;
	type: QType;
	source: string;
	failedId: string;
	dueIn: number;
}

export interface State {
	version: 3;
	settings: Settings | null;
	attempts: Attempt[];
	review: ReviewItem[];
	streak: number;
	best: number;
	bestByLevel: Partial<Record<Level, number>>;
	setStart: number;
	recentGroups: string[];
	adviceDismissedAt: number;
	/** Questions answered before this version (kept from older saves). */
	legacyAnswered: number;
}

export function freshState(): State {
	return {
		version: 3,
		settings: null,
		attempts: [],
		review: [],
		streak: 0,
		best: 0,
		bestByLevel: {},
		setStart: 0,
		recentGroups: [],
		adviceDismissedAt: -Infinity,
		legacyAnswered: 0,
	};
}

// ---------------------------------------------------------------------------
// Loading and migrating saved progress

const LEGACY_CATEGORY: Record<string, Topic> = {
	"Variables & display": "variables",
	"Arithmetic & MOD": "arithmetic",
	"Boolean logic": "boolean",
	Selection: "selection",
	Iteration: "iteration",
	Lists: "lists",
	Procedures: "procedures",
	Robot: "robots",
};

const isLevel = (v: unknown): v is Level => LEVELS.includes(v as Level);
const isTopic = (v: unknown): v is Topic => TOPICS.includes(v as Topic);

/**
 * Reads anything found in storage. Version 3 is checked and repaired;
 * versions 1–2 are migrated (streaks, best streaks and level kept; questions
 * that were waiting to come back become review items). Unknown data → null.
 */
export function loadState(value: unknown): State | null {
	if (!value || typeof value !== "object") return null;
	const v = value as Record<string, unknown>;
	if (v.version === 3) {
		const s = { ...freshState(), ...(v as Partial<State>) } as State;
		s.attempts = Array.isArray(s.attempts) ? s.attempts.filter((a) => a && isTopic(a.topic) && isLevel(a.level)) : [];
		s.review = Array.isArray(s.review) ? s.review.filter((r) => r && isTopic(r.topic) && isLevel(r.level)) : [];
		if (s.settings && !(isTopic(s.settings.topic) && isLevel(s.settings.level))) s.settings = null;
		s.setStart = Math.min(s.setStart ?? 0, s.attempts.length);
		if (typeof s.adviceDismissedAt !== "number") s.adviceDismissedAt = -Infinity;
		return s;
	}
	if (v.version === 1 || v.version === 2) {
		const s = freshState();
		s.streak = typeof v.streak === "number" ? v.streak : 0;
		s.best = typeof v.best === "number" ? v.best : 0;
		s.bestByLevel = v.bestByLevel && typeof v.bestByLevel === "object" ? (v.bestByLevel as State["bestByLevel"]) : {};
		s.legacyAnswered = typeof v.answered === "number" ? v.answered : 0;
		const level: Level = isLevel(v.level) ? v.level : "easy";
		const cats = Array.isArray(v.categories) ? (v.categories as string[]) : [];
		const topic = cats.length === 1 && LEGACY_CATEGORY[cats[0]] ? LEGACY_CATEGORY[cats[0]] : "variables";
		s.settings = { route: cats.length === 1 ? "topic" : "mixed", topic, level };
		const progress = (v.progress ?? {}) as Record<string, { dueIn: number | null }>;
		for (const [id, p] of Object.entries(progress)) {
			if (!p || p.dueIn === null || p.dueIn === undefined) continue;
			const q = questionById(id);
			if (q) s.review.push(reviewItemFor(q, Math.max(0, p.dueIn)));
		}
		return s;
	}
	return null;
}

function reviewItemFor(q: Question, dueIn: number): ReviewItem {
	return { skill: q.skill, topic: q.topic, level: q.level, type: q.type, source: q.source, failedId: q.id, dueIn };
}

// ---------------------------------------------------------------------------
// Choosing the next question

const inScope = (s: Settings, q: { topics: Topic[]; topic: Topic; level: Level }) =>
	q.level === s.level && (s.route !== "topic" || q.topics.includes(s.topic));

/** Number of distinct structures available for a scope (templates + fixed groups). */
export function poolSize(s: Settings): number {
	const groups = new Set<string>();
	for (const t of TEMPLATES) if (inScope(s, { topics: [t.topic, ...(t.topics ?? [])], topic: t.topic, level: t.level })) groups.add(t.id);
	for (const q of FIXED) if (inScope(s, q)) groups.add(q.group);
	return groups.size;
}

export interface Pick {
	question: Question;
	review: ReviewItem | null;
}

/** Review items that the current settings can serve. */
export function reviewFor(state: State, s: Settings | null): ReviewItem[] {
	if (!s || s.route === "review") return state.review;
	return state.review.filter((r) => r.level === s.level && (s.route !== "topic" || r.topic === s.topic));
}

function newSeed(random: () => number) {
	return Math.floor(random() * 2 ** 31);
}

/** A different example of the same skill: a fresh seed of the same template, or another fixed question like it. */
function anotherExample(item: ReviewItem, random: () => number): Question {
	const t = TEMPLATES.find((x) => x.id === item.source);
	if (t) {
		for (let k = 0; k < 5; k++) {
			const q = generate(t.id, newSeed(random));
			if (q.id !== item.failedId) return q;
		}
	}
	const same = FIXED.filter((q) => q.id !== item.failedId && q.skill === item.skill && q.level === item.level);
	if (same.length) return same[Math.floor(random() * same.length)];
	const tSame = TEMPLATES.filter((x) => x.topic === item.topic && x.type === item.type);
	const tTopic = tSame.length ? tSame : TEMPLATES.filter((x) => x.topic === item.topic);
	return generate(tTopic[Math.floor(random() * tTopic.length)].id, newSeed(random));
}

export function pickNext(state: State, s: Settings, random: () => number = Math.random): Pick {
	// 1. Review: in "Review mistakes", always; otherwise when an item is due.
	const items = reviewFor(state, s);
	const due = s.route === "review" ? [...items].sort((a, b) => a.dueIn - b.dueIn) : items.filter((r) => r.dueIn <= 0).sort((a, b) => a.dueIn - b.dueIn);
	const lastGroup = state.recentGroups[state.recentGroups.length - 1];
	for (const item of due) {
		const q = anotherExample(item, random);
		// Never the same structure twice in a row: if this one would be, it
		// waits a question (unless review is all there is to do).
		if (q.group !== lastGroup || (s.route === "review" && due.length === 1)) return { question: q, review: item };
	}
	if (s.route === "review") {
		// Nothing left to review: fall back to mixed practice at this level.
		s = { ...s, route: "mixed" };
	}

	// 2. A new question from the scope, avoiding the last few structures.
	const avoid = new Set(state.recentGroups.slice(-3));
	const templates = TEMPLATES.filter((t) => inScope(s, { topics: [t.topic, ...(t.topics ?? [])], topic: t.topic, level: t.level }));
	const fixed = FIXED.filter((q) => inScope(s, q));
	let tPool = templates.filter((t) => !avoid.has(t.id));
	let fPool = fixed.filter((q) => !avoid.has(q.group));
	if (!tPool.length && !fPool.length) {
		tPool = templates.filter((t) => t.id !== lastGroup);
		fPool = fixed.filter((q) => q.group !== lastGroup);
	}
	if (!tPool.length && !fPool.length) {
		tPool = templates;
		fPool = fixed;
	}
	const useTemplate = tPool.length > 0 && (fPool.length === 0 || random() < 0.6);
	if (useTemplate) {
		// Prefer templates the student has seen least.
		const seen = (id: string) => state.attempts.filter((a) => a.source === id).length;
		const minSeen = Math.min(...tPool.map((t) => seen(t.id)));
		const least = tPool.filter((t) => seen(t.id) <= minSeen + 1);
		const t = least[Math.floor(random() * least.length)];
		return { question: generate(t.id, newSeed(random)), review: null };
	}
	// Fixed questions: prefer ones not yet answered.
	const answered = new Set(state.attempts.map((a) => a.id));
	const fresh = fPool.filter((q) => !answered.has(q.id));
	const from = fresh.length ? fresh : fPool;
	return { question: from[Math.floor(random() * from.length)], review: null };
}

// ---------------------------------------------------------------------------
// Recording an answer

export function recordAnswer(state: State, q: Question, correct: boolean, review: ReviewItem | null, random: () => number = Math.random): State {
	const attempt: Attempt = {
		id: q.id,
		source: q.source,
		group: q.group,
		topics: q.topics,
		topic: q.topic,
		skill: q.skill,
		level: q.level,
		type: q.type,
		correct,
		review: !!review,
		t: Date.now(),
	};
	// Matched by value, not identity: the state may have been saved and reloaded.
	const isThis = (r: ReviewItem) => !!review && r.skill === review.skill && r.level === review.level && r.failedId === review.failedId;
	let reviewQueue = state.review.map((r) => (isThis(r) ? r : { ...r, dueIn: r.dueIn - 1 }));
	if (review) {
		reviewQueue = correct ? reviewQueue.filter((r) => !isThis(r)) : reviewQueue.map((r) => (isThis(r) ? { ...r, failedId: q.id, dueIn: RULES.reviewGapMin + 1 } : r));
	} else if (!correct) {
		const exists = reviewQueue.some((r) => r.skill === q.skill && r.level === q.level);
		if (!exists) reviewQueue.push(reviewItemFor(q, RULES.reviewGapMin + Math.floor(random() * RULES.reviewGapSpread)));
	}
	let attempts = [...state.attempts, attempt];
	let setStart = state.setStart;
	if (attempts.length > RULES.maxAttempts) {
		const drop = attempts.length - RULES.maxAttempts;
		attempts = attempts.slice(drop);
		setStart = Math.max(0, setStart - drop);
	}
	const streak = correct ? state.streak + 1 : 0;
	return {
		...state,
		attempts,
		setStart,
		review: reviewQueue,
		streak,
		best: Math.max(state.best, streak),
		bestByLevel: { ...state.bestByLevel, [q.level]: Math.max(state.bestByLevel[q.level] ?? 0, streak) },
		recentGroups: [...state.recentGroups, q.group].slice(-5),
	};
}

// ---------------------------------------------------------------------------
// Progress

/** Eligible first attempts (not review re-asks) in a scope, newest last. */
function eligible(state: State, level: Level, topic?: Topic): Attempt[] {
	return state.attempts.filter((a) => !a.review && a.level === level && (!topic || a.topics.includes(topic)));
}

export interface Readiness {
	ready: boolean;
	correct: number;
	window: number;
	distinct: number;
	enoughVariety: boolean;
}

export function readiness(state: State, level: Level, topic?: Topic): Readiness {
	const last = eligible(state, level, topic).slice(-RULES.readyWindow);
	const correct = last.filter((a) => a.correct).length;
	const distinct = new Set(last.map((a) => a.group)).size;
	const enoughVariety = distinct >= RULES.readyDistinct;
	return {
		ready: last.length === RULES.readyWindow && correct >= RULES.readyCorrect && enoughVariety,
		correct,
		window: last.length,
		distinct,
		enoughVariety,
	};
}

export type SkillState = "not-practised" | "building" | "ready" | "review";
export const SKILL_STATE_LABELS: Record<SkillState, string> = {
	"not-practised": "Not practiced",
	building: "Building confidence",
	ready: "Ready for a harder challenge",
	review: "Review suggested",
};

export interface TopicProgress {
	topic: Topic;
	state: SkillState;
	level: Level | null; // level of the most recent attempt in this topic
	firstTries: number;
	correct: number;
	reviewCount: number;
}

export function topicProgress(state: State, topic: Topic): TopicProgress {
	const all = state.attempts.filter((a) => a.topics.includes(topic) && !a.review);
	const reviewCount = state.review.filter((r) => r.topic === topic).length;
	const base = { topic, firstTries: all.length, correct: all.filter((a) => a.correct).length, reviewCount };
	if (all.length === 0) return { ...base, state: reviewCount ? "review" : "not-practised", level: null };
	const level = all[all.length - 1].level;
	const recent = all.slice(-5);
	const recentRate = recent.filter((a) => a.correct).length / recent.length;
	if (reviewCount > 0 || (recent.length >= 3 && recentRate < 0.6)) return { ...base, state: "review", level };
	if (level !== "challenging" && readiness(state, level, topic).ready) return { ...base, state: "ready", level };
	return { ...base, state: "building", level };
}

export interface Suggestion {
	kind: "up" | "down";
	to: Level;
	reason: string;
}

/** A level change to suggest (never applied automatically). */
export function levelSuggestion(state: State, s: Settings): Suggestion | null {
	if (state.attempts.length - state.adviceDismissedAt < RULES.readyWindow) return null;
	const topic = s.route === "topic" ? s.topic : undefined;
	const r = readiness(state, s.level, topic);
	const i = LEVELS.indexOf(s.level);
	if (r.ready && i < LEVELS.length - 1) {
		return {
			kind: "up",
			to: LEVELS[i + 1],
			reason: `${r.correct} of your last ${r.window} first tries were right, across ${r.distinct} kinds of question.`,
		};
	}
	if (r.window === RULES.readyWindow && r.correct <= RULES.struggleCorrect && i > 0) {
		return {
			kind: "down",
			to: LEVELS[i - 1],
			reason: `${r.correct} of your last ${r.window} first tries were right. A step down can help the ideas settle.`,
		};
	}
	return null;
}

export interface Checkpoint {
	total: number;
	correct: number;
	trickySkills: string[];
	recommendation: { action: "review" | "level-up" | "level-down" | "continue"; text: string; level?: Level };
}

export function checkpointDue(state: State): boolean {
	return state.attempts.length - state.setStart >= RULES.checkpointEvery;
}

export function checkpoint(state: State, s: Settings): Checkpoint {
	const set = state.attempts.slice(state.setStart);
	const correct = set.filter((a) => a.correct).length;
	const trickySkills = [...new Set(set.filter((a) => !a.correct).map((a) => a.skill))];
	const sug = levelSuggestion({ ...state, adviceDismissedAt: -Infinity }, s);
	const reviewCount = reviewFor(state, s.route === "review" ? null : s).length || state.review.length;
	let recommendation: Checkpoint["recommendation"];
	if (reviewCount > 0)
		recommendation = { action: "review", text: `Review your mistakes: ${reviewCount} skill${reviewCount === 1 ? "" : "s"} to revisit with fresh examples.` };
	else if (sug?.kind === "up") recommendation = { action: "level-up", text: `Try ${sug.to[0].toUpperCase() + sug.to.slice(1)} — ${sug.reason}`, level: sug.to };
	else if (sug?.kind === "down") recommendation = { action: "level-down", text: `Try ${sug.to[0].toUpperCase() + sug.to.slice(1)} for a while. ${sug.reason}`, level: sug.to };
	else recommendation = { action: "continue", text: "Keep going at this level — a few more sets will show a clear pattern." };
	return { total: set.length, correct, trickySkills, recommendation };
}

export function closeCheckpoint(state: State): State {
	return { ...state, setStart: state.attempts.length };
}

export function dismissAdvice(state: State): State {
	return { ...state, adviceDismissedAt: state.attempts.length };
}
