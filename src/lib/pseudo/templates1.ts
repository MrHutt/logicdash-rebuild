// Question templates: Variables & output, Arithmetic & MOD, Boolean logic, Selection.
// Each template computes its own answer in plain JavaScript; the test suite
// then re-runs the generated code through the interpreter to confirm it.
import { options, say, type Template } from "./core";

const L = (...lines: string[]) => lines.join("\n");
const block = (lines: string[], indent = "  ") => lines.map((l) => indent + l);

// --------------------------------------------------------------------------- Variables & output

export const VARIABLE_TEMPLATES: Template[] = [
	{
		id: "var-swap-fail",
		topic: "variables",
		skill: "Assignment copies a value",
		level: "easy",
		type: "output",
		structure: "Two assignments that look like a swap but aren't",
		build(r) {
			const x = r.int(2, 9);
			const y = r.int(10, 19);
			const code = L(`a ← ${x}`, `b ← ${y}`, "a ← b", "b ← a", "DISPLAY(a)", "DISPLAY(b)");
			return {
				prompt: "What is displayed?",
				code,
				options: options(`${y} ${y}`, [
					{ text: `${y} ${x}`, why: `That would be a swap — but after a ← b, a's old value (${x}) is gone, so b ← a copies ${y} straight back.` },
					{ text: `${x} ${y}`, why: "The values do change: a ← b replaces whatever a held." },
					{ text: `${x} ${x}`, why: "a ← b copies b's value into a, not the other way round." },
				]),
				explanation: `a ← b makes a equal ${y}. Then b ← a copies that same ${y} back into b. Both display ${y}. A real swap needs a third variable to remember the old value.`,
				trace: { code },
			};
		},
	},
	{
		id: "var-copy",
		topic: "variables",
		skill: "Variables hold copies, not links",
		level: "easy",
		type: "output",
		structure: "Copy a variable, then change the original",
		build(r) {
			const n = r.int(10, 20);
			const k = r.int(2, 9);
			const code = L(`a ← ${n}`, "b ← a", `a ← a + ${k}`, "DISPLAY(b)");
			return {
				prompt: "What is displayed?",
				code,
				options: options(String(n), [
					{ text: String(n + k), why: "b doesn't follow a. b ← a copied a's value at that moment, before a changed." },
					{ text: String(k), why: `${k} was added to a, not stored in b.` },
					{ text: "a", why: "DISPLAY(b) shows b's value, not the name of another variable." },
				]),
				explanation: `b ← a stores a copy of a's value (${n}). Changing a afterwards doesn't change b, so ${n} is displayed.`,
				trace: { code },
			};
		},
	},
	{
		id: "var-three-trace",
		topic: "variables",
		topics: ["arithmetic"],
		skill: "Tracing several variables",
		level: "medium",
		type: "output",
		structure: "Four assignments that reuse each other's newest values",
		build(r) {
			const p = r.int(2, 6);
			const q = r.int(1, 5);
			const x = 2 * (p + q);
			const y = p + q;
			const code = L(`x ← ${p}`, `y ← x + ${q}`, "x ← y * 2", "y ← x - y", "DISPLAY(x)", "DISPLAY(y)");
			return {
				prompt: "What is displayed?",
				code,
				options: options(
					`${x} ${y}`,
					[
						{ text: `${x} ${x - p}`, why: "y ← x - y uses x's newest value (after x ← y * 2), not its first value." },
						{ text: `${2 * p} ${2 * p - y}`, why: "x ← y * 2 doubles y, not x." },
						{ text: `${p} ${y}`, why: "Each assignment replaces the old value — x is updated on line 3." },
					],
					[`${x} ${y + 1}`, `${x + 1} ${y}`],
				),
				explanation: `x starts at ${p}, so y = ${p} + ${q} = ${y}. Then x = ${y} × 2 = ${x}, and y = ${x} − ${y} = ${y}. Always use each variable's latest value.`,
				trace: { code },
			};
		},
	},
	{
		id: "var-swap-missing",
		topic: "variables",
		skill: "Swapping with a temporary variable",
		level: "medium",
		type: "missing",
		structure: "Missing line in a three-variable swap",
		build(r) {
			const a = r.int(1, 9);
			const b = r.int(10, 19);
			const code = L(`a ← ${a}`, `b ← ${b}`, "temp ← a", "a ← b", "<MISSING CODE>", "DISPLAY(a)", "DISPLAY(b)");
			return {
				prompt: `The code should swap a and b, so "${b} ${a}" is displayed. Which replaces <MISSING CODE>?`,
				code,
				options: options(
					"b ← temp",
					[
						{ text: "b ← a", why: `By then a already holds ${b}, so b would stay ${b}.` },
						{ text: "temp ← b", why: "That changes temp, but b never receives a's old value." },
						{ text: "a ← temp", why: `That undoes the change to a, giving back ${a} ${b}.` },
					],
					[],
					true,
				),
				explanation: `temp saved a's old value (${a}) before a was overwritten. b ← temp gives b that saved value, completing the swap.`,
				trace: { code: code.replace("<MISSING CODE>", "b ← temp"), note: "Tracing the code with the correct line filled in." },
			};
		},
	},
	{
		id: "var-running-total",
		topic: "variables",
		topics: ["arithmetic"],
		skill: "Updating a variable step by step",
		level: "medium",
		type: "output",
		structure: "One variable updated by three different operations",
		build(r) {
			const a = r.int(3, 7);
			const b = r.int(2, 4);
			const c = r.int(1, 5);
			const code = L("total ← 0", `total ← total + ${a}`, `total ← total * ${b}`, `total ← total - ${c}`, "DISPLAY(total)");
			return {
				prompt: "What is displayed?",
				code,
				options: options(
					String(a * b - c),
					[
						{ text: String(a * b), why: "The last line still runs: it subtracts from the total." },
						{ text: String(a * (b - c)), why: "Statements run in order, one at a time — the multiply happens before the subtract." },
						{ text: String(a + b - c), why: "total ← total * b multiplies the running total; it doesn't add." },
					],
					[String(a * b - c + 1), String(a * b + c)],
				),
				explanation: `total goes 0 → ${a} → ${a * b} → ${a * b - c}. Each line uses total's latest value.`,
				trace: { code },
			};
		},
	},
	{
		id: "var-order-compare",
		topic: "variables",
		skill: "Order of statements matters",
		level: "challenging",
		type: "compare",
		structure: "Same statements in two different orders",
		build(r) {
			const a = r.int(6, 15);
			const b = r.int(1, 4);
			const seg1 = L(`x ← ${a}`, `y ← ${b}`, "x ← x + y", "y ← x - y", "DISPLAY(x)", "DISPLAY(y)");
			const seg2 = L(`x ← ${a}`, `y ← ${b}`, "y ← x - y", "x ← x + y", "DISPLAY(x)", "DISPLAY(y)");
			const one = `${a + b} ${a}`;
			const two = `${2 * a - b} ${a - b}`;
			return {
				prompt: "The two segments have the same statements in a different order. What does each display?",
				code: L("Segment I", seg1, "", "Segment II", seg2),
				options: options(`I: ${one}  II: ${two}`, [
					{ text: `I: ${one}  II: ${one}`, why: "Order matters: in II, y ← x - y runs before x changes, so it uses x's first value." },
					{ text: `I: ${two}  II: ${two}`, why: "In I, x is updated first, so y ← x - y uses the new x." },
					{ text: `I: ${two}  II: ${one}`, why: "The results are the right two — but the wrong way round." },
				]),
				explanation: `I: x = ${a} + ${b} = ${a + b}, then y = ${a + b} − ${b} = ${a}. II: y = ${a} − ${b} = ${a - b} first, then x = ${a} + ${a - b} = ${2 * a - b}.`,
				trace: { code: seg1, note: "Tracing Segment I. Try Segment II on paper the same way." },
			};
		},
	},
];

// --------------------------------------------------------------------------- Arithmetic & MOD

export const ARITHMETIC_TEMPLATES: Template[] = [
	{
		id: "ar-precedence",
		topic: "arithmetic",
		skill: "Order of operations",
		level: "easy",
		type: "output",
		structure: "Expression mixing + and *",
		build(r) {
			const [a, b, c] = [r.int(2, 9), r.int(2, 9), r.int(2, 9)];
			const code = L(`x ← ${a} + ${b} * ${c}`, "DISPLAY(x)");
			return {
				prompt: "What is displayed?",
				code,
				options: options(String(a + b * c), [
					{ text: String((a + b) * c), why: "Multiplication happens before addition, as in math — this worked left to right." },
					{ text: String(a + b + c), why: "* means multiply, not add." },
					{ text: String(a * b * c), why: "Only b and c are multiplied; a is added." },
				]),
				explanation: `* is done before +: ${b} × ${c} = ${b * c}, then ${a} + ${b * c} = ${a + b * c}.`,
				trace: { code },
			};
		},
	},
	{
		id: "ar-mod",
		topic: "arithmetic",
		skill: "MOD gives the remainder",
		level: "easy",
		type: "output",
		structure: "A single MOD",
		build(r) {
			const b = r.int(3, 9);
			let a = r.int(13, 49);
			if (a % b === 0) a += 1;
			const code = L(`n ← ${a}`, `DISPLAY(n MOD ${b})`);
			return {
				prompt: "What is displayed?",
				code,
				options: options(String(a % b), [
					{ text: String(Math.floor(a / b)), why: `That's how many whole times ${b} fits into ${a}. MOD gives what's left over.` },
					{ text: say(a / b), why: `That's ${a} / ${b}. MOD gives only the remainder.` },
					{ text: String(b - (a % b)), why: `That's how far ${a} is from the next multiple of ${b}. MOD is how far it is past the last one.` },
				]),
				explanation: `${b} fits into ${a} ${Math.floor(a / b)} times (${Math.floor(a / b) * b}), leaving ${a % b}. So ${a} MOD ${b} = ${a % b}.`,
				trace: { code },
			};
		},
	},
	{
		id: "ar-division",
		topic: "arithmetic",
		skill: "Division can give a decimal",
		level: "easy",
		type: "output",
		structure: "A division that doesn't come out even",
		build(r) {
			const b = r.pick([2, 4, 5]);
			let a = r.int(11, 39);
			if (a % b === 0) a += 1;
			const code = L(`x ← ${a} / ${b}`, "DISPLAY(x)");
			return {
				prompt: "What is displayed?",
				code,
				options: options(say(a / b), [
					{ text: String(Math.floor(a / b)), why: "Here / is ordinary division — 17 / 5 is 3.4, not 3. Nothing is rounded down." },
					{ text: String(a % b), why: `That's ${a} MOD ${b}, the remainder.` },
					{ text: `${Math.floor(a / b)} R ${a % b}`, why: "The result is a single number, not a quotient and remainder." },
				]),
				explanation: `/ is ordinary division: ${a} / ${b} = ${say(a / b)}. For a remainder you'd use MOD.`,
				trace: { code },
			};
		},
	},
	{
		id: "ar-mod-precedence",
		topic: "arithmetic",
		skill: "MOD has the same precedence as * and /",
		level: "medium",
		type: "output",
		structure: "+ combined with MOD",
		build(r) {
			const a = r.int(2, 9);
			const c = r.int(3, 7);
			let b = r.int(10, 29);
			if (b % c === 0 || (a + b) % c === a + (b % c)) b += 1;
			if (b % c === 0) b += 1;
			const code = L(`x ← ${a} + ${b} MOD ${c}`, "DISPLAY(x)");
			return {
				prompt: "What is displayed?",
				code,
				options: options(
					String(a + (b % c)),
					[
						{ text: String((a + b) % c), why: "MOD is done before +, just like * and /." },
						{ text: String(b % c), why: `${a} is still added on.` },
						{ text: String(a + Math.floor(b / c)), why: "MOD gives the remainder, not how many times it divides." },
					],
					[String(a + (b % c) + 1)],
				),
				explanation: `MOD goes first: ${b} MOD ${c} = ${b % c}. Then ${a} + ${b % c} = ${a + (b % c)}.`,
				trace: { code },
			};
		},
	},
	{
		id: "ar-last-digit",
		topic: "arithmetic",
		skill: "Using MOD to pick out digits",
		level: "medium",
		type: "choose-code",
		structure: "Choose the expression that meets a spec (digits)",
		build(r) {
			const n = r.int(1, 9) * 1000 + r.int(1, 9) * 100 + r.int(1, 9) * 10 + r.int(1, 9);
			return {
				prompt: `n holds ${n}. Which expression gives its last digit, ${n % 10}, and works for any whole number n?`,
				code: `n ← ${n}`,
				options: options(
					"n MOD 10",
					[
						{ text: "n / 10", why: `That divides by ten: ${n} / 10 = ${say(n / 10)}.` },
						{ text: "n MOD 100", why: `That gives the last two digits (${n % 100}).` },
						{ text: "10 MOD n", why: "Order matters — 10 MOD n is just 10 whenever n is bigger than 10." },
					],
					[],
					true,
				),
				explanation: `Dividing by 10 leaves the last digit as the remainder, so n MOD 10 = ${n % 10}.`,
				trace: { code: L(`n ← ${n}`, "DISPLAY(n MOD 10)"), note: "Tracing the correct expression." },
			};
		},
	},
	{
		id: "ar-average",
		topic: "arithmetic",
		skill: "Writing an expression for a spec",
		level: "challenging",
		type: "choose-code",
		structure: "Choose the statement that computes a mean",
		build(r) {
			const [a, b, c] = r.distinct(3, 2, 20);
			const set = L(`a ← ${a}`, `b ← ${b}`, `c ← ${c}`);
			return {
				prompt: "Which statement stores the average (mean) of a, b and c in avg?",
				code: set,
				options: options(
					"avg ← (a + b + c) / 3",
					[
						{ text: "avg ← a + b + c / 3", why: "Only c is divided — / is done before +." },
						{ text: "avg ← (a + b + c) MOD 3", why: "MOD gives a remainder, not the mean." },
						{ text: "avg ← (a + b + c) / 2", why: "There are three values, so divide by 3." },
					],
					[],
					true,
				),
				explanation: `Add all three, then divide by how many there are: (${a} + ${b} + ${c}) / 3 = ${say((a + b + c) / 3)}. The brackets make the addition happen first.`,
				trace: { code: L(set, "avg ← (a + b + c) / 3", "DISPLAY(avg)"), note: "Tracing the correct statement." },
			};
		},
	},
	{
		id: "ar-multi-step",
		topic: "arithmetic",
		topics: ["variables"],
		skill: "Multi-step arithmetic with MOD",
		level: "challenging",
		type: "output",
		structure: "Chained assignments using *, + and MOD",
		build(r) {
			const a = r.int(3, 6);
			let b = r.int(5, 11);
			if (b % 4 === 0) b += 1;
			const y = a * 3 + (b % 4);
			const x2 = y % a;
			const wrongY = (a * 3 + b) % 4;
			const code = L(`x ← ${a}`, `y ← x * 3 + ${b} MOD 4`, "x ← y MOD x", "DISPLAY(x)", "DISPLAY(y)");
			return {
				prompt: "What is displayed?",
				code,
				options: options(
					`${x2} ${y}`,
					[
						{ text: `${wrongY % a} ${wrongY}`, why: `${b} MOD 4 is worked out before the addition, not after.` },
						{ text: `${y} ${y}`, why: "x ← y MOD x stores the remainder, not y itself." },
						{ text: `${x2} ${a * 3 + b}`, why: `MOD still applies: it's ${b} MOD 4, not ${b}.` },
					],
					[`${x2 + 1} ${y}`],
				),
				explanation: `y = ${a} × 3 + (${b} MOD 4) = ${a * 3} + ${b % 4} = ${y}. Then x = ${y} MOD ${a} = ${x2}.`,
				trace: { code },
			};
		},
	},
];

// --------------------------------------------------------------------------- Boolean logic

const tf = (b: boolean) => String(b);

export const BOOLEAN_TEMPLATES: Template[] = [
	{
		id: "bo-and-or",
		topic: "boolean",
		skill: "Evaluating AND and OR",
		level: "easy",
		type: "output",
		structure: "The same two comparisons joined by AND, then OR",
		build(r) {
			const firstTrue = r.bool();
			const a = r.int(5, 15);
			const b = firstTrue ? a - r.int(1, 4) : a + r.int(1, 4);
			const c = r.int(5, 15);
			const d = firstTrue ? c - r.int(1, 4) : c + r.int(1, 4);
			const p1 = a > b;
			const p2 = c < d;
			const code = L(`DISPLAY(${a} > ${b} AND ${c} < ${d})`, `DISPLAY(${a} > ${b} OR ${c} < ${d})`);
			return {
				prompt: "What is displayed?",
				code,
				options: options(`${tf(p1 && p2)} ${tf(p1 || p2)}`, [
					{ text: "true true", why: "AND is only true when both parts are true." },
					{ text: "false false", why: "OR is true when at least one part is true." },
					{ text: "true false", why: "AND and OR were mixed up: AND needs both, OR needs at least one." },
				]),
				explanation: `${a} > ${b} is ${p1} and ${c} < ${d} is ${p2}. AND needs both → ${p1 && p2}. OR needs at least one → ${p1 || p2}.`,
				trace: { code },
			};
		},
	},
	{
		id: "bo-not-scope",
		topic: "boolean",
		skill: "What NOT applies to",
		level: "medium",
		type: "output",
		structure: "NOT on one part vs NOT on the whole expression",
		build(r) {
			const x = r.int(1, 12);
			const k = r.int(3, 9);
			const y = r.int(1, 4);
			const m = r.int(1, 4);
			const e1 = !(x > k) || y === m;
			const e2 = !(x > k || y === m);
			const code = L(`x ← ${x}`, `y ← ${y}`, `DISPLAY(NOT (x > ${k}) OR y = ${m})`, `DISPLAY(NOT (x > ${k} OR y = ${m}))`);
			const all = ["true true", "true false", "false true", "false false"];
			const ans = `${tf(e1)} ${tf(e2)}`;
			return {
				prompt: "What is displayed?",
				code,
				options: options(
					ans,
					[
						{ text: `${tf(e2)} ${tf(e1)}`, why: "The two lines were swapped: in line 1 NOT applies only to (x > k); in line 2 it applies to the whole bracket." },
						{ text: `${tf(!e1)} ${tf(e2)}`, why: "In line 1, NOT flips only the bracket right after it, then OR is applied." },
						{ text: `${tf(e1)} ${tf(!e2)}`, why: "In line 2, NOT flips the result of the whole OR inside the brackets." },
					],
					all,
				),
				explanation: `x > ${k} is ${x > k}, y = ${m} is ${y === m}. Line 1: NOT (${x > k}) OR ${y === m} = ${e1}. Line 2: NOT (${x > k} OR ${y === m}) = ${e2}.`,
				trace: { code },
			};
		},
	},
	{
		id: "bo-boundary-input",
		topic: "boolean",
		topics: ["selection"],
		skill: "Boundary values in conditions",
		level: "medium",
		type: "input",
		structure: "Pick the input that falls outside an inclusive range",
		build(r) {
			const lo = r.int(10, 15);
			const hi = lo + r.int(4, 8);
			const below = r.bool();
			const code = L(`IF (age ≥ ${lo} AND age ≤ ${hi})`, "{", '  DISPLAY("allowed")', "}", "ELSE", "{", '  DISPLAY("not allowed")', "}");
			const answer = below ? lo - 1 : hi + 1;
			const mid = Math.floor((lo + hi) / 2);
			return {
				prompt: 'For which value of age is "not allowed" displayed?',
				code,
				options: options(String(answer), [
					{ text: String(lo), why: `≥ includes the boundary, so ${lo} is allowed.` },
					{ text: String(hi), why: `≤ includes the boundary, so ${hi} is allowed.` },
					{ text: String(mid), why: `${mid} is inside the range.` },
				]),
				explanation: `The condition is true from ${lo} to ${hi}, both included. ${answer} is ${below ? "below" : "above"} that range, so the ELSE runs.`,
				trace: { code: L(`age ← ${answer}`, code), note: `Tracing with age = ${answer}.` },
			};
		},
	},
	{
		id: "bo-outside-range",
		topic: "boolean",
		skill: "Writing a condition for a range",
		level: "challenging",
		type: "choose-code",
		structure: "Choose the condition that matches a range spec",
		build(r) {
			const lo = r.int(10, 30);
			const hi = lo + r.int(10, 20);
			return {
				prompt: `Which condition is true exactly when n is outside the range ${lo} to ${hi} — that is, below ${lo} or above ${hi}?`,
				options: options(
					`n < ${lo} OR n > ${hi}`,
					[
						{ text: `n < ${lo} AND n > ${hi}`, why: `n can't be below ${lo} and above ${hi} at once, so this is never true.` },
						{ text: `n ≤ ${lo} OR n ≥ ${hi}`, why: `This is also true at ${lo} and ${hi}, which are inside the range.` },
						{ text: `NOT (n < ${lo} OR n > ${hi})`, why: "NOT flips it: this is true when n is inside the range." },
					],
					[],
					true,
				),
				explanation: `"Outside" means below the bottom OR above the top. Using < and > (not ≤ and ≥) keeps ${lo} and ${hi} themselves inside the range.`,
				trace: null,
			};
		},
	},
	{
		id: "bo-bug-input",
		topic: "boolean",
		topics: ["selection"],
		skill: "Testing boundaries to find a bug",
		level: "challenging",
		type: "bug-input",
		structure: "Pick the test input that exposes a > / ≥ bug",
		build(r) {
			const P = r.pick([50, 60, 65, 70]);
			const A = r.pick([80, 85, 90]);
			const bugInScore = r.bool();
			const cond = bugInScore ? `score > ${P} AND attendance ≥ ${A}` : `score ≥ ${P} AND attendance > ${A}`;
			const code = L(`IF (${cond})`, "{", '  DISPLAY("pass")', "}", "ELSE", "{", '  DISPLAY("fail")', "}");
			const expose = bugInScore ? [P, A + 5] : [P + 10, A];
			const fmt = ([s, a]: number[]) => `score = ${s}, attendance = ${a}`;
			return {
				prompt: `The rule: a student passes if score is at least ${P} AND attendance is at least ${A}. Which test shows that this code has a bug?`,
				code,
				options: options(fmt(expose), [
					{ text: fmt([P + 10, A + 5]), why: "The rule and the code both say pass here, so this test can't reveal the bug." },
					{ text: fmt([P - 1, A + 5]), why: "The rule and the code both say fail here." },
					{ text: fmt([P + 10, A - 1]), why: "The rule and the code both say fail here." },
				]),
				explanation: `The rule says "at least", which is ≥, but the code uses > for ${bugInScore ? "score" : "attendance"}. Only a test exactly on that boundary (${fmt(expose)}) shows the difference: the rule says pass, the code says fail.`,
				trace: { code: L(`score ← ${expose[0]}`, `attendance ← ${expose[1]}`, code), note: `Tracing with ${fmt(expose)}.` },
			};
		},
	},
	{
		id: "bo-three-vars",
		topic: "boolean",
		skill: "Combining conditions with brackets",
		level: "challenging",
		type: "output",
		structure: "Three Boolean variables, two bracketings",
		build(r) {
			const p = r.bool();
			const q = r.bool();
			const s = r.bool();
			const e1 = (p || q) && !s;
			const e2 = p || (q && !s);
			const code = L(`p ← ${p}`, `q ← ${q}`, `r ← ${s}`, "DISPLAY((p OR q) AND NOT r)", "DISPLAY(p OR (q AND NOT r))");
			return {
				prompt: "What is displayed?",
				code,
				options: options(
					`${tf(e1)} ${tf(e2)}`,
					[
						{ text: `${tf(e2)} ${tf(e1)}`, why: "The brackets were read the other way round. Work out the inside of each bracket first." },
						{ text: `${tf(!e1)} ${tf(e2)}`, why: "In line 1, (p OR q) is worked out first, then AND NOT r." },
						{ text: `${tf(e1)} ${tf(!e2)}`, why: "In line 2, (q AND NOT r) is worked out first, then OR with p." },
					],
					["true true", "true false", "false true", "false false"],
				),
				explanation: `p OR q = ${p || q}, NOT r = ${!s}. Line 1: ${p || q} AND ${!s} = ${e1}. Line 2: q AND NOT r = ${q && !s}, then ${p} OR ${q && !s} = ${e2}.`,
				trace: { code },
			};
		},
	},
];

// --------------------------------------------------------------------------- Selection

export const SELECTION_TEMPLATES: Template[] = [
	{
		id: "se-if-else",
		topic: "selection",
		skill: "IF / ELSE runs exactly one block",
		level: "easy",
		type: "output",
		structure: "IF / ELSE followed by a statement after it",
		build(r) {
			const t = r.int(10, 30);
			const x = r.bool() ? t + r.int(1, 9) : t - r.int(0, 9);
			const hi = x > t;
			const code = L(`x ← ${x}`, `IF (x > ${t})`, "{", '  DISPLAY("high")', "}", "ELSE", "{", '  DISPLAY("low")', "}", 'DISPLAY("done")');
			const ans = `${hi ? "high" : "low"} done`;
			return {
				prompt: "What is displayed?",
				code,
				options: options(ans, [
					{ text: `${hi ? "low" : "high"} done`, why: `${x} > ${t} is ${hi}${x === t ? " — equal isn't greater" : ""}, so the ${hi ? "IF" : "ELSE"} block runs.` },
					{ text: "high low done", why: "Only one of the two blocks runs — never both." },
					{ text: hi ? "high" : "low", why: 'DISPLAY("done") comes after the IF / ELSE, so it always runs.' },
				]),
				explanation: `${x} > ${t} is ${hi}, so ${hi ? "the IF block" : "the ELSE block"} shows "${hi ? "high" : "low"}". Then "done" is shown either way.`,
				trace: { code },
			};
		},
	},
	{
		id: "se-nested-bands",
		topic: "selection",
		skill: "Nested IF / ELSE",
		level: "medium",
		type: "output",
		structure: "Grade bands with an IF nested inside ELSE",
		build(r) {
			const top = r.pick([85, 90]);
			const mid = top - 10;
			const score = r.pick([top, top - 1, mid, mid - 1, top + r.int(1, 9), mid + r.int(1, 8)]);
			const grade = score >= top ? "A" : score >= mid ? "B" : "C";
			const code = L(
				`score ← ${score}`,
				`IF (score ≥ ${top})`,
				"{",
				'  DISPLAY("A")',
				"}",
				"ELSE",
				"{",
				`  IF (score ≥ ${mid})`,
				"  {",
				'    DISPLAY("B")',
				"  }",
				"  ELSE",
				"  {",
				'    DISPLAY("C")',
				"  }",
				"}",
			);
			const others = ["A", "B", "C"].filter((g) => g !== grade);
			return {
				prompt: "What is displayed?",
				code,
				options: options(grade, [
					...others.map((g) => ({
						text: g,
						why: g === "A" ? `≥ ${top} is false for ${score}.` : g === "B" ? `${score} is ${score >= top ? `≥ ${top}, so the first IF already matched` : `below ${mid}`}.` : `${score} ≥ ${mid}, so it isn't a C.`,
					})),
					{ text: grade === "C" ? "B C" : `${grade} C`, why: "Once one branch runs, the others are skipped — only one grade is shown." },
				]),
				explanation: `${score} ≥ ${top} is ${score >= top}.${score >= top ? "" : ` Inside ELSE, ${score} ≥ ${mid} is ${score >= mid}.`} So "${grade}" is displayed.${score === top || score === mid ? " ≥ includes the boundary value." : ""}`,
				trace: { code },
			};
		},
	},
	{
		id: "se-independent-ifs",
		topic: "selection",
		topics: ["arithmetic"],
		skill: "Separate IFs vs IF / ELSE",
		level: "medium",
		type: "compare",
		structure: "Two separate IFs compared with IF / ELSE IF",
		build(r) {
			const a = r.int(4, 6);
			const b = r.int(1, 3);
			const x = a + b + r.int(2, 6);
			const ifs = (nested: boolean) =>
				nested
					? L(`x ← ${x}`, `IF (x > ${a})`, "{", `  x ← x - ${a}`, "}", "ELSE", "{", `  IF (x > ${b})`, "  {", `    x ← x - ${b}`, "  }", "}", "DISPLAY(x)")
					: L(`x ← ${x}`, `IF (x > ${a})`, "{", `  x ← x - ${a}`, "}", `IF (x > ${b})`, "{", `  x ← x - ${b}`, "}", "DISPLAY(x)");
			let one = x > a ? x - a : x;
			if (one > b) one -= b;
			const two = x > a ? x - a : x > b ? x - b : x;
			return {
				prompt: "What do the two segments display?",
				code: L("Segment I", ifs(false), "", "Segment II", ifs(true)),
				options: options(`I: ${one}  II: ${two}`, [
					{ text: `I: ${two}  II: ${two}`, why: "In I, the second IF is separate, so it's checked too — after x has already changed." },
					{ text: `I: ${one}  II: ${one}`, why: "In II, the second test is inside ELSE, so it's skipped once the first IF runs." },
					{ text: `I: ${two}  II: ${one}`, why: "Right numbers, wrong way round." },
				]),
				explanation: `I: ${x} > ${a}, so x becomes ${x - a}; the second IF is checked separately: ${x - a} > ${b} is ${x - a > b}, giving ${one}. II: the first IF runs, so the ELSE (with the second test) is skipped: ${two}.`,
				trace: { code: ifs(false), note: "Tracing Segment I." },
			};
		},
	},
	{
		id: "se-order-bug",
		topic: "selection",
		skill: "Order of conditions",
		level: "challenging",
		type: "bug-input",
		structure: "Conditions checked in the wrong order; find the input that shows it",
		build(r) {
			const pass = r.pick([50, 60]);
			const top = r.pick([85, 90]);
			const code = L(
				`IF (score ≥ ${pass})`,
				"{",
				'  DISPLAY("pass")',
				"}",
				"ELSE",
				"{",
				`  IF (score ≥ ${top})`,
				"  {",
				'    DISPLAY("excellent")',
				"  }",
				"  ELSE",
				"  {",
				'    DISPLAY("fail")',
				"  }",
				"}",
			);
			const high = top + r.int(1, 8);
			return {
				prompt: `It should display "excellent" for ${top} or more, "pass" for ${pass}–${top - 1}, and "fail" below ${pass}. Which score shows the code is wrong?`,
				code,
				options: options(String(high), [
					{ text: String(top - 5), why: `${top - 5} should be "pass", and the code does show "pass".` },
					{ text: String(pass - 10), why: `${pass - 10} should be "fail", and it is.` },
					{ text: String(pass), why: `${pass} should be "pass", and the code shows "pass" (≥ includes it).` },
				]),
				explanation: `Any score of ${top}+ also passes the first test (≥ ${pass}), so "pass" is shown and the "excellent" check inside ELSE can never be reached. Check the highest band first.`,
				trace: { code: L(`score ← ${high}`, code), note: `Tracing with score = ${high}.` },
			};
		},
	},
	{
		id: "se-missing-condition",
		topic: "selection",
		topics: ["boolean"],
		skill: "Writing an IF condition",
		level: "medium",
		type: "missing",
		structure: "Missing condition for a two-part rule",
		build(r) {
			const young = r.pick([4, 5, 6]);
			const old = r.pick([60, 65]);
			const code = L("IF (<MISSING CODE>)", "{", '  DISPLAY("free")', "}", "ELSE", "{", '  DISPLAY("ticket")', "}");
			return {
				prompt: `Entry is free for anyone under ${young} or aged ${old} and over. Which condition replaces <MISSING CODE>?`,
				code,
				options: options(
					`age < ${young} OR age ≥ ${old}`,
					[
						{ text: `age < ${young} AND age ≥ ${old}`, why: "Nobody is both that young and that old, so this is never true." },
						{ text: `age ≤ ${young} OR age > ${old}`, why: `Check the edges: this charges a ${old}-year-old and lets a ${young}-year-old in free.` },
						{ text: `age > ${young} AND age < ${old}`, why: "That's the group who should pay — the opposite." },
					],
					[],
					true,
				),
				explanation: `Either group gets in free, so use OR. "Under ${young}" is < ${young}; "${old} and over" is ≥ ${old}.`,
				trace: { code: L(`age ← ${old}`, code.replace("<MISSING CODE>", `age < ${young} OR age ≥ ${old}`)), note: `Tracing the correct condition with age = ${old}.` },
			};
		},
	},
	{
		id: "se-chained",
		topic: "selection",
		topics: ["arithmetic"],
		skill: "One IF changes what the next IF sees",
		level: "challenging",
		type: "output",
		structure: "An IF that changes a value the next IF / ELSE tests",
		build(r) {
			const t = r.int(6, 12);
			// An even x between t and 2t: x > t, but x / 2 ≤ t — so halving
			// changes which branch the second IF takes (that's the point).
			const x = 2 * r.int(Math.ceil((t + 1) / 2), t);
			const half = x / 2;
			const final = half > t ? half - t : half + t;
			const naive = x > t ? half - t : half + t;
			const code = L(`x ← ${x}`, "IF (x MOD 2 = 0)", "{", "  x ← x / 2", "}", `IF (x > ${t})`, "{", `  x ← x - ${t}`, "}", "ELSE", "{", `  x ← x + ${t}`, "}", "DISPLAY(x)");
			return {
				prompt: "What is displayed?",
				code,
				options: options(
					String(final),
					[
						{ text: String(naive), why: "The second IF checks x after the first IF has halved it, not the original value." },
						{ text: String(x > t ? x - t : x + t), why: `${x} is even, so the first IF does run and halves x.` },
						{ text: String(half), why: "The IF / ELSE always runs one of its two blocks." },
					],
					[String(final + 1)],
				),
				explanation: `${x} is even, so x becomes ${half}. Then ${half} > ${t} is ${half > t}, so x becomes ${final}.`,
				trace: { code },
			};
		},
	},
];
