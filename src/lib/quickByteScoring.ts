// Scoring and "badge" rules for Today's Quick Byte results.

/**
 * Internal score for a round that wasn't solved within the attempt limit — one worse
 * than the max possible win (6), so it always sorts/sums as strictly worse than any win.
 * Never shown to the player directly; formatResultSequence() renders it as "X".
 */
export const LOSS_SCORE = 7;

export function roundScore(won: boolean, attempts: number): number {
	return won ? attempts : LOSS_SCORE;
}

export function formatResultSequence(scores: number[]): string {
	return scores.map((score) => (score === LOSS_SCORE ? "X" : String(score))).join("-");
}

export function totalScore(scores: number[]): number {
	return scores.reduce((sum, score) => sum + score, 0);
}

export interface ResultBadge {
	name: string;
	text: string;
	/** Matched against the raw per-round scores (7 standing in for a loss), before formatting. */
	matches: (scores: number[]) => boolean;
}

// Checked in order; the first match wins. Add new patterns here as they come up.
export const RESULT_BADGES: ResultBadge[] = [
	{
		name: "hacked-the-mainframe",
		text: "Have you hacked the mainframe?",
		matches: (scores) => scores.every((score) => score === 1),
	},
	{
		name: "liftoff",
		text: "Liftoff! 🚀",
		matches: (scores) => scores[0] === 3 && scores[1] === 2 && scores[2] === 1,
	},
	{
		name: "number-of-the-beast",
		text: "Number of the beast. Concerning, but you made it.",
		matches: (scores) => scores.every((score) => score === 6),
	},
	{
		name: "total-system-failure",
		text: "Total system failure. Time to reboot.",
		matches: (scores) => scores.every((score) => score === LOSS_SCORE),
	},
	{
		name: "perfectly-balanced",
		text: "Perfectly balanced, as all things should be.",
		matches: (scores) => scores.every((score) => score === scores[0]),
	},
	{
		name: "countdown",
		text: "Nice countdown — Mission Control would approve.",
		matches: (scores) => scores.every((score, i) => i === 0 || scores[i - 1] - score === 1),
	},
];

export function findResultBadge(scores: number[]): string | null {
	return RESULT_BADGES.find((badge) => badge.matches(scores))?.text ?? null;
}

export type SquareColor = "green" | "orange" | "red";

/** Classifies a round's score into the color bucket used for share-text squares. */
export function squareColor(score: number): SquareColor {
	if (score === LOSS_SCORE) return "red";
	return score <= 2 ? "green" : "orange";
}

const SQUARE_EMOJI: Record<SquareColor, string> = {
	green: "🟩",
	orange: "🟧",
	red: "🟥",
};

export function formatResultSquares(scores: number[]): string {
	return scores.map((score) => SQUARE_EMOJI[squareColor(score)]).join("");
}

/**
 * Special phrase for share text. Uniform-color patterns (all-green/orange/red) are checked
 * first, then fall back to the same badge rules used on the results screen. In practice the
 * fallback can only ever surface Liftoff or the countdown pattern — every other existing
 * badge (hacked-the-mainframe, number-of-the-beast, total-system-failure, perfectly-balanced)
 * is itself a uniform-color pattern, so it's already caught by one of the checks above.
 */
export function shareSpecialPhrase(scores: number[]): string | null {
	if (scores.every((score) => squareColor(score) === "green")) return "Fully optimized.";
	if (scores.every((score) => squareColor(score) === "orange")) return "Stable build.";
	if (scores.every((score) => squareColor(score) === "red")) return "404: Logic not found.";
	return findResultBadge(scores);
}

export function buildShareText(dateString: string, scores: number[]): string {
	const formattedDate = dateString.replaceAll("-", ".");
	const phrase = shareSpecialPhrase(scores);

	const lines = [
		`Quick Byte — ${formattedDate}`,
		formatResultSquares(scores),
		...(phrase ? [phrase] : []),
		`${formatResultSequence(scores)}   Total: ${totalScore(scores)}`,
		"logicdash.io",
	];

	return lines.join("\n");
}
