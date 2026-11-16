// Question templates: Iteration, Lists, Procedures.
import { listText, options, say, type Template } from "./core";

const L = (...lines: string[]) => lines.join("\n");

// --------------------------------------------------------------------------- Iteration

export const ITERATION_TEMPLATES: Template[] = [
	{
		id: "it-repeat-count",
		topic: "iteration",
		skill: "REPEAT n TIMES runs exactly n passes",
		level: "easy",
		type: "output",
		structure: "Counter updated inside REPEAT n TIMES",
		build(r) {
			const s = r.int(1, 9);
			const n = r.int(3, 6);
			const k = r.int(2, 5);
			const code = L(`count ← ${s}`, `REPEAT ${n} TIMES`, "{", `  count ← count + ${k}`, "}", "DISPLAY(count)");
			return {
				prompt: "What is displayed?",
				code,
				options: options(String(s + n * k), [
					{ text: String(s + (n - 1) * k), why: `REPEAT ${n} TIMES runs the block exactly ${n} times — one pass was missed.` },
					{ text: String(s + (n + 1) * k), why: "The starting value isn't an extra pass; there are exactly n passes." },
					{ text: String(n * k), why: `count started at ${s}, not 0.` },
				]),
				explanation: `The block runs ${n} times, adding ${k} each time: ${s} + ${n} × ${k} = ${s + n * k}.`,
				trace: { code },
			};
		},
	},
	{
		id: "it-until-double",
		topic: "iteration",
		skill: "REPEAT UNTIL checks before each pass",
		level: "medium",
		type: "output",
		structure: "Value doubled until it passes a limit",
		build(r) {
			const a = r.int(2, 5);
			const lim = r.int(20, 60);
			let x = a;
			let passes = 0;
			while (!(x > lim)) {
				x *= 2;
				passes++;
			}
			const code = L(`x ← ${a}`, `REPEAT UNTIL (x > ${lim})`, "{", "  x ← x * 2", "}", "DISPLAY(x)");
			return {
				prompt: "What is displayed?",
				code,
				options: options(
					String(x),
					[
						{ text: String(x / 2), why: `${x / 2} > ${lim} is false, so the loop runs one more pass.` },
						{ text: String(x * 2), why: `The condition is checked before each pass: once x is ${x}, x > ${lim} is true and the loop stops.` },
						{ text: String(passes), why: "DISPLAY(x) shows x's value, not how many passes ran." },
					],
					[String(x + 1)],
				),
				explanation: `x doubles until x > ${lim}: ${Array.from({ length: passes + 1 }, (_, i) => a * 2 ** i).join(" → ")}. ${x} is the first value above ${lim}.`,
				trace: { code },
			};
		},
	},
	{
		id: "it-until-outputs",
		topic: "iteration",
		skill: "The last pass can go past the stopping value",
		level: "medium",
		type: "output",
		structure: "DISPLAY inside a REPEAT UNTIL with a step",
		build(r) {
			const step = r.int(2, 4);
			const n = step * r.int(2, 4) + r.int(1, step - 1);
			const seq: number[] = [];
			let x = 0;
			while (!(x >= n)) {
				x += step;
				seq.push(x);
			}
			const code = L("x ← 0", `REPEAT UNTIL (x ≥ ${n})`, "{", `  x ← x + ${step}`, "  DISPLAY(x)", "}");
			return {
				prompt: "What is displayed?",
				code,
				options: options(seq.join(" "), [
					{ text: seq.slice(0, -1).join(" "), why: `The check only happens at the start of a pass. On the last pass x goes past ${n} and is still displayed.` },
					{ text: [0, ...seq.slice(0, -1)].join(" "), why: "x is increased before it's displayed, so 0 is never shown." },
					{ text: [...seq, x + step].join(" "), why: `Once x is ${x}, x ≥ ${n} is true at the next check, so the loop stops.` },
				]),
				explanation: `Each pass adds ${step} then displays x. After ${x} is shown, x ≥ ${n} is true, so the loop stops.`,
				trace: { code },
			};
		},
	},
	{
		id: "it-nested",
		topic: "iteration",
		skill: "Nested loops multiply",
		level: "challenging",
		type: "output",
		structure: "Nested REPEAT with an extra statement in the outer loop",
		build(r) {
			const a = r.int(2, 4);
			const b = r.int(2, 5);
			const c = r.int(2, 9);
			const code = L("count ← 0", `REPEAT ${a} TIMES`, "{", `  REPEAT ${b} TIMES`, "  {", "    count ← count + 1", "  }", `  count ← count + ${c}`, "}", "DISPLAY(count)");
			return {
				prompt: "What is displayed?",
				code,
				options: options(String(a * b + a * c), [
					{ text: String(a + b + c), why: `The inner loop runs ${b} times for each of the ${a} outer passes — counts multiply.` },
					{ text: String(a * b + c), why: `count ← count + ${c} is inside the outer loop, so it runs ${a} times.` },
					{ text: String(a * b), why: `Don't forget the + ${c} on every outer pass.` },
				]),
				explanation: `Each outer pass adds ${b} (inner loop) + ${c} = ${b + c}. ${a} passes × ${b + c} = ${a * (b + c)}.`,
				trace: { code },
			};
		},
	},
	{
		id: "it-never-stops",
		topic: "iteration",
		skill: "Loops that never stop",
		level: "medium",
		type: "error",
		structure: "REPEAT UNTIL whose condition can never become true",
		build(r) {
			const start = 2 * r.int(0, 4) + 1;
			const target = 2 * r.int(5, 9);
			const code = L(`x ← ${start}`, `REPEAT UNTIL (x = ${target})`, "{", "  x ← x + 2", "}", "DISPLAY(x)");
			return {
				prompt: "What happens when this code runs?",
				code,
				options: options("The loop never stops", [
					{ text: `It displays ${target}`, why: `x goes ${start}, ${start + 2}, ${start + 4}, … — always odd, so it is never exactly ${target}.` },
					{ text: `It displays ${target + 1}`, why: `REPEAT UNTIL stops only when x = ${target} is exactly true. Going past it doesn't count.` },
					{ text: `It displays ${start}`, why: `x = ${target} is false at the start, so the loop body runs.` },
				]),
				explanation: `x starts odd and goes up by 2, so it is always odd. It skips straight past ${target}, so x = ${target} is never true and the loop never ends. Using x ≥ ${target} would fix it.`,
				trace: { code, note: "The trace is cut short — this loop would run forever." },
			};
		},
	},
	{
		id: "it-missing-until",
		topic: "iteration",
		topics: ["boolean"],
		skill: "Choosing a stopping condition",
		level: "challenging",
		type: "missing",
		structure: "Missing REPEAT UNTIL condition for a counting loop",
		build(r) {
			const n = r.int(4, 8);
			const code = L("i ← 1", "REPEAT UNTIL (<MISSING CODE>)", "{", "  DISPLAY(i)", "  i ← i + 1", "}");
			const nums = Array.from({ length: n }, (_, k) => k + 1).join(" ");
			return {
				prompt: `The code should display ${nums}. Which replaces <MISSING CODE>?`,
				code,
				options: options(
					`i > ${n}`,
					[
						{ text: `i = ${n}`, why: `The loop stops as soon as i = ${n}, before ${n} is displayed.` },
						{ text: `i ≥ ${n}`, why: `Also stops when i is ${n}, one pass too early.` },
						{ text: `i < ${n}`, why: "That's already true at the start (1 < n), so nothing is displayed." },
					],
					[],
					true,
				),
				explanation: `REPEAT UNTIL stops when its condition is true, checking before each pass. With i > ${n}, the pass for i = ${n} still runs; the loop ends when i reaches ${n + 1}.`,
				trace: { code: code.replace("<MISSING CODE>", `i > ${n}`), note: "Tracing the correct condition." },
			};
		},
	},
	{
		id: "it-sum-multiples",
		topic: "iteration",
		topics: ["arithmetic", "selection"],
		skill: "Accumulating with a condition",
		level: "medium",
		type: "output",
		structure: "Loop counter, MOD test and accumulator together",
		build(r) {
			const n = r.int(7, 12);
			const k = r.pick([2, 3, 4]);
			let total = 0;
			let count = 0;
			for (let i = 1; i <= n; i++)
				if (i % k === 0) {
					total += i;
					count++;
				}
			const code = L("total ← 0", "i ← 1", `REPEAT ${n} TIMES`, "{", `  IF (i MOD ${k} = 0)`, "  {", "    total ← total + i", "  }", "  i ← i + 1", "}", "DISPLAY(total)");
			return {
				prompt: "What is displayed?",
				code,
				options: options(
					String(total),
					[
						{ text: String(count), why: "total adds i itself, not 1 — it's a total, not a count." },
						{ text: String((n * (n + 1)) / 2), why: `Only values where i MOD ${k} = 0 are added.` },
						// Off by one pass: stopping at i = n - 1, or running on to i = n + 1.
						{ text: String(n % k === 0 ? total - n : (n + 1) % k === 0 ? total + n + 1 : total), why: `i goes from 1 up to ${n}: REPEAT ${n} TIMES runs exactly ${n} passes.` },
					],
					[String(total + 1)],
				),
				explanation: `i runs from 1 to ${n}. The multiples of ${k} are ${Array.from({ length: n }, (_, i) => i + 1).filter((i) => i % k === 0).join(", ")}, which add up to ${total}.`,
				trace: { code },
			};
		},
	},
];

// --------------------------------------------------------------------------- Lists

export const LIST_TEMPLATES: Template[] = [
	{
		id: "li-access",
		topic: "lists",
		skill: "Lists start at index 1",
		level: "easy",
		type: "output",
		structure: "Read one item by index",
		build(r) {
			const vals = r.distinct(5, 10, 60);
			const i = r.int(2, 4);
			const code = L(`nums ← ${listText(vals)}`, `DISPLAY(nums[${i}])`);
			return {
				prompt: "What is displayed?",
				code,
				options: options(
					String(vals[i - 1]),
					[
						{ text: String(vals[i]), why: `Lists start at 1, so nums[${i}] is item number ${i} — not the one after it.` },
						{ text: String(vals[i - 2]), why: `nums[${i}] is item number ${i}, counting the first item as 1.` },
						{ text: String(i), why: `nums[${i}] shows the value stored at index ${i}, not the index itself.` },
					],
					[String(vals[4])],
				),
				explanation: `Counting from 1: nums[1] = ${vals[0]}, nums[2] = ${vals[1]}${i >= 3 ? `, nums[3] = ${vals[2]}` : ""}${i >= 4 ? `, nums[4] = ${vals[3]}` : ""}. So nums[${i}] is ${vals[i - 1]}.`,
				trace: { code },
			};
		},
	},
	{
		id: "li-update",
		topic: "lists",
		skill: "Assigning to an index replaces that item",
		level: "easy",
		type: "final-state",
		structure: "Replace one item, then show the list",
		build(r) {
			const vals = r.distinct(4, 1, 9);
			const i = r.int(1, 3);
			const v = r.int(20, 40);
			const code = L(`list ← ${listText(vals)}`, `list[${i}] ← ${v}`, "DISPLAY(list)");
			const set = (k: number) => vals.map((x, j) => (j === k ? v : x));
			const inserted = [...vals.slice(0, i - 1), v, ...vals.slice(i - 1)];
			return {
				prompt: "What is displayed?",
				code,
				options: options(listText(set(i - 1)), [
					{ text: listText(inserted), why: `list[${i}] ← ${v} replaces the item at index ${i}. It doesn't insert a new one (that's INSERT).` },
					{ text: listText(set(i)), why: `Index ${i} is item number ${i}, counting from 1 — this changed the next one.` },
					{ text: listText(vals), why: "The assignment really does change the list." },
				]),
				explanation: `list[${i}] is item number ${i} (${vals[i - 1]}). It is replaced by ${v}; the list stays the same length.`,
				trace: { code },
			};
		},
	},
	{
		id: "li-ops-sequence",
		topic: "lists",
		skill: "APPEND, INSERT and REMOVE",
		level: "medium",
		type: "final-state",
		structure: "APPEND, INSERT and REMOVE in sequence",
		build(r) {
			const [a, b, c, d, e] = r.distinct(5, 1, 30);
			const code = L(`list ← ${listText([a, b, c])}`, `APPEND(list, ${d})`, `INSERT(list, 2, ${e})`, "REMOVE(list, 1)", "DISPLAY(list)");
			const ans = [e, b, c, d];
			return {
				prompt: "What is displayed?",
				code,
				options: options(listText(ans), [
					{ text: listText([e, c, d]), why: "INSERT shifts items to the right to make room — it doesn't replace the item at index 2." },
					{ text: listText([a, e, c, d]), why: "Index 1 is the first item, so REMOVE(list, 1) removes the first item." },
					{ text: listText([e, d, b, c]), why: "APPEND adds to the end of the list, not the front." },
				]),
				explanation: `After APPEND: ${listText([a, b, c, d])}. INSERT at 2 shifts the rest right: ${listText([a, e, b, c, d])}. REMOVE index 1 takes out ${a}: ${listText(ans)}.`,
				trace: { code },
			};
		},
	},
	{
		id: "li-traverse-sum",
		topic: "lists",
		topics: ["iteration", "selection"],
		skill: "Traversing a list with a condition",
		level: "medium",
		type: "output",
		structure: "FOR EACH with an IF that adds some items",
		build(r) {
			const t = r.int(10, 20);
			const vals = r.shuffle([t, t - r.int(1, 5), t + r.int(1, 6), t + r.int(7, 12), t - r.int(6, 9)]);
			const sum = vals.filter((v) => v >= t).reduce((a, b) => a + b, 0);
			const code = L(`scores ← ${listText(vals)}`, "total ← 0", "FOR EACH s IN scores", "{", `  IF (s ≥ ${t})`, "  {", "    total ← total + s", "  }", "}", "DISPLAY(total)");
			return {
				prompt: "What is displayed?",
				code,
				options: options(
					String(sum),
					[
						{ text: String(sum - t), why: `≥ includes ${t} itself, so it is added too.` },
						{ text: String(vals.filter((v) => v >= t).length), why: "total adds each score, not 1 — it's a sum, not a count." },
						{ text: String(vals.reduce((a, b) => a + b, 0)), why: `Only scores of ${t} or more are added.` },
					],
					[String(sum + 1)],
				),
				explanation: `The scores ≥ ${t} are ${vals.filter((v) => v >= t).join(", ")}. Their total is ${sum}.`,
				trace: { code },
			};
		},
	},
	{
		id: "li-index-error",
		topic: "lists",
		topics: ["iteration"],
		skill: "Index out of range is an error",
		level: "challenging",
		type: "error",
		structure: "Loop that starts at index 0",
		build(r) {
			const vals = r.distinct(4, 2, 40);
			const code = L(`nums ← ${listText(vals)}`, "i ← 0", "REPEAT LENGTH(nums) TIMES", "{", "  DISPLAY(nums[i])", "  i ← i + 1", "}");
			return {
				prompt: "What happens when this code runs?",
				code,
				options: options("An error: there is no nums[0], so the program stops", [
					{ text: `It displays ${vals.join(" ")}`, why: "That's what would happen if lists started at 0. Here the first item is nums[1]." },
					{ text: `It displays ${vals.slice(1).join(" ")}`, why: "nums[0] isn't skipped — using it is an error that ends the program." },
					{ text: `It displays ${vals.slice(0, 3).join(" ")} and then stops with an error`, why: "The error happens straight away, on the very first pass, when i is 0." },
				]),
				explanation: "On the first pass i is 0, and nums[0] is outside the list (indexes run from 1 to LENGTH). That's an error, and the program ends before anything is displayed. Starting with i ← 1 fixes it.",
				trace: { code },
			};
		},
	},
	{
		id: "li-last-item",
		topic: "lists",
		skill: "Using LENGTH to reach the end",
		level: "challenging",
		type: "choose-code",
		structure: "Choose the statement that works for any non-empty list",
		build(r) {
			const vals = r.distinct(r.int(3, 6), 1, 50);
			// The last item must not equal the length, or LENGTH(list) would also look right.
			if (vals[vals.length - 1] === vals.length) vals[vals.length - 1] += 50;
			return {
				prompt: "Which statement displays the last item of list — for any non-empty list?",
				code: `list ← ${listText(vals)}`,
				options: options(
					"DISPLAY(list[LENGTH(list)])",
					[
						{ text: "DISPLAY(list[LENGTH(list) + 1])", why: "There's no item after the last one — that index is an error." },
						{ text: "DISPLAY(list[LENGTH(list) - 1])", why: "That's the second-to-last item. With indexes from 1, the last item is at LENGTH." },
						{ text: "DISPLAY(LENGTH(list))", why: "That shows how many items there are, not the last item." },
					],
					[],
					true,
				),
				explanation: `Indexes run from 1 to LENGTH(list), so the last item is list[LENGTH(list)]. Here that's list[${vals.length}] = ${vals[vals.length - 1]}.`,
				trace: { code: L(`list ← ${listText(vals)}`, "DISPLAY(list[LENGTH(list)])"), note: "Tracing the correct statement." },
			};
		},
	},
	{
		id: "li-remove-bug",
		topic: "lists",
		topics: ["iteration", "procedures"],
		skill: "Removing items while looping",
		level: "challenging",
		type: "bug-input",
		structure: "Pick the test list that exposes a skip-after-REMOVE bug",
		build(r) {
			const t = r.int(2, 9);
			const [a, b] = r.distinct(2, 10, 30);
			const [name, list, target, i] = r.pick([
				["removeAll", "list", "target", "i"],
				["deleteAll", "items", "value", "k"],
				["dropAll", "nums", "x", "pos"],
				["stripAll", "data", "item", "j"],
			]);
			const code = L(
				`PROCEDURE ${name}(${list}, ${target})`,
				"{",
				`  ${i} ← 1`,
				`  REPEAT UNTIL (${i} > LENGTH(${list}))`,
				"  {",
				`    IF (${list}[${i}] = ${target})`,
				"    {",
				`      REMOVE(${list}, ${i})`,
				"    }",
				`    ${i} ← ${i} + 1`,
				"  }",
				`  RETURN(${list})`,
				"}",
			);
			const call = (l: number[]) => `${name}(${listText(l)}, ${t})`;
			return {
				prompt: `${name} should remove every copy of ${target}. Which call shows that it has a bug?`,
				code,
				options: options(call([t, t, a]), [
					{ text: call([t, a, t]), why: "The copies aren't next to each other, so nothing is skipped and the result is correct." },
					{ text: call([a, b]), why: "There's nothing to remove, so the bug never shows." },
					{ text: call([a, t]), why: "Only one copy — it is removed correctly." },
				]),
				explanation: `After REMOVE, the next item slides into position ${i} — but ${i} still goes up by 1, so that item is never checked. Two copies side by side show it: ${call([t, t, a])} returns ${listText([t, a])} instead of ${listText([a])}.`,
				trace: { code: L(code, `DISPLAY(${call([t, t, a])})`), note: `Tracing ${call([t, t, a])}.` },
			};
		},
	},
];

// --------------------------------------------------------------------------- Procedures

export const PROCEDURE_TEMPLATES: Template[] = [
	{
		id: "pr-return-expr",
		topic: "procedures",
		topics: ["arithmetic"],
		skill: "Using a returned value",
		level: "easy",
		type: "output",
		structure: "A call used inside a larger expression",
		build(r) {
			const k = r.int(2, 5);
			const c = r.int(1, 9);
			const a = r.int(2, 9);
			const b = r.int(1, 9);
			const code = L("PROCEDURE f(x)", "{", `  RETURN(x * ${k} + ${c})`, "}", "", `DISPLAY(f(${a}) + ${b})`);
			return {
				prompt: "What is displayed?",
				code,
				options: options(String(a * k + c + b), [
					{ text: String(a * k + c), why: `f(${a}) returns ${a * k + c}, and then ${b} is added to it.` },
					{ text: String((a + b) * k + c), why: `f is called with ${a}. The + ${b} happens after f returns.` },
					{ text: String(a * k + b), why: `f also adds ${c} before returning.` },
				]),
				explanation: `f(${a}) returns ${a} × ${k} + ${c} = ${a * k + c}. Then ${a * k + c} + ${b} = ${a * k + c + b}.`,
				trace: { code },
			};
		},
	},
	{
		id: "pr-param-order",
		topic: "procedures",
		skill: "Arguments match parameters by position",
		level: "medium",
		type: "output",
		structure: "Arguments passed in a different order from the parameter names",
		build(r) {
			const x = r.int(2, 9);
			const y = r.int(12, 25);
			const code = L("PROCEDURE diff(a, b)", "{", "  RETURN(a - b)", "}", "", `x ← ${x}`, `y ← ${y}`, "DISPLAY(diff(y, x))");
			return {
				prompt: "What is displayed?",
				code,
				options: options(String(y - x), [
					{ text: String(x - y), why: "Arguments are matched by position: the first argument (y) becomes a, whatever the names are." },
					{ text: String(x + y), why: "diff subtracts: it returns a − b." },
					{ text: String(y), why: "The procedure returns a − b, not just a." },
				]),
				explanation: `diff(y, x) puts y (${y}) into a and x (${x}) into b. It returns ${y} − ${x} = ${y - x}.`,
				trace: { code },
			};
		},
	},
	{
		id: "pr-early-return",
		topic: "procedures",
		topics: ["lists", "iteration", "selection"],
		skill: "RETURN ends the procedure immediately",
		level: "medium",
		type: "output",
		structure: "RETURN inside a FOR EACH loop",
		build(r) {
			const limit = r.int(20, 40);
			const vals = [limit - r.int(2, 9), limit + r.int(1, 5), limit - r.int(10, 15), limit + r.int(6, 15)];
			const code = L(
				"PROCEDURE firstOver(list, limit)",
				"{",
				"  FOR EACH n IN list",
				"  {",
				"    IF (n > limit)",
				"    {",
				"      RETURN(n)",
				"    }",
				"  }",
				"  RETURN(-1)",
				"}",
				"",
				`DISPLAY(firstOver(${listText(vals)}, ${limit}))`,
			);
			return {
				prompt: "What is displayed?",
				code,
				options: options(String(vals[1]), [
					{ text: String(vals[3]), why: "RETURN ends the procedure at once — it doesn't carry on to find later matches." },
					{ text: "-1", why: "A match is found inside the loop, so RETURN(-1) is never reached." },
					{ text: `${vals[1]} ${vals[3]}`, why: "A procedure returns one value, once." },
				]),
				explanation: `The loop reaches ${vals[0]} (not > ${limit}), then ${vals[1]} (> ${limit}). RETURN(${vals[1]}) ends the procedure right there.`,
				trace: { code },
			};
		},
	},
	{
		id: "pr-missing-return",
		topic: "procedures",
		topics: ["selection"],
		skill: "Every path needs a RETURN",
		level: "medium",
		type: "missing",
		structure: "Missing final RETURN in a two-path procedure",
		build(r) {
			const [x, y] = r.distinct(2, 1, 30).sort((p, q) => p - q);
			const code = L("PROCEDURE larger(a, b)", "{", "  IF (a > b)", "  {", "    RETURN(a)", "  }", "  <MISSING CODE>", "}", "", `DISPLAY(larger(${x}, ${y}))`);
			return {
				prompt: `larger should return the bigger of its two numbers, so ${y} is displayed. Which replaces <MISSING CODE>?`,
				code,
				options: options(
					"RETURN(b)",
					[
						{ text: "RETURN(a)", why: `This line is only reached when a > b is false, so b is the bigger one.` },
						{ text: "DISPLAY(b)", why: "DISPLAY shows b, but larger then returns nothing for the outer DISPLAY to show." },
						{ text: "b ← a", why: "That changes b but never returns a value." },
					],
					[],
					true,
				),
				explanation: `If a > b, the IF returns a. Otherwise execution continues to the last line, where b must be returned. Here ${x} > ${y} is false, so RETURN(b) gives ${y}.`,
				trace: { code: code.replace("<MISSING CODE>", "RETURN(b)"), note: "Tracing with the correct line filled in." },
			};
		},
	},
	{
		id: "pr-nested-calls",
		topic: "procedures",
		topics: ["selection", "arithmetic"],
		skill: "Calls inside calls",
		level: "challenging",
		type: "output",
		structure: "A procedure called on its own result",
		build(r) {
			const f = (n: number) => (n % 2 === 0 ? n / 2 : 3 * n + 1);
			const a = r.int(3, 20);
			const code = L("PROCEDURE f(n)", "{", "  IF (n MOD 2 = 0)", "  {", "    RETURN(n / 2)", "  }", "  RETURN(3 * n + 1)", "}", "", `DISPLAY(f(f(${a})))`);
			const once = f(a);
			const ans = f(once);
			return {
				prompt: "What is displayed?",
				code,
				options: options(
					String(ans),
					[
						{ text: String(once), why: "f(f(a)) calls f a second time, on the result of the first call." },
						{ text: say(once % 2 === 0 ? 3 * once + 1 : once / 2), why: `Check whether ${once} is even or odd before the second call — it decides which RETURN runs.` },
						{ text: String(f(f(a) + 1)), why: "The inner call's result is passed straight in — nothing is added." },
					],
					[String(ans + 1), String(ans * 2)],
				),
				explanation: `Inner call: f(${a}) = ${once} (${a} is ${a % 2 === 0 ? "even" : "odd"}). Outer call: f(${once}) = ${ans} (${once} is ${once % 2 === 0 ? "even" : "odd"}).`,
				trace: { code },
			};
		},
	},
	{
		id: "pr-display-vs-return",
		topic: "procedures",
		topics: ["variables"],
		skill: "DISPLAY inside a procedure vs RETURN",
		level: "challenging",
		type: "output",
		structure: "A procedure that both displays and returns",
		build(r) {
			const a = r.int(2, 15);
			const code = L("PROCEDURE show(n)", "{", "  DISPLAY(n)", "  RETURN(n * 2)", "}", "", `x ← show(${a})`, "DISPLAY(x + 1)");
			return {
				prompt: "What is displayed?",
				code,
				options: options(`${a} ${2 * a + 1}`, [
					{ text: String(2 * a + 1), why: "Calling show runs its DISPLAY too, so the argument is shown first." },
					{ text: String(a), why: "show also returns n * 2, which is stored in x and then displayed (+ 1)." },
					{ text: `${a} ${2 * a}`, why: "The last line adds 1 to x before displaying it." },
				]),
				explanation: `x ← show(${a}) runs show: it displays ${a}, then returns ${2 * a}, which goes into x. Then x + 1 = ${2 * a + 1} is displayed.`,
				trace: { code },
			};
		},
	},
	{
		id: "pr-bug-input",
		topic: "procedures",
		topics: ["lists", "iteration", "selection"],
		skill: "Finding an input that exposes a bug",
		level: "challenging",
		type: "bug-input",
		structure: "Pick the call where ≤ vs < (or ≥ vs >) makes a difference",
		build(r) {
			const limit = r.int(10, 20);
			const below = r.bool();
			const name = below ? r.pick(["countBelow", "countUnder"]) : r.pick(["countAbove", "countOver"]);
			const [list, lim] = r.pick([
				["list", "limit"],
				["nums", "cutoff"],
				["scores", "bar"],
			]);
			const [wrongOp, rightOp, words] = below ? ["≤", "<", "less than"] : ["≥", ">", "greater than"];
			const code = L(`PROCEDURE ${name}(${list}, ${lim})`, "{", "  count ← 0", `  FOR EACH n IN ${list}`, "  {", `    IF (n ${wrongOp} ${lim})`, "    {", "      count ← count + 1", "    }", "  }", "  RETURN(count)", "}");
			const call = (l: number[]) => `${name}(${listText(l)}, ${limit})`;
			const s = below ? 1 : -1; // mirror the test lists for the "greater than" version
			const expose = [limit - 3 * s, limit, limit + 4 * s];
			return {
				prompt: `${name} should count the items that are ${words} ${lim}. Which call shows that it has a bug?`,
				code,
				options: options(call(expose), [
					{ text: call([limit - 5 * s, limit - 1 * s, limit + 2 * s]), why: `No item equals ${limit}, so ${wrongOp} and ${rightOp} give the same count — the bug stays hidden.` },
					{ text: call([limit + 1 * s, limit + 6 * s]), why: "Nothing passes the test either way, so the code and the rule agree (0)." },
					{ text: call([]), why: "An empty list gives 0 either way." },
				]),
				explanation: `"${words[0].toUpperCase() + words.slice(1)}" means ${rightOp}, but the code uses ${wrongOp}, so an item equal to ${limit} is counted by mistake. ${call(expose)} returns 2 instead of 1.`,
				trace: { code: L(code, `DISPLAY(${call(expose)})`), note: `Tracing ${call(expose)}.` },
			};
		},
	},
];

export { say };
