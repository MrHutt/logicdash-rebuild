// Deterministic daily puzzle generation for Quick Byte. Everything here must be a pure
// function of the player's LOCAL date (not UTC) so the puzzle resets when their day does,
// matching how Wordle-style dailies behave across timezones.

/** Local YYYY-MM-DD, using the device's own calendar day (never UTC). */
export function getLocalDateString(date: Date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/** Simple deterministic 32-bit string hash (FNV-1a). Same input always yields the same output. */
export function hashString(input: string): number {
	let hash = 0x811c9dc5;
	for (let i = 0; i < input.length; i++) {
		hash ^= input.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return hash >>> 0;
}

/** Seeded PRNG (mulberry32) — deterministic given the same seed, unlike Math.random. */
export function createSeededRandom(seed: number): () => number {
	let state = seed >>> 0;
	return function random() {
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * Generates `count` distinct secrets for the given date string, each `bitLength` bits
 * (as a binary string). Deterministic: the same dateString always yields the same secrets.
 */
export function generateDailySecrets(dateString: string, bitLength: number, count: number): string[] {
	const random = createSeededRandom(hashString(dateString));
	const maxValue = 2 ** bitLength;
	const secrets: string[] = [];
	const seen = new Set<string>();

	while (secrets.length < count) {
		const value = Math.floor(random() * maxValue);
		const binary = value.toString(2).padStart(bitLength, "0");
		if (seen.has(binary)) continue;
		seen.add(binary);
		secrets.push(binary);
	}

	return secrets;
}
