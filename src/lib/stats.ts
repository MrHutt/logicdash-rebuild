// PRIVACY NOTE: All LogicDash stats live only in the user's browser localStorage. Nothing is sent to a server, tracked, or shared. It exists on this device only.

import { getLocalDateString } from "./dailySeed";

// QuickByte-only binary stats system. These helpers deliberately reuse the exact
// localStorage keys already committed by src/pages/quick-byte.astro:
//   - daily completion: "logicdash:quickbyte:" + YYYY-MM-DD (per-day result JSON)
//   - streak record:    "logicdash:quickbyte:streak" ({ last, count, longest })
// Only genuinely-new aggregates (play dates, total guesses, games completed) get
// brand-new keys under the same namespace.

const STREAK_KEY = "logicdash:quickbyte:streak"; // existing key — reused, not duplicated
const PLAY_DATES_KEY = "logicdash:quickbyte:playdates"; // new: successful-completion dates only
const TOTAL_GUESSES_KEY = "logicdash:quickbyte:totalguesses"; // new: lifetime guess count
const GAMES_COMPLETED_KEY = "logicdash:quickbyte:gamescompleted"; // new: lifetime completed-game count

/** Shape of the existing streak record written by quick-byte.astro. */
export interface StreakRecord {
	last: string;
	count: number;
	longest: number;
}

function readNumber(key: string): number {
	try {
		const raw = localStorage.getItem(key);
		if (raw === null) return 0;
		const parsed = Number.parseInt(raw, 10);
		return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
	} catch {
		return 0;
	}
}

function writeNumber(key: string, value: number) {
	try {
		localStorage.setItem(key, String(value));
	} catch {}
}

/** Read the existing streak record (reuses quick-byte.astro's key and schema). */
export function readStreak(): StreakRecord {
	try {
		const raw = localStorage.getItem(STREAK_KEY);
		if (raw) {
			const parsed = JSON.parse(raw) as Partial<StreakRecord>;
			return {
				last: typeof parsed.last === "string" ? parsed.last : "",
				count: typeof parsed.count === "number" ? parsed.count : 0,
				longest: typeof parsed.longest === "number" ? parsed.longest : parsed.count ?? 0,
			};
		}
	} catch {}
	return { last: "", count: 0, longest: 0 };
}

/** Write the streak record back to the SAME key quick-byte.astro already uses. */
export function writeStreak(streak: StreakRecord) {
	try {
		localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
	} catch {}
}

/** Current consecutive-day streak (days). */
export function getCurrentStreak(): number {
	const streak = readStreak();
	if (!streak.last || !streak.count) return 0;
	const today = getLocalDateString();
	const [y, m, d] = streak.last.split("-").map(Number);
	const [ty, tm, td] = today.split("-").map(Number);
	if (![y, m, d, ty, tm, td].every(Number.isFinite)) return 0;
	const days = Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(y, m - 1, d)) / 86400000);
	return days >= 0 && days <= 1 ? streak.count : 0;
}

/** Best-ever streak (days). Falls back to `count` for pre-`longest` saves. */
export function getLongestStreak(): number {
	const streak = readStreak();
	return streak.longest || streak.count || 0;
}

/** Lifetime total guesses made across all completed QuickByte games. */
export function getTotalGuesses(): number {
	return readNumber(TOTAL_GUESSES_KEY);
}

/** Number of QuickByte days fully completed (all 3 rounds solved counts as one game). */
export function getGamesCompleted(): number {
	return readNumber(GAMES_COMPLETED_KEY);
}

/** Add one game's guesses to the lifetime totals (called once per completed game). */
export function addGameStats(guesses: number) {
	writeNumber(TOTAL_GUESSES_KEY, getTotalGuesses() + guesses);
	writeNumber(GAMES_COMPLETED_KEY, getGamesCompleted() + 1);
}

/** Successful-completion dates (YYYY-MM-DD), oldest first. */
export function getPlayDates(): string[] {
	try {
		const raw = localStorage.getItem(PLAY_DATES_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter((d): d is string => typeof d === "string") : [];
	} catch {
		return [];
	}
}

/**
 * Append today's local date to the play-dates array — ONLY on successful completion of
 * all 3 rounds. A failed day never enters this list (callers must check before calling).
 * Idempotent per day: re-saving the same date does not create duplicates.
 */
export function recordPlayDate(date: Date = new Date()): string {
	const dateString = getLocalDateString(date);
	const dates = getPlayDates();
	if (!dates.includes(dateString)) {
		dates.push(dateString);
		try {
			localStorage.setItem(PLAY_DATES_KEY, JSON.stringify(dates));
		} catch {}
	}
	return dateString;
}

/** True if the given local date (YYYY-MM-DD) was a successfully completed game day. */
export function hasPlayedOn(dateString: string): boolean {
	return getPlayDates().includes(dateString);
}

/** Average guesses per ROUND across all completed games. QuickByte days are 3 rounds,
 *  so the denominator is games_completed * 3 — never games_completed alone. Returns
 *  null when there is no history yet (callers should hide/skip any comparison then). */
export function getAvgGuessesPerRound(): number | null {
	const games = getGamesCompleted();
	if (games <= 0) return null;
	return getTotalGuesses() / (games * 3);
}
/**
 * Render a non-negative integer n in binary with the subscript-2 notation, e.g.
 * getBinaryStreak(5) === "101₂".
 */
export function getBinaryStreak(n: number): string {
	const value = Math.max(0, Math.floor(n));
	return `${value.toString(2)}\u2082`;
}
