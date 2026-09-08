// Shared game engine behind HammingGame.astro (random secret, standalone play) and the
// Quick Byte daily mode (deterministic secrets, sequenced rounds). Both drive this same
// logic against a HammingBoard root element so gameplay and styling stay identical.

// Flavor-text pools. Exported so a future "Share Result" feature can reuse the same
// selection logic and reproduce exactly what the player saw on screen.
export const WIN_FLAVOR_TEXT: Record<number, string[]> = {
	1: [
		"Lucky guess, or are you secretly the Oracle from The Matrix?",
		"One shot. Thanos would be proud.",
		"Either incredible instinct or you peeked. We won't ask.",
	],
	2: [
		"Fast. Suspiciously fast.",
		"That's faster than your WiFi reconnecting after a power cut.",
		"Sherlock Holmes could not have deduced it quicker.",
	],
	3: [
		"Solid. A modern CPU would be jealous of that clock speed.",
		"Efficient. Very 'best practices.'",
		"Clean solve. Textbook, almost.",
	],
	4: [
		"Respectable. Somewhere between a smartphone and a calculator, speed-wise.",
		"Good work — you'd survive a technical interview.",
		"R2-D2 would beep approvingly.",
	],
	5: [
		"You're slower than a Commodore 64 loading a game from tape.",
		"Getting there — like buffering on old YouTube.",
		"That's the scenic route, but you made it.",
	],
	6: [
		"Down to the wire — dial-up modem energy.",
		"Nail-biter. Respect for not giving up.",
		"Right under the wire — like finishing an exam as time's called.",
	],
};

export const LOSS_FLAVOR_TEXT: string[] = [
	"Out of attempts. Even dial-up would've gotten there eventually.",
	"No dice. Time to reboot and try again.",
	"The signal was lost. Try recalibrating.",
	"Not today — even HAL 9000 has off days.",
	"Connection timed out. Give it another shot.",
	"System failure. Blame the hardware, not yourself.",
	"You've been disconnected. Try reconnecting.",
];

function pickRandom<T>(items: T[]): T {
	return items[Math.floor(Math.random() * items.length)];
}

export function winFlavorText(attempts: number): string {
	const bucketKey = Math.min(Math.max(attempts, 1), 6);
	return pickRandom(WIN_FLAVOR_TEXT[bucketKey] ?? WIN_FLAVOR_TEXT[6]);
}

export function lossFlavorText(): string {
	return pickRandom(LOSS_FLAVOR_TEXT);
}

export function randomBinaryString(length: number): string {
	let result = "";
	for (let i = 0; i < length; i++) {
		result += Math.random() < 0.5 ? "0" : "1";
	}
	return result;
}

function attemptsLeftLabel(remaining: number): string {
	return `${remaining} attempt${remaining === 1 ? "" : "s"} left`;
}

function hammingDistance(a: string, b: string): number {
	let distance = 0;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) distance++;
	}
	return distance;
}

/** 0 (farthest) to 1 (closest, excluding an actual match) — shared by color and the badge's fill bar. */
export function distanceCloseness(distance: number, bitLength: number): number {
	const steps = Math.max(bitLength - 1, 1);
	return 1 - (distance - 1) / steps;
}

export function distanceColor(distance: number, bitLength: number): string {
	// distance ranges 1..bitLength here (0 is a match, handled separately as fixed green).
	// Stay within the site's amber hue rather than rotating through the rainbow: farther
	// guesses get a duller, darker amber; closer guesses get a brighter, richer one. The
	// range is deliberately wide so adjacent distances don't blur into each other.
	//
	// The lightness floor (46%, was 32%) is load-bearing for WCAG AA: this color is used
	// as both the badge's text color and its border/fill, and the farthest-guess end of
	// the old range (hsl(36 45% 32%)) contrast-checked at only ~2.8:1 against the badge's
	// own background — a real, common failure, since a wide first guess is the most
	// frequent case. 46% is the minimum that clears 4.5:1 at this saturation.
	const t = distanceCloseness(distance, bitLength);
	const hue = 36;
	const saturation = 45 + t * 50;
	const lightness = 46 + t * 24;
	return `hsl(${hue}deg ${saturation}% ${lightness}%)`;
}

function getScopeAttr(root: HTMLElement): string | null {
	return root.getAttributeNames().find((name) => name.startsWith("data-astro-cid")) ?? null;
}

function createScopedElement<K extends keyof HTMLElementTagNameMap>(
	tag: K,
	className: string,
	scopeAttr: string | null,
): HTMLElementTagNameMap[K] {
	const el = document.createElement(tag);
	el.className = className;
	if (scopeAttr) el.setAttribute(scopeAttr, "");
	return el;
}

const SVG_NS = "http://www.w3.org/2000/svg";

export const SEGMENT_POINTS: Record<string, string> = {
	a: "8,8 14,2 46,2 52,8 46,14 14,14",
	b: "52,8 58,14 58,44 52,50 46,44 46,14",
	c: "52,50 58,56 58,86 52,92 46,86 46,56",
	d: "8,92 14,86 46,86 52,92 46,98 14,98",
	e: "8,50 14,56 14,86 8,92 2,86 2,56",
	f: "8,8 14,14 14,44 8,50 2,44 2,14",
	g: "8,50 14,44 46,44 52,50 46,56 14,56",
};

export const SEGMENTS_BY_DIGIT: Record<string, string[]> = {
	"0": ["a", "b", "c", "d", "e", "f"],
	"1": ["b", "c"],
};

function applyDigit(root: Element, value: string) {
	const active = new Set(SEGMENTS_BY_DIGIT[value] ?? []);
	root.querySelectorAll<SVGPolygonElement>(".segment").forEach((segment) => {
		const segId = segment.getAttribute("data-seg");
		segment.classList.toggle("shape-on", segId !== null && active.has(segId));
	});
}

function createBitDigitSvg(scopeAttr: string | null): SVGSVGElement {
	const svg = document.createElementNS(SVG_NS, "svg") as unknown as SVGSVGElement;
	svg.setAttribute("viewBox", "0 0 60 100");
	svg.setAttribute("aria-hidden", "true");
	svg.setAttribute("class", "bit-digit");
	if (scopeAttr) svg.setAttribute(scopeAttr, "");
	for (const [seg, points] of Object.entries(SEGMENT_POINTS)) {
		const polygon = document.createElementNS(SVG_NS, "polygon");
		polygon.setAttribute("points", points);
		polygon.setAttribute("data-seg", seg);
		polygon.setAttribute("class", "segment");
		if (scopeAttr) polygon.setAttribute(scopeAttr, "");
		svg.appendChild(polygon);
	}
	return svg;
}

function createDistanceBadge(distance: number, bitLength: number, scopeAttr: string | null): HTMLSpanElement {
	const badge = createScopedElement("span", "distance-badge", scopeAttr);
	const label = createScopedElement("span", "distance-badge-label", scopeAttr);
	const bar = createScopedElement("span", "distance-badge-bar", scopeAttr);
	const fill = createScopedElement("span", "distance-badge-fill", scopeAttr);

	if (distance === 0) {
		badge.classList.add("distance-badge--match");
		badge.style.setProperty("--badge-color", "var(--color-success)");
		label.textContent = "Match!";
		fill.style.width = "100%";
	} else {
		badge.style.setProperty("--badge-color", distanceColor(distance, bitLength));
		label.textContent = `${distance} bit${distance === 1 ? "" : "s"} off`;
		fill.style.width = `${Math.round(distanceCloseness(distance, bitLength) * 100)}%`;
	}

	bar.appendChild(fill);
	badge.appendChild(label);
	badge.appendChild(bar);
	return badge;
}

export interface RoundResult {
	won: boolean;
	attempts: number;
	secret: string;
}

export interface GuessInfo {
	bits: string;
	distance: number;
	attempts: number;
	won: boolean;
	gameOver: boolean;
}

export interface HammingGameOptions {
	bitLength: number;
	maxAttempts: number;
	/** Fixed secret for this round (e.g. a daily-seeded puzzle). Random if omitted. */
	secret?: string;
	/** Whether the built-in "Play Again" control should appear when a round ends. Defaults to true. */
	showPlayAgain?: boolean;
	/** Called once a round ends, win or lose. */
	onRoundEnd?: (result: RoundResult) => void;
	/** Called after every guess (whether or not it ends the round) — for progress persistence. */
	onGuess?: (info: GuessInfo) => void;
}

export interface HammingGameController {
	/** Starts a fresh round on the same board. Random secret if none is given. */
	reset: (secret?: string) => void;
	/**
	 * Replays previously-made guesses onto a freshly reset board (same secret), to restore
	 * a round exactly where the player left off. Fires onGuess/onRoundEnd as usual.
	 */
	restore: (guesses: string[]) => void;
}

export function createHammingGame(root: HTMLElement, options: HammingGameOptions): HammingGameController {
	const { bitLength, maxAttempts, showPlayAgain = true, onRoundEnd, onGuess } = options;
	const scopeAttr = getScopeAttr(root);

	const form = root.querySelector<HTMLFormElement>(".guess-form")!;
	const toggles = Array.from(root.querySelectorAll<HTMLButtonElement>(".bit-toggle"));
	const submitButton = root.querySelector<HTMLButtonElement>(".guess-submit")!;
	const status = root.querySelector<HTMLParagraphElement>(".game-status")!;
	const banner = root.querySelector<HTMLDivElement>(".game-banner")!;
	const bannerMain = banner.querySelector<HTMLParagraphElement>(".game-banner-main")!;
	const bannerFlavor = banner.querySelector<HTMLParagraphElement>(".game-banner-flavor")!;
	const playAgainButton = root.querySelector<HTMLButtonElement>(".play-again")!;
	const history = root.querySelector<HTMLDivElement>(".guess-history")!;

	let secret = options.secret ?? randomBinaryString(bitLength);
	let attempts = 0;
	let gameOver = false;
	const previousGuesses = new Set<string>();

	function setStatus(text: string, isWarning = false) {
		status.textContent = text;
		status.classList.toggle("game-status--warning", isWarning);
	}

	function toggleBit(button: HTMLButtonElement) {
		if (gameOver) return;
		const nextValue = button.dataset.value === "0" ? "1" : "0";
		button.dataset.value = nextValue;
		applyDigit(button, nextValue);
		button.setAttribute("aria-pressed", nextValue === "1" ? "true" : "false");
		button.setAttribute(
			"aria-label",
			`Bit ${Number(button.dataset.index) + 1}, currently ${nextValue}, tap to flip`,
		);
	}

	function currentGuess(): string {
		return toggles.map((t) => t.dataset.value).join("");
	}

	function resetToggles() {
		for (const toggle of toggles) {
			toggle.dataset.value = "0";
			applyDigit(toggle, "0");
			toggle.setAttribute("aria-pressed", "false");
			toggle.setAttribute("aria-label", `Bit ${Number(toggle.dataset.index) + 1}, currently 0, tap to flip`);
		}
	}

	function renderGuessRow(attemptNumber: number, guess: string, distance: number) {
		const row = createScopedElement("div", "guess-row", scopeAttr);

		const number = createScopedElement("span", "guess-number", scopeAttr);
		number.textContent = `#${attemptNumber}`;

		const tiles = createScopedElement("div", "guess-tiles", scopeAttr);
		for (const bit of guess) {
			const tile = createScopedElement(
				"span",
				bit === "1" ? "guess-tile guess-tile--on" : "guess-tile",
				scopeAttr,
			);
			tile.setAttribute("data-value", bit);
			tile.appendChild(createBitDigitSvg(scopeAttr));
			applyDigit(tile, bit);
			tiles.appendChild(tile);
		}

		const badge = createDistanceBadge(distance, bitLength, scopeAttr);

		row.appendChild(number);
		row.appendChild(tiles);
		row.appendChild(badge);
		history.prepend(row);
	}

	function showBanner(kind: "success" | "failure", text: string, flavor: string) {
		bannerMain.textContent = text;
		bannerFlavor.textContent = flavor;
		banner.className = `game-banner game-banner--${kind}`;
		banner.hidden = false;
	}

	function endGame(won: boolean) {
		gameOver = true;
		for (const toggle of toggles) toggle.disabled = true;
		submitButton.disabled = true;
		setStatus("");
		if (won) {
			showBanner(
				"success",
				`You matched it in ${attempts} guess${attempts === 1 ? "" : "es"}!`,
				winFlavorText(attempts),
			);
		} else {
			showBanner("failure", `Out of attempts. The answer was ${secret}.`, lossFlavorText());
		}
		if (showPlayAgain) playAgainButton.hidden = false;
		onRoundEnd?.({ won, attempts, secret });
	}

	function resetRound(nextSecret?: string) {
		secret = nextSecret ?? randomBinaryString(bitLength);
		attempts = 0;
		gameOver = false;
		previousGuesses.clear();
		history.replaceChildren();
		resetToggles();
		for (const toggle of toggles) toggle.disabled = false;
		submitButton.disabled = false;
		banner.hidden = true;
		bannerMain.textContent = "";
		bannerFlavor.textContent = "";
		playAgainButton.hidden = true;
		setStatus(`${attemptsLeftLabel(maxAttempts)}. Tap bits to set your first guess.`);
	}

	function applyGuess(guess: string) {
		if (gameOver) return;

		if (previousGuesses.has(guess)) {
			setStatus("You've already tried this combination.", true);
			return;
		}

		previousGuesses.add(guess);
		attempts++;
		const distance = hammingDistance(guess, secret);
		renderGuessRow(attempts, guess, distance);
		resetToggles();

		const won = distance === 0;
		if (won) {
			endGame(true);
		} else if (attempts >= maxAttempts) {
			endGame(false);
		} else {
			setStatus(attemptsLeftLabel(maxAttempts - attempts));
		}

		onGuess?.({ bits: guess, distance, attempts, won, gameOver });
	}

	function submitGuess(event: SubmitEvent) {
		event.preventDefault();
		applyGuess(currentGuess());
	}

	function restore(guesses: string[]) {
		for (const guess of guesses) {
			applyGuess(guess);
		}
	}

	resetRound(secret);

	for (const toggle of toggles) {
		toggle.addEventListener("click", () => toggleBit(toggle));
	}
	form.addEventListener("submit", submitGuess);
	playAgainButton.addEventListener("click", () => resetRound());

	return {
		reset: resetRound,
		restore,
	};
}
