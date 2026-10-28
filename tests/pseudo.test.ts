// Run with: npm run test:pseudo
// Checks the pseudocode engine: the interpreter against hand-worked examples
// from the reference sheet, every template across many seeds, and every
// original question.
import { run } from "../src/lib/pseudo/interpreter";
import { TEMPLATES, FIXED, generate, questionById } from "../src/lib/pseudo/bank";
import type { Question } from "../src/lib/pseudo/core";

let failures = 0;
const fail = (msg: string) => {
	failures++;
	if (failures < 60) console.log("FAIL", msg);
};
const out = (code: string, opts = {}) => run(code, opts).output.join(" ");

// ---------------------------------------------------------------- 1. Interpreter vs hand-worked examples
const EXAMPLES: [string, string, string][] = [
	["17 / 5 is real division", "DISPLAY(17 / 5)", "3.4"],
	["17 MOD 5", "DISPLAY(17 MOD 5)", "2"],
	["MOD binds like *", "DISPLAY(2 + 17 MOD 5)", "4"],
	["precedence", "DISPLAY(2 + 3 * 4)", "14"],
	["DISPLAY order", "DISPLAY(1)\nDISPLAY(2)", "1 2"],
	["lists start at 1", "a ← [10, 20, 30]\nDISPLAY(a[1])", "10"],
	["INSERT shifts right", "a ← [1, 2, 3]\nINSERT(a, 2, 9)\nDISPLAY(a)", "[1, 9, 2, 3]"],
	["REMOVE shifts left", "a ← [1, 2, 3]\nREMOVE(a, 1)\nDISPLAY(a)", "[2, 3]"],
	["APPEND", "a ← [1]\nAPPEND(a, 5)\nDISPLAY(LENGTH(a))", "2"],
	["list assignment copies", "b ← [20, 40, 60]\na ← b\nAPPEND(a, 80)\nDISPLAY(b)", "[20, 40, 60]"],
	["REPEAT n TIMES", "x ← 0\nREPEAT 3 TIMES\n{\n  x ← x + 1\n}\nDISPLAY(x)", "3"],
	["REPEAT UNTIL checks first", "x ← 5\nREPEAT UNTIL (x > 2)\n{\n  x ← x + 1\n}\nDISPLAY(x)", "5"],
	["FOR EACH in order", "FOR EACH n IN [3, 1, 2]\n{\n  DISPLAY(n)\n}", "3 1 2"],
	["RETURN exits immediately", "PROCEDURE f()\n{\n  RETURN(1)\n  DISPLAY(99)\n}\nDISPLAY(f())", "1"],
	["IF / ELSE", "IF (2 > 3)\n{\n  DISPLAY(\"a\")\n}\nELSE\n{\n  DISPLAY(\"b\")\n}", "b"],
	["NOT / AND / OR", "DISPLAY(NOT (1 = 2) AND (3 < 2 OR 4 ≥ 4))", "true"],
	["≠", "DISPLAY(3 ≠ 3)", "false"],
];
for (const [name, code, expected] of EXAMPLES) {
	const got = out(code);
	if (got !== expected) fail(`example "${name}": expected ${expected}, got ${got}`);
}
const idx = run("a ← [1, 2]\nDISPLAY(a[0])");
if (idx.ended !== "error") fail("index 0 should be an error");
const idx3 = run("a ← [1, 2]\nDISPLAY(a[3])");
if (idx3.ended !== "error") fail("index past the end should be an error");
const loop = run("x ← 1\nREPEAT UNTIL (x = 4)\n{\n  x ← x + 2\n}");
if (loop.ended !== "limit") fail("non-terminating loop should hit the step limit");
// Robot: blocked move stays put and ends; CAN_MOVE is relative.
const grid = { rows: [".#.", "...", "..."], robot: { row: 1, col: 1, facing: "up" as const } };
const blocked = run("MOVE_FORWARD()\nROTATE_LEFT()", { grid });
if (blocked.ended !== "blocked" || blocked.robot!.row !== 1 || blocked.robot!.facing !== "up") fail("blocked move should stay put and end the program");
const rel = run('IF (CAN_MOVE("right"))\n{\n  DISPLAY("open")\n}', { grid: { rows: ["...", "...", "#.."], robot: { row: 1, col: 0, facing: "right" } } });
if (rel.output.join(" ") !== "") fail("CAN_MOVE(right) facing right from (1,0) looks down at a blocked square");
const offGrid = run("MOVE_FORWARD()", { grid: { rows: ["."], robot: { row: 0, col: 0, facing: "left" } } });
if (offGrid.ended !== "blocked") fail("moving off the grid should stop the robot");
// Trace shows changing values, not just the code.
const tr = run("x ← 0\nREPEAT 2 TIMES\n{\n  x ← x + 3\n}\nDISPLAY(x)", { trace: true });
const texts = tr.steps.map((s) => s.text);
const wantTrace = ["x becomes 0", "Repeat: pass 1 of 2", "x becomes 3", "Repeat: pass 2 of 2", "x becomes 6", "DISPLAY shows 6"];
if (JSON.stringify(texts) !== JSON.stringify(wantTrace)) fail(`trace text: ${JSON.stringify(texts)}`);
if (tr.steps[4].vars.x !== "6" || tr.steps[5].output.join(" ") !== "6") fail("trace variables/output");
console.log(`interpreter examples: ${EXAMPLES.length + 7} checked`);

// ---------------------------------------------------------------- 2. Templates across seeds
const SEEDS = 300;
const correct = (q: Question) => q.options.find((o) => o.correct)!.text;
const letterAt = (q: Question, r: { robot?: { row: number; col: number } }) => q.grid!.rows[r.robot!.row][r.robot!.col];
const fill = (code: string, opt: string) => code.replace("<MISSING CODE>", opt);
const ok = (q: Question, cond: boolean, msg: string) => {
	if (!cond) fail(`${q.id}: ${msg}`);
};

// Per-template checks that need knowledge of the spec (independent of how the template computed its answer).
const SPEC: Record<string, (q: Question) => void> = {
	"ar-last-digit": (q) => {
		const n = Number(q.code!.match(/\d+/)![0]);
		for (const o of q.options) ok(q, (out(`${q.code}\nDISPLAY(${o.text})`) === String(n % 10)) === o.correct, `option ${o.text}`);
	},
	"ar-average": (q) => {
		const [a, b, c] = q.code!.match(/\d+/g)!.map(Number);
		for (const o of q.options) ok(q, (run(`${q.code}\n${o.text}\nDISPLAY(avg)`).output[0] === String(Math.round(((a + b + c) / 3) * 1e9) / 1e9)) === o.correct, `option ${o.text}`);
	},
	"bo-outside-range": (q) => {
		const [lo, hi] = q.prompt.match(/\d+/g)!.map(Number);
		for (const o of q.options) {
			let matches = true;
			for (let n = lo - 3; n <= hi + 3; n++) if (out(`n ← ${n}\nDISPLAY(${o.text})`) !== String(n < lo || n > hi)) matches = false;
			ok(q, matches === o.correct, `option ${o.text}`);
		}
	},
	"bo-boundary-input": (q) => {
		for (const o of q.options) ok(q, (out(`age ← ${o.text}\n${q.code}`) === "not allowed") === o.correct, `option ${o.text}`);
	},
	"bo-bug-input": (q) => {
		const [P, A] = q.prompt.match(/\d+/g)!.map(Number);
		for (const o of q.options) {
			const [s, a] = o.text.match(/\d+/g)!.map(Number);
			const rule = s >= P && a >= A ? "pass" : "fail";
			ok(q, (out(`score ← ${s}\nattendance ← ${a}\n${q.code}`) !== rule) === o.correct, `option ${o.text}`);
		}
	},
	"se-order-bug": (q) => {
		const [top, pass] = [Number(q.prompt.match(/for (\d+) or more/)![1]), Number(q.prompt.match(/"pass" for (\d+)/)![1])];
		for (const o of q.options) {
			const s = Number(o.text);
			const rule = s >= top ? "excellent" : s >= pass ? "pass" : "fail";
			ok(q, (out(`score ← ${s}\n${q.code}`) !== rule) === o.correct, `option ${o.text}`);
		}
	},
	"se-missing-condition": (q) => {
		const [young, old] = q.prompt.match(/\d+/g)!.map(Number);
		for (const o of q.options) {
			let matches = true;
			for (let age = 0; age <= 90; age++) if (out(`age ← ${age}\n${fill(q.code!, o.text)}`) !== (age < young || age >= old ? "free" : "ticket")) matches = false;
			ok(q, matches === o.correct, `option ${o.text}`);
		}
	},
	"li-last-item": (q) => {
		const list = q.code!.slice(q.code!.indexOf("["));
		const last = list.replace(/[\[\]]/g, "").split(",").pop()!.trim();
		for (const o of q.options) ok(q, (out(`${q.code}\n${o.text}`) === last) === o.correct, `option ${o.text}`);
	},
	"li-remove-bug": (q) => {
		for (const o of q.options) {
			const m = o.text.match(/\w+\(\[(.*)\], (\d+)\)/)!;
			const list = m[1] ? m[1].split(", ").map(Number) : [];
			const t = Number(m[2]);
			const rule = `[${list.filter((x) => x !== t).join(", ")}]`;
			ok(q, (out(`${q.code}\nDISPLAY(${o.text})`) !== rule) === o.correct, `option ${o.text}`);
		}
	},
	"pr-bug-input": (q) => {
		const limit = Number(q.options[0].text.match(/, (\d+)\)$/)![1]);
		for (const o of q.options) {
			const list = (o.text.match(/\[(.*)\]/)![1] || "").split(", ").filter(Boolean).map(Number);
			ok(q, (out(`${q.code}\nDISPLAY(${o.text})`) !== String(list.filter((x) => (/less than/.test(q.prompt) ? x < limit : x > limit)).length)) === o.correct, `option ${o.text}`);
		}
	},
	"ro-choose-code": (q) => {
		for (const o of q.options) {
			const r = run(o.text, { grid: q.grid });
			ok(q, (r.ended === "done" && letterAt(q, r) === "A") === o.correct, `option ${o.text.replace(/\n/g, "; ")}`);
		}
	},
};

const byTemplate: Record<string, number> = {};
for (const t of TEMPLATES) {
	const seen = new Set<string>();
	for (let seed = 1; seed <= SEEDS; seed++) {
		let q: Question;
		try {
			q = generate(t.id, seed * 977);
		} catch (e) {
			fail(`${t.id} seed ${seed}: ${(e as Error).message}`);
			continue;
		}
		const again = questionById(q.id);
		if (JSON.stringify(again) !== JSON.stringify(q)) fail(`${q.id}: not reproducible from its ID`);
		seen.add(JSON.stringify([q.prompt, q.code, q.grid]));
		if (q.options.some((o) => !o.correct && o.text === correct(q))) fail(`${q.id}: duplicate of correct option`);
		const ans = correct(q);
		switch (q.type) {
			case "output": {
				const r = run(q.code!, { grid: q.grid });
				ok(q, r.ended === "done", `ended ${r.ended} ${r.error ?? ""}`);
				ok(q, r.output.join(" ") === ans, `answer ${ans} but code displays ${r.output.join(" ")}`);
				break;
			}
			case "final-state": {
				const r = run(q.code!, { grid: q.grid });
				ok(q, r.ended !== "error" && r.ended !== "limit", `ended ${r.ended}`);
				if (!q.grid) {
					ok(q, r.output.join(" ") === ans, `list state ${ans} vs ${r.output.join(" ")}`);
				} else {
					const got = /^[A-D]$/.test(ans) ? letterAt(q, r) : r.robot!.facing[0].toUpperCase() + r.robot!.facing.slice(1);
					ok(q, got === ans, `answer ${ans} but robot ends on ${got}`);
				}
				if (q.id.startsWith("ro-blocked")) ok(q, r.ended === "blocked", "should end blocked");
				break;
			}
			case "error": {
				const r = run(q.code!);
				ok(q, r.ended === "error" || r.ended === "limit", `expected an error/never-ending run, got ${r.ended}`);
				ok(q, /error|never stops/i.test(ans), "correct option should name the error");
				ok(q, /What happens/.test(q.prompt), "error questions must ask about it explicitly");
				break;
			}
			case "missing": {
				if (SPEC[t.id]) {
					SPEC[t.id](q);
					break;
				}
				const results = q.options.map((o) => run(fill(q.code!, o.text)));
				const good = results[q.options.findIndex((o) => o.correct)];
				ok(q, good.ended === "done", "correct fill should run");
				const want = good.output.join(" ");
				const quoted = q.prompt.match(/"([^"]+)" is displayed|display ([0-9 ]+)\.|so (\S+) is displayed/);
				if (quoted) ok(q, want === (quoted[1] ?? quoted[2] ?? quoted[3]).trim(), `correct fill displays ${want}, prompt promises ${quoted[0]}`);
				results.forEach((res, i) => {
					if (!q.options[i].correct) ok(q, res.ended !== "done" || res.output.join(" ") !== want, `wrong option "${q.options[i].text}" also works`);
				});
				break;
			}
			case "compare": {
				const [s1, s2] = q.code!.split(/\n\nSegment II\n/);
				const o1 = run(s1.replace(/^Segment I\n/, "")).output.join(" ");
				const o2 = run(s2).output.join(" ");
				ok(q, ans === `I: ${o1}  II: ${o2}`, `compare answer ${ans} vs I: ${o1}  II: ${o2}`);
				break;
			}
			default:
				if (SPEC[t.id]) SPEC[t.id](q);
				else fail(`${t.id}: no checker for type ${q.type}`);
		}
		if (q.trace) {
			const tr = run(q.trace.code, { grid: q.trace.grid, trace: true, maxSteps: 400 });
			ok(q, tr.ended !== "error" || q.type === "error", `trace ended ${tr.ended}: ${tr.error}`);
			ok(q, tr.steps.length > 0, "trace has steps");
		}
	}
	byTemplate[t.id] = seen.size;
}
const thin = Object.entries(byTemplate).filter(([, n]) => n < 20);
console.log(`templates: ${TEMPLATES.length} × ${SEEDS} seeds checked`);
if (thin.length) console.log("templates with few distinct variants:", thin.map(([k, n]) => `${k}=${n}`).join(", "));

// ---------------------------------------------------------------- 3. Original (fixed) questions
let fixedChecked = 0;
for (const q of FIXED) {
	if (new Set(q.options.map((o) => o.text)).size !== 4 || q.options.filter((o) => o.correct).length !== 1) fail(`${q.id}: options`);
	if (!q.trace) continue;
	const r = run(q.trace.code, { grid: q.trace.grid, inputs: q.trace.inputs });
	const ans = correct(q);
	let got: string;
	if (r.ended === "error") got = q.options.find((o) => /error/i.test(o.text))?.text ?? "ERROR";
	else if (r.ended === "limit") got = q.options.find((o) => /never stops|forever/i.test(o.text))?.text ?? "LIMIT";
	else if (q.grid && /^[A-D]$/.test(ans)) got = q.grid.rows[r.robot!.row][r.robot!.col];
	else if (q.grid && /^(Up|Down|Left|Right)$/.test(ans)) got = r.robot!.facing[0].toUpperCase() + r.robot!.facing.slice(1);
	else got = r.output.join(" ");
	if (got !== ans) fail(`${q.id}: expected ${ans}, got ${got}`);
	fixedChecked++;
}
console.log(`fixed questions: ${FIXED.length} (${fixedChecked} re-run, the rest are conceptual or multi-part)`);
console.log(failures ? `${failures} FAILURES` : "ALL PASSED");
process.exit(failures ? 1 : 0);
