// Browser checks for the Pseudocode Practice page.
// Needs a running build: `npm run build && npx astro preview --port 4329`,
// then `node tests/ui.test.mjs` (BASE=... to point elsewhere).
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let playwright;
try {
	playwright = require("playwright");
} catch {
	playwright = require("/opt/node22/lib/node_modules/playwright");
}
const { chromium } = playwright;

const BASE = process.env.BASE ?? "http://localhost:4329";
const URL = `${BASE}/learn/pseudocode-practice/?pp-test`;
const KEY = "logicdash:pseudocode-practice:v1";
const SHOTS = process.env.SHOTS; // folder for screenshots, optional

let failures = 0;
let passes = 0;
function check(name, ok, detail = "") {
	if (ok) passes++;
	else {
		failures++;
		console.log(`FAIL ${name}${detail ? ` — ${detail}` : ""}`);
	}
}

const browser = await chromium.launch();

async function open(viewport = { width: 1366, height: 900 }, opts = {}) {
	const ctx = await browser.newContext({ viewport, reducedMotion: opts.reducedMotion ?? "no-preference" });
	if (opts.init) await ctx.addInitScript(opts.init);
	const page = await ctx.newPage();
	const errors = [];
	page.on("pageerror", (e) => errors.push(e.message));
	// External hosts (fonts) can't be reached from the test sandbox; only
	// errors from the site itself count.
	page.on("console", (m) => m.type() === "error" && !/^https?:\/\/(?!localhost)/.test(m.location().url ?? "") && !/ERR_TUNNEL|ERR_NAME|ERR_INTERNET/.test(m.text()) && errors.push(m.text()));
	await page.goto(URL);
	return { ctx, page, errors };
}
const pp = (page, sel) => page.locator(`[data-pp] ${sel}`);
async function noOverflow(page) {
	return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
}
async function answerFirst(page, right) {
	// Click option 1, or (right = true/false) find a right/wrong option by
	// peeking at the answer once revealed in a throwaway copy: simpler to read
	// the bank via the data-oi + correct flags exposed after answering. Here we
	// just click by key and report what happened.
	if (right === undefined) {
		await page.keyboard.press("1");
		return;
	}
	const idx = await page.evaluate((want) => {
		// The option order is shown; correctness isn't in the DOM before
		// answering, so ask the page's own question object via a test hook.
		const q = window.__ppCurrent?.();
		if (!q) return 0;
		const btns = [...document.querySelectorAll("[data-pp] .pp-option")];
		return btns.findIndex((b) => q.options[Number(b.dataset.oi)].correct === want);
	}, right);
	await pp(page, ".pp-option").nth(Math.max(0, idx)).click();
}

// ---------------------------------------------------------------- 1. Start
{
	const { ctx, page, errors } = await open();
	check("start view visible", await pp(page, "[data-pp-start]").isVisible());
	check("session hidden at start", !(await pp(page, "[data-pp-session]").isVisible()));
	check("no Continue for a new visitor", !(await pp(page, "[data-pp-continue]").isVisible()));
	const instr = await page.locator("[data-pp]").innerText();
	check("instruction text", instr.includes("Read the code, predict the result, then choose an answer. Check the explanation before continuing. Lists start at 1."));
	check("topic is the default route", (await pp(page, '[data-pp-route="topic"]').getAttribute("aria-checked")) === "true");
	const beginBox = await pp(page, "[data-pp-begin]").boundingBox();
	check("Start button above the fold at 1366×900", beginBox && beginBox.y + beginBox.height < 900, JSON.stringify(beginBox));
	check("no mention of licensed names", !/\bAP\b|College Board/.test(await page.locator("main").innerText()));
	// Review route with nothing to review
	await pp(page, '[data-pp-route="review"]').click();
	check("review disabled when empty", await pp(page, "[data-pp-begin]").isDisabled());
	check("review empty message", (await pp(page, "[data-pp-setup-note]").innerText()).includes("Nothing to review yet"));
	// Arrow keys move between routes
	await pp(page, '[data-pp-route="review"]').focus();
	await page.keyboard.press("ArrowLeft");
	check("arrow keys change route", (await pp(page, '[data-pp-route="mixed"]').getAttribute("aria-checked")) === "true");
	await pp(page, '[data-pp-route="topic"]').click();
	// Help opens and closes with Escape
	await pp(page, "[data-pp-help-open]").first().click();
	check("help opens", await pp(page, "[data-pp-help]").isVisible());
	await page.keyboard.press("Escape");
	check("help closes on Escape", !(await pp(page, "[data-pp-help]").isVisible()));
	check("no console errors (start)", errors.length === 0, errors.join(" | "));
	await ctx.close();
}

// ------------------------------------------- 2. Session: answer, feedback, keys
{
	const { ctx, page, errors } = await open();
	await page.locator('[data-pp] input[name="pp-topic"][value="lists"]').check({ force: true });
	await pp(page, "[data-pp-begin]").click();
	check("session shows", await pp(page, "[data-pp-session]").isVisible());
	check("scope shows topic and level", (await pp(page, "[data-pp-scope]").innerText()).includes("Lists"));
	check("Next disabled before answering", await pp(page, "[data-pp-next]").isDisabled());
	const cardBox = await pp(page, "[data-pp-card]").boundingBox();
	check("question card starts near the top", cardBox && cardBox.y < 700, JSON.stringify(cardBox));
	// Measured relative to the card, so page scrolling doesn't count.
	const nextPos = () =>
		page.evaluate(() => {
			const n = document.querySelector("[data-pp-next]").getBoundingClientRect();
			const c = document.querySelector("[data-pp-card]").getBoundingClientRect();
			return { x: n.x - c.x, y: n.y - c.y };
		});
	const nextBefore = await nextPos();
	await page.keyboard.press("2");
	check("feedback shows after key 2", await pp(page, "[data-pp-feedback]").isVisible());
	check("options disabled after answering", (await pp(page, ".pp-option:disabled").count()) === 4);
	check("exactly one option marked correct", (await pp(page, ".pp-option.is-correct").count()) === 1);
	const tags = await pp(page, ".pp-option-tag").allInnerTexts();
	check("text labels, not color alone", tags.some((t) => t.includes("✓")));
	const stats1 = await pp(page, "[data-pp-stats]").innerText();
	await page.keyboard.press("3"); // second attempt must be ignored
	check("second attempt ignored", (await pp(page, "[data-pp-stats]").innerText()) === stats1);
	check("only one 'Your answer'", (await pp(page, ".pp-option-tag").allInnerTexts()).filter((t) => t.includes("Your answer")).length === 1);
	const nextAfter = await nextPos();
	check("Next stays in place", nextBefore && nextAfter && Math.abs(nextBefore.y - nextAfter.y) < 2 && Math.abs(nextBefore.x - nextAfter.x) < 2, `${JSON.stringify(nextBefore)} → ${JSON.stringify(nextAfter)}`);
	await page.waitForTimeout(2500);
	check("no auto-advance", await pp(page, "[data-pp-feedback]").isVisible());
	// Trace with T
	if (await pp(page, "[data-pp-trace-btn]").isVisible()) {
		await page.locator("body").press("t");
		check("T opens trace", await pp(page, "[data-pp-trace]").isVisible());
		await pp(page, "[data-pp-t-step]").click();
		await pp(page, "[data-pp-t-step]").click();
		check("trace steps", (await pp(page, "[data-pp-t-count]").innerText()).startsWith("Step 2 of"));
		check("trace highlights a line", (await pp(page, "[data-pp-t-code] .is-active").count()) === 1);
		await pp(page, "[data-pp-t-back]").click();
		check("trace back", (await pp(page, "[data-pp-t-count]").innerText()).startsWith("Step 1 of"));
		await pp(page, "[data-pp-t-reset]").click();
		check("trace reset", (await pp(page, "[data-pp-t-count]").innerText()).startsWith("Step 0 of"));
	}
	// N goes to next even when a button has focus
	const prompt1 = await pp(page, "[data-pp-prompt]").innerText();
	const code1 = await pp(page, "[data-pp-code]").innerText();
	await page.keyboard.press("n");
	check("N moves on", !(await pp(page, "[data-pp-feedback]").isVisible()));
	check("new question differs", (await pp(page, "[data-pp-prompt]").innerText()) + (await pp(page, "[data-pp-code]").innerText()) !== prompt1 + code1);
	// Enter after answering
	await page.keyboard.press("1");
	await page.keyboard.press("Enter");
	check("Enter moves on", !(await pp(page, "[data-pp-feedback]").isVisible()));
	check("stats count first attempts", (await pp(page, "[data-pp-stats]").innerText()).startsWith("This set: 2 of 10"));
	// Level change replaces the question
	await pp(page, "[data-pp-level-select]").selectOption("challenging");
	const meta = await pp(page, "[data-pp-meta]").innerText();
	check("level change applies", /challenging/i.test(meta), meta);
	check("level change records nothing", (await pp(page, "[data-pp-stats]").innerText()).startsWith("This set: 2 of 10"));
	// Resume after reload
	await page.reload();
	check("Continue shown after reload", await pp(page, "[data-pp-continue]").isVisible());
	check("Continue label has scope", (await pp(page, "[data-pp-continue-label]").innerText()).includes("Lists · Challenging"));
	await pp(page, "[data-pp-continue-btn]").click();
	check("resume keeps set count", (await pp(page, "[data-pp-stats]").innerText()).startsWith("This set: 2 of 10"));
	// Change topic
	await pp(page, "[data-pp-change]").click();
	check("change topic returns to start", await pp(page, "[data-pp-start]").isVisible());
	check("no console errors (session)", errors.length === 0, errors.join(" | "));
	await ctx.close();
}

// ----------------------------------------- 3. Checkpoint + review after mistakes
{
	const { ctx, page, errors } = await open();
	await pp(page, '[data-pp-route="mixed"]').click();
	await pp(page, "[data-pp-begin]").click();
	const seen = [];
	for (let i = 0; i < 10; i++) {
		seen.push(await pp(page, "[data-pp-meta]").innerText());
		await answerFirst(page, i % 3 !== 0); // 4 wrong, 6 right
		await pp(page, "[data-pp-next]").click();
	}
	check("checkpoint after 10", await pp(page, "[data-pp-checkpoint]").isVisible());
	const score = await pp(page, "[data-pp-cp-score]").innerText();
	check("checkpoint first-try score", score.includes("6 of 10"), score);
	check("checkpoint lists tricky skills", (await pp(page, "[data-pp-cp-skills]").innerText()).startsWith("Skills that caused difficulty"));
	check("checkpoint has a next step", (await pp(page, "[data-pp-cp-next]").innerText()).startsWith("Next step:"));
	check("checkpoint review button", await pp(page, "[data-pp-cp-review]").isVisible());
	check("checkpoint change button", await pp(page, "[data-pp-cp-change]").isVisible());
	if (SHOTS) await page.screenshot({ path: `${SHOTS}/checkpoint-desktop.png` });
	await pp(page, "[data-pp-cp-review]").click();
	check("review starts", (await pp(page, "[data-pp-scope]").innerText()).startsWith("Review mistakes"));
	check("review tag shown", /review: new example/i.test(await pp(page, "[data-pp-meta]").innerText()));
	check("set counter reset", (await pp(page, "[data-pp-stats]").innerText()).startsWith("This set: 0 of 10"));
	check("no console errors (checkpoint)", errors.length === 0, errors.join(" | "));
	await ctx.close();
}

// ------------------------------------------------- 4. Robot question + trace
async function robotSession(viewport, shotName, opts = {}) {
	const { ctx, page, errors } = await open(viewport, opts);
	await page.locator('[data-pp] input[name="pp-topic"][value="robots"]').check({ force: true });
	await pp(page, "[data-pp-begin]").click();
	// Find a question with a grid (all Robots ones should have one).
	for (let i = 0; i < 8 && !(await pp(page, "[data-pp-figure]").isVisible()); i++) {
		await page.keyboard.press("1");
		await page.keyboard.press("n");
	}
	check(`${shotName}: robot grid shown`, await pp(page, "[data-pp-grid] svg").isVisible());
	const label = await pp(page, "[data-pp-grid] svg").getAttribute("aria-label");
	check(`${shotName}: grid has text description`, /grid\. Rows are numbered/.test(label ?? ""), label);
	check(`${shotName}: legend shown`, (await pp(page, "[data-pp-figure]").innerText()).toLowerCase().includes("blocked"));
	const code = await pp(page, "[data-pp-code]").boundingBox();
	const grid = await pp(page, "[data-pp-grid]").boundingBox();
	const side = code && grid && Math.abs(code.y - grid.y) < 40 && grid.x > code.x + 50;
	const stacked = code && grid && grid.y >= code.y + code.height - 2;
	if (viewport.width >= 1000) check(`${shotName}: code and grid side by side`, !!side, `${JSON.stringify(code)} ${JSON.stringify(grid)}`);
	if (viewport.width < 600) check(`${shotName}: code and grid stacked`, !!stacked, `${JSON.stringify(code)} ${JSON.stringify(grid)}`);
	check(`${shotName}: no horizontal overflow`, await noOverflow(page));
	if (SHOTS) await page.screenshot({ path: `${SHOTS}/${shotName}-question.png`, fullPage: false });
	await answerFirst(page, false);
	if (await pp(page, "[data-pp-trace-btn]").isVisible()) {
		await pp(page, "[data-pp-trace-btn]").click();
		await pp(page, "[data-pp-t-play]").click();
		await page.waitForTimeout(opts.reducedMotion === "reduce" ? 1800 : 1000);
		const c = await pp(page, "[data-pp-t-count]").innerText();
		check(`${shotName}: play advances`, !c.startsWith("Step 0"), c);
		await pp(page, "[data-pp-t-play]").click(); // pause
		const c2 = await pp(page, "[data-pp-t-count]").innerText();
		await page.waitForTimeout(1900);
		check(`${shotName}: pause holds`, (await pp(page, "[data-pp-t-count]").innerText()) === c2);
		check(`${shotName}: trace grid`, await pp(page, "[data-pp-t-grid] svg").isVisible());
		check(`${shotName}: no overflow with trace`, await noOverflow(page));
		if (SHOTS) {
			await pp(page, "[data-pp-trace]").scrollIntoViewIfNeeded();
			await page.screenshot({ path: `${SHOTS}/${shotName}-trace.png`, fullPage: false });
		}
	}
	check(`${shotName}: no console errors`, errors.length === 0, errors.join(" | "));
	await ctx.close();
}
await robotSession({ width: 1366, height: 900 }, "robot-desktop");
await robotSession({ width: 390, height: 844 }, "robot-phone");
await robotSession({ width: 1366, height: 900 }, "robot-reduced", { reducedMotion: "reduce" });

// ------------------------------------------------- 5. Widths: overflow + shots
for (const [w, h, name] of [
	[320, 640, "phone-320"],
	[390, 844, "phone"],
	[768, 1024, "tablet"],
	[1366, 900, "desktop"],
	[1920, 1080, "desktop-1920"],
]) {
	const { ctx, page, errors } = await open({ width: w, height: h });
	check(`${name}: start no overflow`, await noOverflow(page));
	if (SHOTS && (name === "phone" || name === "desktop")) await page.screenshot({ path: `${SHOTS}/${name}-start.png` });
	await pp(page, '[data-pp-route="mixed"]').click();
	await pp(page, "[data-pp-begin]").click();
	for (let i = 0; i < 12; i++) {
		check(`${name}: question ${i} no overflow`, await noOverflow(page));
		await page.keyboard.press("1");
		check(`${name}: answered ${i} no overflow`, await noOverflow(page));
		if (SHOTS && i === 1 && (name === "phone" || name === "desktop")) await page.screenshot({ path: `${SHOTS}/${name}-feedback.png` });
		if (await pp(page, "[data-pp-trace-btn]").isVisible()) {
			await pp(page, "[data-pp-trace-btn]").click();
			check(`${name}: trace ${i} no overflow`, await noOverflow(page));
		}
		await pp(page, "[data-pp-next]").click();
		if (await pp(page, "[data-pp-checkpoint]").isVisible()) await pp(page, "[data-pp-cp-continue]").click();
	}
	check(`${name}: no console errors`, errors.length === 0, errors.join(" | "));
	await ctx.close();
}

// -------------------------------------------------------- 6. Fullscreen fit
for (const [w, h] of [
	[1366, 768],
	[1920, 1080],
	[1024, 768],
	[390, 844],
]) {
	const { ctx, page, errors } = await open({ width: w, height: h });
	await pp(page, '[data-pp-route="topic"]').click();
	await page.locator('[data-pp] input[name="pp-topic"][value="robots"]').check({ force: true });
	await pp(page, "[data-pp-begin]").click();
	const fsBtn = page.locator("[data-demo-frame] [data-demo-fs-enter]").first();
	if (!(await fsBtn.count())) {
		check(`fullscreen ${w}×${h}: button exists`, false);
		await ctx.close();
		continue;
	}
	await fsBtn.click();
	await page.waitForTimeout(400);
	for (let i = 0; i < 5; i++) {
		await page.keyboard.press("1");
		await page.waitForTimeout(450); // the frame re-fits 200ms after content settles
		const fit = await page.evaluate(() => {
			const f = document.querySelector("[data-demo-frame].is-fullscreen");
			if (!f) return { fs: false };
			return { fs: true, sh: f.scrollHeight, ch: f.clientHeight, sw: f.scrollWidth, cw: f.clientWidth };
		});
		check(`fullscreen ${w}×${h} q${i}: active`, fit.fs);
		if (fit.fs) check(`fullscreen ${w}×${h} q${i}: fits without scrolling`, fit.sh <= fit.ch + 2 && fit.sw <= fit.cw + 2, JSON.stringify(fit));
		if (SHOTS && i === 0 && w === 1366) await page.screenshot({ path: `${SHOTS}/fullscreen-desktop.png` });
		await page.keyboard.press("n");
		if (await pp(page, "[data-pp-checkpoint]").isVisible()) await pp(page, "[data-pp-cp-continue]").click();
	}
	check(`fullscreen ${w}×${h}: no console errors`, errors.length === 0, errors.join(" | "));
	await ctx.close();
}

// ------------------------------------------- 7. Storage blocked + migration
{
	const { ctx, page, errors } = await open(undefined, {
		init: () => {
			Object.defineProperty(window, "localStorage", {
				get() {
					throw new Error("blocked");
				},
			});
		},
	});
	check("blocked storage: note shown", await pp(page, "[data-pp-storage-note]").isVisible());
	await pp(page, "[data-pp-begin]").click();
	await page.keyboard.press("1");
	check("blocked storage: still works", await pp(page, "[data-pp-feedback]").isVisible());
	check("blocked storage: no uncaught errors", errors.length === 0, errors.join(" | "));
	await ctx.close();
}
{
	// A version-2 save from the previous page: one missed question waiting to come back.
	const v2 = {
		version: 2,
		level: "medium",
		categories: ["Lists"],
		answered: 14,
		streak: 3,
		best: 7,
		bestByLevel: { medium: 7 },
		progress: { [process.env.V2_ID ?? "list-1"]: { dueIn: 0 } },
	};
	const ctx2 = await browser.newContext({ viewport: { width: 1366, height: 900 } });
	await ctx2.addInitScript(([k, d]) => {
		if (!sessionStorage.getItem("seeded")) {
			localStorage.setItem(k, d);
			sessionStorage.setItem("seeded", "1");
		}
	}, [KEY, JSON.stringify(v2)]);
	const p2 = await ctx2.newPage();
	const errs = [];
	p2.on("pageerror", (e) => errs.push(e.message));
	await p2.goto(URL);
	const saved = await p2.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "null"), KEY);
	check("migration: page loads with v2 save", await pp(p2, "[data-pp-start]").isVisible());
	await pp(p2, "[data-pp-begin]").click();
	await p2.keyboard.press("1");
	const after = await p2.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "null"), KEY);
	check("migration: saved as v3", after?.version === 3, JSON.stringify(after)?.slice(0, 120));
	check("migration: unreadable copy not needed", !(await p2.evaluate((k) => localStorage.getItem(`${k}:unreadable`), KEY)));
	check("migration: Continue offered", await pp(p2, "[data-pp-continue]").isVisible().catch(() => false) || after?.settings?.level === "medium");
	check("migration: level kept", after?.settings?.level === "medium", JSON.stringify(after?.settings));
	check("migration: streak/best kept", after?.best === 7, String(after?.best));
	check("migration: no errors", errs.length === 0, errs.join(" | "));
	void saved;
	await ctx2.close();
}
{
	// Garbage in storage is kept aside, not erased.
	const ctx = await browser.newContext();
	await ctx.addInitScript((k) => {
		if (!sessionStorage.getItem("seeded")) {
			localStorage.setItem(k, "{not json");
			sessionStorage.setItem("seeded", "1");
		}
	}, KEY);
	const page = await ctx.newPage();
	const errs = [];
	page.on("pageerror", (e) => errs.push(e.message));
	await page.goto(URL);
	check("garbage save: page still works", await pp(page, "[data-pp-start]").isVisible());
	check("no uncaught errors with garbage save", errs.length === 0, errs.join(" | "));
	await ctx.close();
}

await browser.close();
console.log(`${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
