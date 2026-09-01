// Single source of truth for the Learn hub's topic order. Article pages look
// themselves up here for breadcrumbs and prev/next links, and the hub page
// renders its card grid from the same list — so adding a new topic here is
// the only step needed to wire it into breadcrumbs, pagination, and the hub.
export interface LearnTopic {
	title: string;
	href: string;
	blurb: string;
	/** Whether the article page actually exists yet. */
	live: boolean;
}

export const LEARN_TOPICS: LearnTopic[] = [
	{
		title: "What is Binary?",
		href: "/learn/what-is-binary",
		blurb: "The basics — how computers count with just 0s and 1s.",
		live: true,
	},
	{
		title: "Hamming Distance, Explained",
		href: "/learn/hamming-distance",
		blurb: "The math behind every guess you make in LogicDash.",
		live: true,
	},
	{
		title: "Bits, Bytes, and Beyond",
		href: "/learn/bits-and-bytes",
		blurb: "What a byte actually is, and how we measure data.",
		live: true,
	},
	{
		title: "Error Correction, Explained",
		href: "/learn/error-correction",
		blurb: "How computers detect and fix mistakes in data.",
		live: true,
	},
	{
		title: "How Computers Store Text",
		href: "/learn/how-computers-store-text",
		blurb: "How your keyboard becomes binary.",
		live: true,
	},
	{
		title: "Binary ↔ Hex ↔ Decimal",
		href: "/learn/binary-hex-decimal",
		blurb: "Convert between number systems, and see how it works.",
		live: true,
	},
];

/**
 * The immediately adjacent topics in hub order. `prev` is omitted unless it's
 * live (there's nothing useful to link back to otherwise). `next` is returned
 * even when not yet live, so callers can render it as a "coming soon" label
 * instead of a link — that's how a not-yet-built page announces itself.
 */
export function getAdjacentLearnTopics(href: string): { prev: LearnTopic | null; next: LearnTopic | null } {
	const index = LEARN_TOPICS.findIndex((topic) => topic.href === href);
	const prevCandidate = index > 0 ? LEARN_TOPICS[index - 1] : null;
	const nextCandidate = index >= 0 && index < LEARN_TOPICS.length - 1 ? LEARN_TOPICS[index + 1] : null;

	return {
		prev: prevCandidate?.live ? prevCandidate : null,
		next: nextCandidate,
	};
}
