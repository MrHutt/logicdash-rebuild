// A deliberately simple, explainable password-strength estimator for the
// /learn/password-strength demo. It counts the "guess space" (how many
// characters could appear in each position, to the power of the length),
// then knocks points off for the obvious shortcuts real attackers try first:
// well-known passwords, and runs of repeated or sequential characters.
// It is a teaching model, not a security audit — the page says so.

export interface CharacterSets {
	lower: boolean;
	upper: boolean;
	digits: boolean;
	symbols: boolean;
	other: boolean;
}

export interface StrengthEstimate {
	length: number;
	sets: CharacterSets;
	/** Number of different characters that could appear in each position. */
	poolSize: number;
	/** Entropy in bits after pattern penalties. */
	bits: number;
	/** Why the estimate was lowered, in plain English (empty if it wasn't). */
	warnings: string[];
}

// A small sample of the passwords that top every leaked-password list.
// Attackers try lists like this (millions long) before anything else.
export const COMMON_PASSWORDS = [
	"123456", "password", "123456789", "12345678", "12345", "qwerty", "abc123", "football",
	"1234567", "monkey", "111111", "letmein", "1234", "1234567890", "dragon", "baseball",
	"sunshine", "iloveyou", "trustno1", "princess", "admin", "welcome", "666666", "passw0rd",
	"master", "hello", "freedom", "whatever", "qazwsx", "654321", "superman", "michael",
	"shadow", "ashley", "jesus", "ninja", "mustang", "password1", "starwars", "login",
	"solo", "qwertyuiop", "charlie", "donald", "batman", "access", "flower", "hottie",
	"loveme", "zaq1zaq1", "hunter2", "asdfgh", "computer", "secret", "summer", "winter",
	"pokemon", "minecraft", "chocolate", "soccer", "hockey", "tigger", "cookie", "google",
];

const POOL = { lower: 26, upper: 26, digits: 10, symbols: 33, other: 100 };

export function detectSets(password: string): CharacterSets {
	return {
		lower: /[a-z]/.test(password),
		upper: /[A-Z]/.test(password),
		digits: /[0-9]/.test(password),
		symbols: /[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(password),
		other: /[^\x20-\x7e]/.test(password),
	};
}

export function estimateStrength(password: string): StrengthEstimate {
	const chars = Array.from(password);
	const sets = detectSets(password);
	const poolSize =
		(sets.lower ? POOL.lower : 0) +
		(sets.upper ? POOL.upper : 0) +
		(sets.digits ? POOL.digits : 0) +
		(sets.symbols ? POOL.symbols : 0) +
		(sets.other ? POOL.other : 0);
	const warnings: string[] = [];

	if (chars.length === 0 || poolSize === 0) {
		return { length: chars.length, sets, poolSize, bits: 0, warnings };
	}

	const perChar = Math.log2(poolSize);
	const lowered = password.toLowerCase();

	// Exact match on a famous password: it's near the top of every list.
	if (COMMON_PASSWORDS.includes(lowered)) {
		warnings.push("This is one of the most common passwords in the world — attackers try it first.");
		return { length: chars.length, sets, poolSize, bits: Math.log2(COMMON_PASSWORDS.length), warnings };
	}

	// A famous password with look-alike swaps (@ for a, 0 for o…), a capital
	// at the start, or digits/symbols bolted on the end ("P@ssw0rd123!") is
	// barely any better — attackers try all of those variations first.
	const trimEnds = (t: string) => t.replace(/^[^a-z]+|[^a-z]+$/g, "");
	const unswap = (t: string) =>
		t.replace(/[@4]/g, "a").replace(/0/g, "o").replace(/[1!|]/g, "i").replace(/3/g, "e").replace(/[$5]/g, "s").replace(/7/g, "t");
	const withoutTail = lowered.replace(/[0-9!?.#*]+$/, ""); // "p@ssw0rd123!" → "p@ssw0rd"
	const core = [trimEnds(lowered), trimEnds(unswap(withoutTail))].find(
		(c) => c.length >= 4 && COMMON_PASSWORDS.includes(c),
	);
	if (core) {
		const extra = Math.max(0, chars.length - core.length);
		warnings.push(
			"It's built on a very common password. Swapping letters for look-alike symbols or adding numbers to the end are tricks attackers expect.",
		);
		return {
			length: chars.length,
			sets,
			poolSize,
			bits: Math.log2(COMMON_PASSWORDS.length) + 1 + extra * Math.log2(POOL.digits + POOL.symbols),
			warnings,
		};
	}

	// Three or more plain words separated by spaces or dashes: count it as a
	// passphrase — about 12.9 bits per word, assuming each word was picked at
	// random from a 7,776-word list (the classic "diceware" list). Counting
	// the letters as if they were random would wildly overrate it.
	const words = password.trim().split(/[\s\-_.]+/);
	if (words.length >= 3 && words.every((w) => /^[a-z]+$/i.test(w))) {
		warnings.push(
			`Counted as a ${words.length}-word passphrase: about 13 bits per word, as long as the words were picked at random.`,
		);
		return { length: chars.length, sets, poolSize, bits: words.length * Math.log2(7776), warnings };
	}

	// Characters that just repeat or continue a sequence (aaa, abc, 321)
	// are easy to predict, so they only count for about one bit each.
	let bits = perChar;
	let predictable = 0;
	for (let i = 1; i < chars.length; i++) {
		const prev = chars[i - 1].toLowerCase().codePointAt(0)!;
		const cur = chars[i].toLowerCase().codePointAt(0)!;
		if (Math.abs(cur - prev) <= 1) {
			predictable += 1;
			bits += 1;
		} else {
			bits += perChar;
		}
	}
	if (predictable >= 2) {
		warnings.push("It has repeated or in-a-row characters (like “aaa” or “123”), which are easy to guess.");
	}

	if (chars.length < 8) {
		warnings.push("It's short. Length makes the biggest difference of all.");
	}

	return { length: chars.length, sets, poolSize, bits, warnings };
}

/** Average seconds to crack: on average an attacker finds it halfway through the guess space. */
export function secondsToCrack(bits: number, guessesPerSecond: number): number {
	return Math.pow(2, Math.max(0, bits - 1)) / guessesPerSecond;
}

const YEAR = 365.25 * 24 * 3600;
const UNIVERSE_AGE_YEARS = 13.8e9;

/** Turns a crack time into plain English: "instantly", "3 hours", "12,000 years"… */
export function describeDuration(seconds: number): string {
	if (seconds < 1) return "instantly";
	const units: [number, string][] = [
		[YEAR, "year"],
		[24 * 3600 * 30.44, "month"],
		[24 * 3600, "day"],
		[3600, "hour"],
		[60, "minute"],
		[1, "second"],
	];
	const years = seconds / YEAR;
	if (years > UNIVERSE_AGE_YEARS) return "longer than the universe has existed";
	if (years >= 1e9) return `about ${Math.round(years / 1e9).toLocaleString("en-US")} billion years`;
	if (years >= 1e6) return `about ${Math.round(years / 1e6).toLocaleString("en-US")} million years`;
	if (years >= 1000) return `about ${(Math.round(years / 1000) * 1000).toLocaleString("en-US")} years`;
	if (years >= 100) return `about ${(Math.round(years / 100) * 100).toLocaleString("en-US")} years`;
	for (const [size, name] of units) {
		if (seconds >= size) {
			const n = Math.round(seconds / size);
			return `about ${n.toLocaleString("en-US")} ${name}${n === 1 ? "" : "s"}`;
		}
	}
	return "instantly";
}

/** A one-word verdict for the meter. */
export function verdict(bits: number): string {
	if (bits < 28) return "Very weak";
	if (bits < 40) return "Weak";
	if (bits < 60) return "Okay";
	if (bits < 80) return "Strong";
	return "Very strong";
}
