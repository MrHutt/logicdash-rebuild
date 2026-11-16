// Pure logic for /tools/student-picker — an unpublished classroom tool.
// Kept separate from the page's own <script> so the shuffling and grouping
// math can be reasoned about (and unit-tested, if that's ever added) without
// the DOM/animation code around them. Roster persistence itself now lives in
// rosterStore.ts (shared with /tools/seating-chart, which reads the same
// rosters) — re-exported here so this file's existing imports elsewhere
// don't need to change.

export type { Student, Roster } from "./rosterStore";
export { loadRosters, saveRoster, deleteRoster, loadActiveRosterName, saveActiveRosterName } from "./rosterStore";

/** Fisher-Yates — every permutation equally likely, unlike a naive
 *  sort-by-random-comparator shuffle. Returns a new array; never mutates. */
export function shuffle<T>(items: T[]): T[] {
	const result = [...items];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

/** Distributes `items` into exactly `numGroups` groups, round-robin after a
 *  shuffle — sizes never differ by more than 1, which is what "as evenly as
 *  possible" actually means here. Used directly for "split into N groups"
 *  (the teacher named the exact count, so it's honored literally, remainder
 *  and all) and, after choosing a safer group count, for "groups of size
 *  N" below. */
export function distributeIntoGroups<T>(items: T[], numGroups: number): T[][] {
	const groups: T[][] = Array.from({ length: Math.max(1, numGroups) }, () => []);
	shuffle(items).forEach((item, i) => groups[i % groups.length].push(item));
	return groups;
}

/** "Groups of size N": unlike distributeIntoGroups, the group COUNT isn't
 *  given directly — it's derived from a target size, which leaves room to
 *  avoid a bad outcome. A naive Math.ceil(total/targetSize) can strand a
 *  single student alone in their own "group" (e.g. 7 students at a target
 *  size of 2 naively wants 4 groups, but round-robin then gives sizes
 *  2,2,2,1 — that lone 1 is exactly the "leftover student" this function
 *  exists to avoid). Starting from the closest group count and backing off
 *  while the smallest resulting group would be under 2 fixes this: the same
 *  7-at-2 case settles on 3 groups (sizes 3,2,2) instead — one slightly
 *  larger group, never a lone student. */
export function groupsOfSize<T>(items: T[], targetSize: number): T[][] {
	const total = items.length;
	const safeTargetSize = Math.max(1, targetSize);
	let numGroups = Math.max(1, Math.round(total / safeTargetSize));
	while (numGroups > 1 && Math.floor(total / numGroups) < 2) numGroups--;
	return distributeIntoGroups(items, numGroups);
}

/** Random pairs, with an odd student folded into a trio rather than left
 *  unpaired — matches groupsOfSize's "never a lone leftover" philosophy,
 *  just for the pairs-specific case. */
export function makePairs<T>(items: T[]): T[][] {
	const shuffled = shuffle(items);
	const pairs: T[][] = [];
	for (let i = 0; i < shuffled.length; i += 2) pairs.push(shuffled.slice(i, i + 2));
	if (pairs.length > 1 && pairs[pairs.length - 1].length === 1) {
		const leftover = pairs.pop()!;
		pairs[pairs.length - 1].push(...leftover);
	}
	return pairs;
}
