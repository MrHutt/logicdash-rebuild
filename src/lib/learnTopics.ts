// Single source of truth for the Learn hub's topic order. Article pages look
// themselves up here for breadcrumbs and prev/next links, and the hub page
// renders its card grid from the same list — so adding a new topic here is
// the only step needed to wire it into breadcrumbs, pagination, and the hub.
/**
 * The hub's section order. Both the hub's card grid AND every article's
 * prev/next pagination follow this sequence (grouped, not raw array order —
 * see HUB_ORDERED_TOPICS) so the two stay consistent with each other.
 */
export type LearnGroup = "Start Here" | "Reading & Writing Bytes" | "How the Puzzle Works" | "Going Further";
export const GROUP_ORDER: LearnGroup[] = ["Start Here", "Reading & Writing Bytes", "How the Puzzle Works", "Going Further"];

export interface LearnTopic {
	title: string;
	href: string;
	blurb: string;
	/** Whether the article page actually exists yet. */
	live: boolean;
	/** Which section of the hub's card grid this topic displays under. */
	group: LearnGroup;
}

export const LEARN_TOPICS: LearnTopic[] = [
	{
		title: "What is Binary?",
		href: "/learn/what-is-binary",
		blurb: "The basics — how computers count with just 0s and 1s.",
		live: true,
		group: "Start Here",
	},
	{
		title: "Counting in Binary",
		href: "/learn/counting-in-binary",
		blurb: "The rollover trick that makes binary counting click.",
		live: true,
		group: "Start Here",
	},
	{
		title: "Hamming Distance, Explained",
		href: "/learn/hamming-distance",
		blurb: "The math behind every guess you make in LogicDash.",
		live: true,
		group: "How the Puzzle Works",
	},
	{
		title: "Bits, Bytes, and Beyond",
		href: "/learn/bits-and-bytes",
		blurb: "What a byte actually is, and how we measure data.",
		live: true,
		group: "Start Here",
	},
	{
		title: "Reading a Byte",
		href: "/learn/reading-a-byte",
		blurb: "Turn any byte into a real number, step by step.",
		live: true,
		group: "Reading & Writing Bytes",
	},
	{
		title: "Writing a Byte",
		href: "/learn/writing-a-byte",
		blurb: "Turn any number into binary, the way most people actually learn it.",
		live: true,
		group: "Reading & Writing Bytes",
	},
	{
		title: "Error Correction, Explained",
		href: "/learn/error-correction",
		blurb: "How computers detect and fix mistakes in data.",
		live: true,
		group: "How the Puzzle Works",
	},
	{
		title: "IPv4 vs IPv6",
		href: "/learn/ipv4-vs-ipv6",
		blurb: "Why the internet needed a bigger address book.",
		live: true,
		group: "Going Further",
	},
	{
		title: "How Computers Store Text",
		href: "/learn/how-computers-store-text",
		blurb: "How your keyboard becomes binary.",
		live: true,
		group: "Going Further",
	},
	{
		title: "Binary ↔ Hex ↔ Decimal",
		href: "/learn/binary-hex-decimal",
		blurb: "Convert between number systems, and see how it works.",
		live: true,
		group: "Going Further",
	},
];

/**
 * All topics flattened into the same order they visually appear on the hub —
 * grouped by section (per GROUP_ORDER), preserving each topic's relative
 * order within its group. This is what prev/next pagination walks, since it
 * can differ from LEARN_TOPICS' raw array order (e.g. Hamming Distance sits
 * right after What is Binary in the array, but reads after the Reading &
 * Writing Bytes pair on the hub).
 */
export const HUB_ORDERED_TOPICS: LearnTopic[] = GROUP_ORDER.flatMap((group) =>
	LEARN_TOPICS.filter((topic) => topic.group === group),
);

/**
 * The immediately adjacent topics in hub order. `prev` is omitted unless it's
 * live (there's nothing useful to link back to otherwise). `next` is returned
 * even when not yet live, so callers can render it as a "coming soon" label
 * instead of a link — that's how a not-yet-built page announces itself.
 */
export function getAdjacentLearnTopics(href: string): { prev: LearnTopic | null; next: LearnTopic | null } {
	const index = HUB_ORDERED_TOPICS.findIndex((topic) => topic.href === href);
	const prevCandidate = index > 0 ? HUB_ORDERED_TOPICS[index - 1] : null;
	const nextCandidate = index >= 0 && index < HUB_ORDERED_TOPICS.length - 1 ? HUB_ORDERED_TOPICS[index + 1] : null;

	return {
		prev: prevCandidate?.live ? prevCandidate : null,
		next: nextCandidate,
	};
}
