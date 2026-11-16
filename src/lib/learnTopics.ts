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
	| "Programming & Algorithms"
	| "Computing & Society"
	| "Practice";
export const GROUP_ORDER: LearnGroup[] = [
	"Binary & Data",
	"Reliability & Correction",
	"Networks & Systems",
	"Security",
	"Programming & Algorithms",
	"Computing & Society",
	"Practice",
];

/** One-line intro shown under each group heading on the hub. */
export const GROUP_BLURBS: Record<LearnGroup, string> = {
	"Binary & Data": "How computers turn everything into 0s and 1s — and how they squeeze it smaller.",
	"Reliability & Correction": "How computers notice mistakes, fix them, and keep going when parts fail.",
	"Networks & Systems": "How data travels, and how big systems stay fast as they grow.",
	Security: "Keeping data private and spotting the tricks people use to steal it.",
	"Programming & Algorithms": "How programs are built, tested, and made fast — and the problems no program can solve.",
	"Computing & Society": "How computing affects people: fairness, access, and who owns what.",
	Practice: "Hands-on practice — step through it yourself, as many times as you like.",
};

/**
 * One soft color per group, used to color-code the hub cards and each
 * lesson's section titles. Amber stays the site's accent for buttons; no
 * cyan. All pass WCAG AA as text on the dark surfaces.
 */
export const GROUP_COLORS: Record<LearnGroup, string> = {
	"Binary & Data": "#ffae2e",
	"Reliability & Correction": "#a3e635",
	"Networks & Systems": "#a78bfa",
	Security: "#f472b6",
	"Programming & Algorithms": "#60a5fa",
	"Computing & Society": "#fb923c",
	Practice: "#34d399",
};

/**
 * How much a lesson assumes. Described by experience, not by age, exam
 * board or course name:
 * - starter:  "Beginner" — new to the topic
 * - core:     "Intermediate" — the main ideas most courses cover
 * - advanced: "Advanced" — going deeper
 * (The keys stay as they were so saved filters and links keep working.)
 */
export type LearnLevel = "starter" | "core" | "advanced";
export const LEVEL_ORDER: LearnLevel[] = ["starter", "core", "advanced"];
export const LEVEL_LABELS: Record<LearnLevel, string> = { starter: "Beginner", core: "Intermediate", advanced: "Advanced" };
export const LEVEL_HINTS: Record<LearnLevel, string> = {
	starter: "New to the topic",
	core: "The main ideas",
	advanced: "Going deeper",
};

/** Cross-cutting focus areas, so a teacher can pull together e.g. every cybersecurity lesson. */
export type LearnFocus = "data" | "networks" | "cyber" | "programming" | "impact";
export const FOCUS_ORDER: LearnFocus[] = ["data", "networks", "cyber", "programming", "impact"];
export const FOCUS_LABELS: Record<LearnFocus, string> = {
	data: "Data & binary",
	networks: "Networks & systems",
	cyber: "Cybersecurity",
	programming: "Programming & algorithms",
	impact: "Impact & ethics",
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
	/**
	 * Permanent short-link code: logicdash.io/<code> redirects here. Three hex
	 * characters, avoiding 0, 8, B and D (easy to misread on a projector).
	 * Never change or reuse a code once published — links get shared.
	 */
	code: string;
	/** Which stages it suits (most lessons have one). */
	levels: LearnLevel[];
	/** Focus areas it belongs to. */
	focus: LearnFocus[];
	/** Rough time to read and try the activities, in minutes. */
	minutes: number;
}

// Array order within each group is the reading order — see HUB_ORDERED_TOPICS.
/** Shown to people as the short-link host (the real redirect pages are site-relative). */
export const SHORT_HOST = "logicdash.io";
export const shortLink = (topic: LearnTopic) => `${SHORT_HOST}/${topic.code}`;

export const LEARN_TOPICS: LearnTopic[] = [
	// --- Binary & Data ---
	{
		title: "What is Binary?",
		href: "/learn/what-is-binary",
		code: "1A2",
		blurb: "The basics — how computers count with just 0s and 1s.",
		levels: ["starter"],
		focus: ["data"],
		minutes: 5,
		live: true,
		group: "Binary & Data",
		teaches: ["Binary numbers", "Bits"],
	},
	{
		title: "Counting in Binary",
		href: "/learn/counting-in-binary",
		code: "2C4",
		blurb: "The rollover trick that makes binary counting click.",
		levels: ["starter"],
		focus: ["data"],
		minutes: 8,
		live: true,
		group: "Binary & Data",
		teaches: ["Counting in base 2"],
	},
	{
		title: "Bits, Bytes, and Beyond",
		href: "/learn/bits-and-bytes",
		code: "3E1",
		blurb: "What a byte actually is, and how we measure data.",
		levels: ["starter"],
		focus: ["data"],
		minutes: 8,
		live: true,
		group: "Binary & Data",
		teaches: ["Bits and bytes", "Units of data"],
	},
	{
		title: "Binary ↔ Hex ↔ Decimal",
		href: "/learn/binary-hex-decimal",
		code: "4F7",
		blurb: "Convert between number systems, and see how it works.",
		levels: ["core"],
		focus: ["data"],
		minutes: 15,
		live: true,
		group: "Binary & Data",
		teaches: ["Hexadecimal", "Number base conversion"],
	},
	{
		title: "How Computers Store Text",
		href: "/learn/how-computers-store-text",
		code: "5F4",
		blurb: "How your keyboard becomes binary.",
		levels: ["core"],
		focus: ["data"],
		minutes: 12,
		live: true,
		group: "Binary & Data",
		teaches: ["ASCII", "Unicode", "Text encoding"],
	},
	{
		title: "Compression",
		href: "/learn/compression",
		code: "6C2",
		blurb: "How files get smaller — and when detail gets thrown away.",
		levels: ["core"],
		focus: ["data"],
		minutes: 12,
		live: true,
		group: "Binary & Data",
		teaches: ["Data compression", "Lossless compression", "Lossy compression"],
	},

	// --- Reliability & Correction ---
	{
		title: "Hamming Distance, Explained",
		href: "/learn/hamming-distance",
		code: "7E5",
		blurb: "The math behind every guess you make in LogicDash.",
		levels: ["core"],
		focus: ["data"],
		minutes: 8,
		live: true,
		group: "Reliability & Correction",
		teaches: ["Hamming distance"],
	},
	{
		title: "Error Correction, Explained",
		href: "/learn/error-correction",
		code: "9F1",
		blurb: "How computers detect and fix mistakes in data.",
		levels: ["advanced"],
		focus: ["data"],
		minutes: 12,
		live: true,
		group: "Reliability & Correction",
		teaches: ["Error detection", "Error correction", "Parity bits"],
	},
	{
		title: "Redundancy & Fault Tolerance",
		href: "/learn/redundancy-and-fault-tolerance",
		code: "1C7",
		blurb: "Spare parts and backup routes that keep things running.",
		levels: ["core"],
		focus: ["networks", "cyber"],
		minutes: 10,
		live: true,
		group: "Reliability & Correction",
		teaches: ["Redundancy", "Fault tolerance"],
	},

	// --- Networks & Systems ---
	{
		title: "Abstraction",
		href: "/learn/abstraction",
		code: "2A9",
		blurb: "How we use complicated things without knowing every detail.",
		levels: ["core"],
		focus: ["programming"],
		minutes: 10,
		live: true,
		group: "Networks & Systems",
		teaches: ["Abstraction", "Procedural abstraction", "Data abstraction"],
	},
	{
		title: "Inside the CPU",
		href: "/learn/inside-the-cpu",
		code: "3C6",
		blurb: "Fetch, decode, execute — what the processor does billions of times a second.",
		levels: ["core"],
		focus: ["networks"],
		minutes: 12,
		live: true,
		group: "Networks & Systems",
		teaches: ["CPU", "Fetch-decode-execute cycle", "Memory"],
	},
	{
		title: "Packets & Routing",
		href: "/learn/packets-and-routing",
		code: "3F5",
		blurb: "How your data travels the internet in small pieces.",
		levels: ["core"],
		focus: ["networks"],
		minutes: 10,
		live: true,
		group: "Networks & Systems",
		teaches: ["Packets", "Routing", "Internet protocols"],
	},
	{
		title: "Bandwidth & Latency",
		href: "/learn/bandwidth-and-latency",
		code: "4C1",
		blurb: "Why a fast connection can still feel slow.",
		levels: ["core"],
		focus: ["networks"],
		minutes: 12,
		live: true,
		group: "Networks & Systems",
		teaches: ["Bandwidth", "Latency"],
	},
	{
		title: "IPv4 vs IPv6",
		href: "/learn/ipv4-vs-ipv6",
		code: "5E6",
		blurb: "Why the internet needed a bigger address book.",
		levels: ["core"],
		focus: ["networks"],
		minutes: 10,
		live: true,
		group: "Networks & Systems",
		teaches: ["IP addresses", "IPv4", "IPv6"],
	},
	{
		title: "Scalability",
		href: "/learn/scalability",
		code: "6A4",
		blurb: "What has to change when a system gets popular.",
		levels: ["core"],
		focus: ["networks"],
		minutes: 8,
		live: true,
		group: "Networks & Systems",
		teaches: ["Scalability"],
	},
	{
		title: "Speedup",
		href: "/learn/speedup",
		code: "7C3",
		blurb: "Why four cooks aren't always four times faster.",
		levels: ["advanced"],
		focus: ["networks", "programming"],
		minutes: 12,
		live: true,
		group: "Networks & Systems",
		teaches: ["Parallel computing", "Speedup"],
	},
	{
		title: "Crowdsourcing & Distributed Computing",
		href: "/learn/distributed-computing",
		code: "9A5",
		blurb: "Split one huge job across many helpers.",
		levels: ["advanced"],
		focus: ["networks"],
		minutes: 12,
		live: true,
		group: "Networks & Systems",
		teaches: ["Distributed computing", "Crowdsourcing", "Parallel computing"],
	},

	// --- Security ---
	{
		title: "Encryption Basics",
		href: "/learn/encryption-basics",
		code: "1E9",
		blurb: "Locking data so only the right key can read it.",
		levels: ["starter"],
		focus: ["cyber"],
		minutes: 12,
		live: true,
		group: "Security",
		teaches: ["Encryption", "Symmetric encryption", "Caesar cipher"],
	},
	{
		title: "Public-Key Cryptography",
		href: "/learn/public-key-cryptography",
		code: "2F3",
		blurb: "How strangers share secrets without meeting first.",
		levels: ["advanced"],
		focus: ["cyber"],
		minutes: 12,
		live: true,
		group: "Security",
		teaches: ["Public-key encryption", "Asymmetric encryption"],
	},
	{
		title: "Password Strength & Entropy",
		href: "/learn/password-strength",
		code: "3A7",
		blurb: "What makes a password hard to guess — and how hard.",
		levels: ["starter"],
		focus: ["cyber"],
		minutes: 10,
		live: true,
		group: "Security",
		teaches: ["Password strength", "Entropy", "Brute-force attacks"],
	},
	{
		title: "Phishing Red Flags",
		href: "/learn/phishing",
		code: "4E2",
		blurb: "Spot the warning signs in a fake email.",
		levels: ["starter"],
		focus: ["cyber"],
		minutes: 10,
		live: true,
		group: "Security",
		teaches: ["Phishing", "Social engineering"],
	},

	// --- Practice ---
	{
		title: "Reading a Byte",
		href: "/learn/reading-a-byte",
		code: "5C9",
		blurb: "Turn any byte into a real number, step by step.",
		levels: ["starter"],
		focus: ["data"],
		minutes: 15,
		live: true,
		group: "Practice",
		teaches: ["Binary to decimal conversion"],
	},
	{
		title: "Writing a Byte",
		href: "/learn/writing-a-byte",
		code: "6F1",
		blurb: "Turn any number into binary, the way most people actually learn it.",
		levels: ["core"],
		focus: ["data"],
		minutes: 15,
		live: true,
		group: "Practice",
		teaches: ["Decimal to binary conversion"],
	},
	{
		title: "Lists & Loops",
		href: "/learn/lists-and-loops",
		code: "5E2",
		blurb: "Storing many values in one list, and repeating steps without repeating code.",
		levels: ["starter", "core"],
		focus: ["programming"],
		minutes: 12,
		live: true,
		group: "Programming & Algorithms",
		teaches: ["Lists", "Iteration", "Traversing a list"],
	},
	{
		title: "Debugging & Testing",
		href: "/learn/debugging-and-testing",
		code: "6E4",
		blurb: "Find the bug, then pick tests that would have caught it.",
		levels: ["core"],
		focus: ["programming"],
		minutes: 12,
		live: true,
		group: "Programming & Algorithms",
		teaches: ["Debugging", "Testing", "Edge cases"],
	},
	{
		title: "Binary Search",
		href: "/learn/binary-search",
		code: "7A6",
		blurb: "The smartest way to find a number — halve it every time.",
		levels: ["core"],
		focus: ["programming"],
		minutes: 12,
		live: true,
		group: "Programming & Algorithms",
		teaches: ["Binary search", "Linear search", "Algorithm efficiency"],
	},
	{
		title: "Sorting Algorithms",
		href: "/learn/sorting-algorithms",
		code: "9C2",
		blurb: "Watch a bubble sort put things in order, one swap at a time.",
		levels: ["core", "advanced"],
		focus: ["programming"],
		minutes: 15,
		live: true,
		group: "Programming & Algorithms",
		teaches: ["Sorting algorithms", "Bubble sort", "Algorithm efficiency"],
	},
	{
		title: "Pseudocode Practice",
		href: "/learn/pseudocode-practice",
		code: "5A2",
		blurb: "Endless code-reading questions at three levels. Build a streak.",
		levels: ["starter", "core", "advanced"],
		focus: ["programming"],
		minutes: 10,
		live: true,
		group: "Practice",
		kind: "tool",
		teaches: ["Pseudocode", "Reading code", "Tracing programs"],
	},
	{
		title: "Logic Gates & Truth Tables",
		href: "/learn/logic-gates",
		code: "1F3",
		blurb: "AND, OR and NOT — the tiny decisions every computer is built from.",
		levels: ["starter", "core"],
		focus: ["data", "programming"],
		minutes: 12,
		live: true,
		group: "Binary & Data",
		teaches: ["Logic gates", "Boolean logic", "Truth tables"],
	},
	{
		title: "Data, Metadata & Bias",
		href: "/learn/data-and-bias",
		code: "2E7",
		blurb: "Data about data, cleaning messy data, and how data can mislead.",
		levels: ["core"],
		focus: ["data", "impact"],
		minutes: 12,
		live: true,
		group: "Binary & Data",
		teaches: ["Metadata", "Data cleaning", "Bias in data"],
	},
	{
		title: "Your Digital Footprint",
		href: "/learn/digital-footprint",
		code: "4A9",
		blurb: "What you leave behind online, and how to keep it under control.",
		levels: ["starter"],
		focus: ["cyber", "impact"],
		minutes: 10,
		live: true,
		group: "Security",
		teaches: ["Personal data", "Digital footprint", "Privacy"],
	},
	{
		title: "Simulations & Randomness",
		href: "/learn/simulations",
		code: "7F2",
		blurb: "Flip a thousand coins in a second — and learn what simulations leave out.",
		levels: ["core"],
		focus: ["programming", "data"],
		minutes: 12,
		live: true,
		group: "Programming & Algorithms",
		teaches: ["Simulations", "Random numbers"],
	},
	{
		title: "Hard & Impossible Problems",
		href: "/learn/hard-problems",
		code: "9E3",
		blurb: "Problems too slow to solve exactly, and one no program can ever solve.",
		levels: ["advanced"],
		focus: ["programming"],
		minutes: 12,
		live: true,
		group: "Programming & Algorithms",
		teaches: ["Reasonable and unreasonable time", "Heuristics", "Undecidable problems"],
	},
	{
		title: "Bias & the Digital Divide",
		href: "/learn/bias-and-digital-divide",
		code: "1A5",
		blurb: "Who gets left out by technology — and how bias sneaks into code.",
		levels: ["starter", "core"],
		focus: ["impact"],
		minutes: 10,
		live: true,
		group: "Computing & Society",
		teaches: ["Digital divide", "Computing bias"],
	},
	{
		title: "Copyright, Creative Commons & Open Source",
		href: "/learn/copyright-and-open-source",
		code: "2C9",
		blurb: "What you can reuse, what you can't, and how creators share on purpose.",
		levels: ["starter", "core"],
		focus: ["impact"],
		minutes: 10,
		live: true,
		group: "Computing & Society",
		teaches: ["Copyright", "Creative Commons", "Open source"],
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
