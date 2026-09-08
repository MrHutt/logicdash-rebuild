// Drives the split-flap (departure-board) digit style's flip animation.
// Structurally unrelated to segmentDigits.ts — there's no 7-segment shape
// here at all, just two static text halves plus two animated "leaf" halves
// that flip over in sequence to reveal a new digit, the way a real
// mechanical board does.
//
// Each half (top/bottom static, front/back leaf) is a positioned/clipped
// *container* — that's what SplitFlapDigit.astro's CSS animates and
// positions — with the actual glyph living in a nested .flap-num span
// inside it, since the clipping technique needs the text absolutely
// positioned independently of the container's own transform.
//
// Sequencing is driven by setTimeout (matching the CSS animation-duration
// values in SplitFlapDigit.astro) rather than animationend listeners — an
// earlier version used animationend, but under rapid retriggering (a digit
// changing again before its ~640ms two-stage flip finished, easily possible
// since ticks fire every 1000ms but several can queue up) the event proved
// unreliable: it didn't consistently fire for a superseded animation, which
// left some cells permanently showing a stale value. A plain timer has no
// such dependency on the animation subsystem actually dispatching an event.

const FRONT_FALL_MS = 320;
const BACK_REVEAL_MS = 320;

function numSpan(cell: Element, attr: string): HTMLElement | null {
	return cell.querySelector<HTMLElement>(`[${attr}] .flap-num`);
}

function container(cell: Element, attr: string): HTMLElement | null {
	return cell.querySelector<HTMLElement>(`[${attr}]`);
}

// A per-cell generation counter: incremented on every call, and captured by
// each transition's timeouts. If a digit changes again before an
// in-progress transition's timeouts fire, the older timeouts see a mismatch
// and bail out instead of stomping the newer, correct state.
const generations = new WeakMap<HTMLElement, number>();

/**
 * Updates one split-flap cell to `value`, animating a flip only if the
 * value actually changed. Every render call re-applies all six digits
 * regardless of whether they changed (see countdown-clock.astro's
 * renderDigits()), so this guard is what stops every digit from replaying
 * the flip animation every single tick even when it's showing the same
 * number as a second ago.
 */
export function applySplitFlapDigit(cell: HTMLElement, value: string) {
	if (cell.dataset.value === value) return;
	const previous = cell.dataset.value ?? value;
	cell.dataset.value = value;

	const generation = (generations.get(cell) ?? 0) + 1;
	generations.set(cell, generation);

	const topStatic = numSpan(cell, "data-flap-static-top");
	const bottomStatic = numSpan(cell, "data-flap-static-bottom");
	const frontLeafEl = container(cell, "data-flap-front");
	const backLeafEl = container(cell, "data-flap-back");
	const frontNum = numSpan(cell, "data-flap-front");
	const backNum = numSpan(cell, "data-flap-back");
	if (!topStatic || !bottomStatic || !frontLeafEl || !backLeafEl || !frontNum || !backNum) return;

	// Stage 1: the front leaf shows the *old* top half and sits exactly over
	// the static top half (so starting the animation causes no visible
	// jump), then folds down and away like a page falling forward.
	//
	// The static top half underneath is set to the *new* value immediately,
	// not after the fall completes — it's fully hidden behind the front leaf
	// for the whole 320ms fall regardless (the leaf sits at a higher
	// z-index), so there's no visual difference in when it's written, but
	// waiting until the fall's setTimeout fires made the reveal depend on
	// timer precision matching the CSS animation's real paint completion.
	// Any slack between the two showed up as exactly the symptom reported:
	// a perceptible extra beat before the top half displayed the new digit.
	// Writing it up front means the instant the leaf rotates edge-on and
	// disappears, the correct value is already sitting there with zero
	// dependency on the timer.
	topStatic.textContent = value;
	frontNum.textContent = previous;
	backLeafEl.classList.remove("is-flipping-back");
	frontLeafEl.classList.remove("is-flipping-front");
	// Force a reflow so re-adding the class restarts the animation even if
	// the digit changes again before the previous flip finished.
	void frontLeafEl.offsetWidth;
	frontLeafEl.classList.add("is-flipping-front");

	window.setTimeout(() => {
		// A newer transition has since started on this cell — its own timers
		// own the reveal now; this stale one must not touch anything.
		if (generations.get(cell) !== generation) return;

		// Deliberately NOT removing "is-flipping-front" here. The front leaf's
		// *unclassed* rest state has no transform at all (flat/face-forward,
		// still showing its stale `previous` text) — only the "is-flipping-
		// front" class's fill-mode: forwards holds it rotated edge-on/hidden
		// once the fall finishes. Removing the class at this point snapped it
		// straight back to flat and visible, instantly re-covering the
		// correctly-updated top half with the *old* digit again — a real
		// "flips, then immediately un-flips" glitch, not just a fast/subtle
		// animation. It stays exactly as-is (fallen, hidden) until the next
		// transition's own remove-reflow-add sequence resets and restarts it.

		// Stage 2: the back leaf starts edge-on (hidden) already showing the
		// *new* bottom half, and unfolds down to sit flush over the static
		// bottom half, completing the reveal.
		//
		// bottomStatic is deliberately NOT written here, unlike topStatic
		// above — the two leaves are mirror images of each other, not the
		// same case. The front leaf starts flat/opaque and ends edge-on, so
		// it fully hides topStatic for its *entire* fall no matter when
		// topStatic is written. The back leaf starts edge-on and ends
		// flat — the opposite — so it provides essentially zero coverage at
		// the *start* of its unfold. Writing bottomStatic's new value here,
		// at that same moment, exposed the new digit through the
		// still-edge-on leaf almost immediately, well before the flap had
		// visibly unfolded — "shown a fraction too early." bottomStatic now
		// only gets written once the unfold has actually finished below,
		// at which point the (still-flat, still-visible) back leaf and the
		// static layer underneath show the identical value, so the swap is
		// invisible.
		backNum.textContent = value;
		void backLeafEl.offsetWidth;
		backLeafEl.classList.add("is-flipping-back");

		window.setTimeout(() => {
			if (generations.get(cell) !== generation) return;
			bottomStatic.textContent = value;
			backLeafEl.classList.remove("is-flipping-back");
		}, BACK_REVEAL_MS);
	}, FRONT_FALL_MS);
}

/** Sets a cell's displayed value instantly, with no flip animation — used
 *  when first mounting the display or when switching styles, so the
 *  split-flap view doesn't play a flip for every digit the moment it
 *  becomes visible. Also bumps the generation counter, so any pending
 *  timeout from an in-flight transition becomes stale and no-ops instead of
 *  overwriting this instant value when it fires. */
export function setSplitFlapDigitInstant(cell: HTMLElement, value: string) {
	cell.dataset.value = value;
	generations.set(cell, (generations.get(cell) ?? 0) + 1);

	const topStatic = numSpan(cell, "data-flap-static-top");
	const bottomStatic = numSpan(cell, "data-flap-static-bottom");
	const frontLeafEl = container(cell, "data-flap-front");
	const backLeafEl = container(cell, "data-flap-back");
	const frontNum = numSpan(cell, "data-flap-front");
	const backNum = numSpan(cell, "data-flap-back");

	if (frontLeafEl) frontLeafEl.classList.remove("is-flipping-front");
	if (backLeafEl) backLeafEl.classList.remove("is-flipping-back");
	if (topStatic) topStatic.textContent = value;
	if (bottomStatic) bottomStatic.textContent = value;
	if (frontNum) frontNum.textContent = value;
	if (backNum) backNum.textContent = value;
}
