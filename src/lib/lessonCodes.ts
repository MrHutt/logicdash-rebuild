// Lesson short codes (logicdash.io/5A2). Codes are case-insensitive: they're
// stored uppercase in learnTopics.ts and anything a person types or visits
// is normalized the same way before lookup.
import { LEARN_TOPICS } from "./learnTopics";

/** "  logicdash.io/5a2/ " → "5A2". Returns "" if nothing code-like is left. */
export function normalizeCode(input: string): string {
	let s = input.trim();
	s = s.replace(/[?#].*$/, ""); // drop any query or hash
	s = s.replace(/\/+$/, ""); // drop trailing slashes
	s = s.replace(/^.*\//, ""); // keep only the last path segment
	return s.toUpperCase();
}

/** Uppercase code → lesson path ("/learn/…"), for live lessons only. */
export function codeMap(): Record<string, string> {
	const map: Record<string, string> = {};
	for (const topic of LEARN_TOPICS) {
		if (!topic.live) continue;
		const code = topic.code.toUpperCase();
		if (map[code]) throw new Error(`Lesson code collision: ${code} is used by ${map[code]} and ${topic.href}`);
		map[code] = topic.href;
	}
	return map;
}
