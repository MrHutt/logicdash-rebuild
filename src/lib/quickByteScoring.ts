// Scoring rules for Today's Quick Byte results.

/**
 * A single round's result: the number of guesses it took to win, or `null` if the round
 * wasn't solved within the attempt limit. The sequence (with formatResultSequence()
 * rendering `null` as "X") is the source of truth — there's no numeric stand-in for a
 * loss anymore, since a failed round has no meaningful "score" to sum into a total.
 */
export type RoundResult = number | null;

export function roundScore(won: boolean, attempts: number): RoundResult {
	return won ? attempts : null;
}

export function formatResultSequence(scores: RoundResult[]): string {
	return scores.map((score) => (score === null ? "X" : String(score))).join("-");
}

/**
 * The sum of all three rounds — only meaningful when every round was solved. A run with
 * any failed round isn't fairly comparable to a full clean run, so there's no numeric
 * total for it at all: this returns `null` rather than partially summing the wins.
 */
export function totalScore(scores: RoundResult[]): number | null {
	if (scores.some((score) => score === null)) return null;
	return (scores as number[]).reduce((sum, score) => sum + score, 0);
}

/** Renders the total line for both the on-page result and the share text: a real number
 *  on a clean sweep, or "Incomplete" in place of one whenever a round was missed. */
export function formatTotalLine(scores: RoundResult[]): string {
	const total = totalScore(scores);
	return total === null ? "Incomplete" : `Total: ${total}`;
}

export function buildShareText(dateString: string, scores: RoundResult[]): string {
	const formattedDate = dateString.replaceAll("-", ".");

	const lines = [
		`Quick Byte — ${formattedDate}`,
		`${formatResultSequence(scores)}   ${formatTotalLine(scores)}`,
		"logicdash.io",
	];

	return lines.join("\n");
}
