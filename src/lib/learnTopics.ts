// Single source of truth for the Learn hub's topic order. Article pages look
// themselves up here for breadcrumbs and prev/next links, the hub page
// renders its card grid from the same list, and Layout.astro builds each
// page's JSON-LD structured data from it — so adding a new topic here is the
// only step needed to wire it into breadcrumbs, pagination, SEO, and the hub.
/**
 * The hub's section order. Both the hub's card grid AND every article's
 * prev/next pagination follow this sequence (grouped, not raw array order —
 * see HUB_ORDERED_TOPICS) so the two stay consistent with each other.
 */
export type LearnGroup =
	| "Binary & Data"
	| "Reliability & Correction"
	| "Networks & Systems"
	| "Security"
	| "Practice";
export const GROUP_ORDER: LearnGroup[] = [
	"Binary & Data",
	"Reliability & Correction",
	"Networks & Systems",
	"Security",
	"Practice",
];

/** One-line intro shown under each group heading on the hub. */
export const GROUP_BLURBS: Record<LearnGroup, string> = {
	"Binary & Data": "How computers turn everything into 0s and 1s — and how they squeeze it smaller.",
	"Reliability & Correction": "How computers notice mistakes, fix them, and keep going when parts fail.",
	"Networks & Systems": "How data travels, and how big systems stay fast as they grow.",
	Security: "Keeping data private and spotting the tricks people use to steal it.",
	Practice: "Hands-on practice — step through it yourself, as many times as you like.",
};

export interface LearnTopic {
	title: string;
	href: string;
	blurb: string;
	/** Whether the article page actually exists yet. */
	live: boolean;
	/** Which section of the hub's card grid this topic displays under. */
	group: LearnGroup;
	/** A standalone practice tool rather than a lesson — changes the hub badge and the page's structured data. */
	kind?: "lesson" | "tool";
	/** Short concept phrases for the page's structured data ("teaches"). */
	teaches?: string[];
}

// Array order within each group is the reading order — see HUB_ORDERED_TOPICS.
export const LEARN_TOPICS: LearnTopic[] = [
	// --- Binary & Data ---
	{
		title: "What is Binary?",
		href: "/learn/what-is-binary",
		blurb: "The basics — how computers count with just 0s and 1s.",
		live: true,
		group: "Binary & Data",
		teaches: ["Binary numbers", "Bits"],
	},
	{
		title: "Counting in Binary",
		href: "/learn/counting-in-binary",
		blurb: "The rollover trick that makes binary counting click.",
		live: true,
		group: "Binary & Data",
		teaches: ["Counting in base 2"],
	},
	{
		title: "Bits, Bytes, and Beyond",
		href: "/learn/bits-and-bytes",
		blurb: "What a byte actually is, and how we measure data.",
		live: true,
		group: "Binary & Data",
		teaches: ["Bits and bytes", "Units of data"],
	},
	{
		title: "Binary ↔ Hex ↔ Decimal",
		href: "/learn/binary-hex-decimal",
		blurb: "Convert between number systems, and see how it works.",
		live: true,
		group: "Binary & Data",
		teaches: ["Hexadecimal", "Number base conversion"],
	},
	{
		title: "How Computers Store Text",
		href: "/learn/how-computers-store-text",
		blurb: "How your keyboard becomes binary.",
		live: true,
		group: "Binary & Data",
		teaches: ["ASCII", "Unicode", "Text encoding"],
	},
	{
		title: "Compression",
		href: "/learn/compression",
		blurb: "How files get smaller — and when detail gets thrown away.",
		live: true,
		group: "Binary & Data",
		teaches: ["Data compression", "Lossless compression", "Lossy compression"],
	},

	// --- Reliability & Correction ---
	{
		title: "Hamming Distance, Explained",
		href: "/learn/hamming-distance",
		blurb: "The math behind every guess you make in LogicDash.",
		live: true,
		group: "Reliability & Correction",
		teaches: ["Hamming distance"],
	},
	{
		title: "Error Correction, Explained",
		href: "/learn/error-correction",
		blurb: "How computers detect and fix mistakes in data.",
		live: true,
		group: "Reliability & Correction",
		teaches: ["Error detection", "Error correction", "Parity bits"],
	},
	{
		title: "Redundancy & Fault Tolerance",
		href: "/learn/redundancy-and-fault-tolerance",
		blurb: "Spare parts and backup routes that keep things running.",
		live: true,
		group: "Reliability & Correction",
		teaches: ["Redundancy", "Fault tolerance"],
	},

	// --- Networks & Systems ---
	{
		title: "Abstraction",
		href: "/learn/abstraction",
		blurb: "How we use complicated things without knowing every detail.",
		live: true,
		group: "Networks & Systems",
		teaches: ["Abstraction", "Procedural abstraction", "Data abstraction"],
	},
	{
		title: "Packets & Routing",
		href: "/learn/packets-and-routing",
		blurb: "How your data travels the internet in small pieces.",
		live: true,
		group: "Networks & Systems",
		teaches: ["Packets", "Routing", "Internet protocols"],
	},
	{
		title: "Bandwidth & Latency",
		href: "/learn/bandwidth-and-latency",
		blurb: "Why a fast connection can still feel slow.",
		live: true,
		group: "Networks & Systems",
		teaches: ["Bandwidth", "Latency"],
	},
	{
		title: "IPv4 vs IPv6",
		href: "/learn/ipv4-vs-ipv6",
		blurb: "Why the internet needed a bigger address book.",
		live: true,
		group: "Networks & Systems",
		teaches: ["IP addresses", "IPv4", "IPv6"],
	},
	{
		title: "Scalability",
		href: "/learn/scalability",
		blurb: "What has to change when a system gets popular.",
		live: true,
		group: "Networks & Systems",
		teaches: ["Scalability"],
	},
	{
		title: "Speedup",
		href: "/learn/speedup",
		blurb: "Why four cooks aren't always four times faster.",
		live: true,
		group: "Networks & Systems",
		teaches: ["Parallel computing", "Speedup"],
	},
	{
		title: "Crowdsourcing & Distributed Computing",
		href: "/learn/distributed-computing",
		blurb: "Split one huge job across many helpers.",
		live: true,
		group: "Networks & Systems",
		teaches: ["Distributed computing", "Crowdsourcing", "Parallel computing"],
	},

	// --- Security ---
	{
		title: "Encryption Basics",
		href: "/learn/encryption-basics",
		blurb: "Locking data so only the right key can read it.",
		live: true,
		group: "Security",
		teaches: ["Encryption", "Symmetric encryption", "Caesar cipher"],
	},
	{
		title: "Public-Key Cryptography",
		href: "/learn/public-key-cryptography",
		blurb: "How strangers share secrets without meeting first.",
		live: true,
		group: "Security",
		teaches: ["Public-key encryption", "Asymmetric encryption"],
	},
	{
		title: "Password Strength & Entropy",
		href: "/learn/password-strength",
		blurb: "What makes a password hard to guess — and how hard.",
		live: true,
		group: "Security",
		teaches: ["Password strength", "Entropy", "Brute-force attacks"],
	},
	{
		title: "Phishing Red Flags",
		href: "/learn/phishing",
		blurb: "Spot the warning signs in a fake email.",
		live: true,
		group: "Security",
		teaches: ["Phishing", "Social engineering"],
	},

	// --- Practice ---
	{
		title: "Reading a Byte",
		href: "/learn/reading-a-byte",
		blurb: "Turn any byte into a real number, step by step.",
		live: true,
		group: "Practice",
		teaches: ["Binary to decimal conversion"],
	},
	{
		title: "Writing a Byte",
		href: "/learn/writing-a-byte",
		blurb: "Turn any number into binary, the way most people actually learn it.",
		live: true,
		group: "Practice",
		teaches: ["Decimal to binary conversion"],
	},
	{
		title: "Binary Search",
		href: "/learn/binary-search",
		blurb: "The smartest way to find a number — halve it every time.",
		live: true,
		group: "Practice",
		teaches: ["Binary search", "Linear search", "Algorithm efficiency"],
	},
	{
		title: "Sorting Algorithms",
		href: "/learn/sorting-algorithms",
		blurb: "Watch a bubble sort put things in order, one swap at a time.",
		live: true,
		group: "Practice",
		teaches: ["Sorting algorithms", "Bubble sort", "Algorithm efficiency"],
	},
	{
		title: "Pseudocode Practice",
		href: "/learn/pseudocode-practice",
		blurb: "Endless AP-style code-reading questions. Build a streak.",
		live: true,
		group: "Practice",
		kind: "tool",
		teaches: ["AP CSP pseudocode", "Reading code", "Tracing programs"],
	},
];

/**
 * All topics flattened into the same order they visually appear on the hub —
 * grouped by section (per GROUP_ORDER), preserving each topic's relative
 * order within its group. This is what prev/next pagination walks.
 */
export const HUB_ORDERED_TOPICS: LearnTopic[] = GROUP_ORDER.flatMap((group) =>
	LEARN_TOPICS.filter((topic) => topic.group === group),
);

/** Looks a topic up by path, tolerating the trailing slash Astro adds to built URLs. */
export function findLearnTopic(pathname: string): LearnTopic | undefined {
	const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
	return LEARN_TOPICS.find((topic) => topic.href === normalized);
}

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
