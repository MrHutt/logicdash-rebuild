// A small interpreter for the exam reference-sheet pseudocode (text form).
// Used in two places:
//   1. Development checks — every question's answer is re-derived by
//      actually running its code.
//   2. "Show trace" in the practice tool — the run is recorded step by step
//      (line, what happened, variables, output, robot position).
//
// Semantics follow the reference sheet:
//   - a / b is real division (17 / 5 = 3.4); MOD has the same precedence as * and /.
//   - DISPLAY(x) shows x followed by a space.
//   - Lists start at index 1; an index below 1 or above LENGTH is an error that ends the program.
//   - aList ← bList assigns a COPY of bList.
//   - RETURN ends the procedure immediately.
//   - Robot: rotations turn in place; CAN_MOVE directions are relative to the
//     robot; moving into a blocked square or off the grid leaves the robot
//     where it is and ends the program.
// Code is expected one statement per line, with { and } on their own lines.

export type Value = number | string | boolean | Value[];
export type Facing = "up" | "right" | "down" | "left";

export interface RobotState {
	row: number;
	col: number;
	facing: Facing;
}

export interface RunOptions {
	grid?: { rows: string[]; robot: RobotState };
	inputs?: string[];
	/** Values for RANDOM, used in order (for tests and reproducible traces). */
	randoms?: number[];
	maxSteps?: number;
	/** Record a trace (costs a little time and memory). */
	trace?: boolean;
}

export interface TraceStep {
	line: number; // 0-based line index into the code
	text: string; // plain-English description of what happened
	vars: Record<string, string>;
	output: string[];
	robot?: RobotState;
}

export interface RunResult {
	output: string[];
	/** "done" normally; "blocked" when the robot hit a wall; "error" for a runtime error; "limit" when it never stopped. */
	ended: "done" | "blocked" | "error" | "limit";
	error?: string;
	vars: Record<string, Value>;
	robot?: RobotState;
	steps: TraceStep[];
}

// --------------------------------------------------------------------------
// Tokens and expressions

type Tok = { t: "num"; v: number } | { t: "str"; v: string } | { t: "id"; v: string } | { t: "op"; v: string };

function tokenize(src: string): Tok[] {
	const out: Tok[] = [];
	let i = 0;
	while (i < src.length) {
		const c = src[i];
		if (/\s/.test(c)) {
			i++;
			continue;
		}
		if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1] ?? ""))) {
			let j = i;
			while (j < src.length && /[0-9.]/.test(src[j])) j++;
			out.push({ t: "num", v: Number(src.slice(i, j)) });
			i = j;
			continue;
		}
		if (c === '"') {
			const j = src.indexOf('"', i + 1);
			if (j < 0) throw new SyntaxError("Unclosed string");
			out.push({ t: "str", v: src.slice(i + 1, j) });
			i = j + 1;
			continue;
		}
		if (/[A-Za-z_]/.test(c)) {
			let j = i;
			while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
			out.push({ t: "id", v: src.slice(i, j) });
			i = j;
			continue;
		}
		if ("←+-*/=≠<>≤≥()[],".includes(c)) {
			out.push({ t: "op", v: c });
			i++;
			continue;
		}
		throw new SyntaxError(`Unexpected character "${c}"`);
	}
	return out;
}

type Expr =
	| { k: "lit"; v: Value }
	| { k: "list"; items: Expr[] }
	| { k: "var"; name: string }
	| { k: "index"; list: Expr; index: Expr }
	| { k: "call"; name: string; args: Expr[] }
	| { k: "un"; op: "-" | "NOT"; e: Expr }
	| { k: "bin"; op: string; a: Expr; b: Expr };

class ExprParser {
	private p = 0;
	constructor(private toks: Tok[]) {}
	done() {
		return this.p >= this.toks.length;
	}
	peek(): Tok | undefined {
		return this.toks[this.p];
	}
	isOp(v: string) {
		const t = this.peek();
		return !!t && t.t === "op" && t.v === v;
	}
	isId(v: string) {
		const t = this.peek();
		return !!t && t.t === "id" && t.v === v;
	}
	expectOp(v: string) {
		if (!this.isOp(v)) throw new SyntaxError(`Expected "${v}"`);
		this.p++;
	}
	parse(): Expr {
		return this.or();
	}
	private or(): Expr {
		let a = this.and();
		while (this.isId("OR")) {
			this.p++;
			a = { k: "bin", op: "OR", a, b: this.and() };
		}
		return a;
	}
	private and(): Expr {
		let a = this.not();
		while (this.isId("AND")) {
			this.p++;
			a = { k: "bin", op: "AND", a, b: this.not() };
		}
		return a;
	}
	private not(): Expr {
		if (this.isId("NOT")) {
			this.p++;
			return { k: "un", op: "NOT", e: this.not() };
		}
		return this.cmp();
	}
	private cmp(): Expr {
		const a = this.add();
		const t = this.peek();
		if (t && t.t === "op" && ["=", "≠", "<", ">", "≤", "≥"].includes(t.v)) {
			this.p++;
			return { k: "bin", op: t.v, a, b: this.add() };
		}
		return a;
	}
	private add(): Expr {
		let a = this.mul();
		for (;;) {
			const t = this.peek();
			if (t && t.t === "op" && (t.v === "+" || t.v === "-")) {
				this.p++;
				a = { k: "bin", op: t.v, a, b: this.mul() };
			} else return a;
		}
	}
	private mul(): Expr {
		let a = this.unary();
		for (;;) {
			const t = this.peek();
			if (t && ((t.t === "op" && (t.v === "*" || t.v === "/")) || (t.t === "id" && t.v === "MOD"))) {
				this.p++;
				a = { k: "bin", op: t.v, a, b: this.unary() };
			} else return a;
		}
	}
	private unary(): Expr {
		if (this.isOp("-")) {
			this.p++;
			return { k: "un", op: "-", e: this.unary() };
		}
		return this.postfix();
	}
	private postfix(): Expr {
		let e = this.primary();
		while (this.isOp("[")) {
			this.p++;
			const index = this.parse();
			this.expectOp("]");
			e = { k: "index", list: e, index };
		}
		return e;
	}
	private args(): Expr[] {
		this.expectOp("(");
		const args: Expr[] = [];
		if (!this.isOp(")")) {
			args.push(this.parse());
			while (this.isOp(",")) {
				this.p++;
				args.push(this.parse());
			}
		}
		this.expectOp(")");
		return args;
	}
	private primary(): Expr {
		const t = this.peek();
		if (!t) throw new SyntaxError("Unexpected end of expression");
		if (t.t === "num") {
			this.p++;
			return { k: "lit", v: t.v };
		}
		if (t.t === "str") {
			this.p++;
			return { k: "lit", v: t.v };
		}
		if (t.t === "op" && t.v === "(") {
			this.p++;
			const e = this.parse();
			this.expectOp(")");
			return e;
		}
		if (t.t === "op" && t.v === "[") {
			this.p++;
			const items: Expr[] = [];
			if (!this.isOp("]")) {
				items.push(this.parse());
				while (this.isOp(",")) {
					this.p++;
					items.push(this.parse());
				}
			}
			this.expectOp("]");
			return { k: "list", items };
		}
		if (t.t === "id") {
			this.p++;
			if (t.v === "true") return { k: "lit", v: true };
			if (t.v === "false") return { k: "lit", v: false };
			if (this.isOp("(")) return { k: "call", name: t.v, args: this.args() };
			return { k: "var", name: t.v };
		}
		throw new SyntaxError(`Unexpected "${t.v}"`);
	}
}

function parseExpr(src: string): Expr {
	const p = new ExprParser(tokenize(src));
	const e = p.parse();
	if (!p.done()) throw new SyntaxError(`Unexpected text in "${src}"`);
	return e;
}

// --------------------------------------------------------------------------
// Statements

type Stmt =
	| { k: "assign"; line: number; name: string; e: Expr }
	| { k: "setIndex"; line: number; name: string; index: Expr; e: Expr }
	| { k: "expr"; line: number; e: Expr }
	| { k: "if"; line: number; cond: Expr; then: Stmt[]; else: Stmt[] | null; elseLine: number }
	| { k: "times"; line: number; n: Expr; body: Stmt[] }
	| { k: "until"; line: number; cond: Expr; body: Stmt[] }
	| { k: "each"; line: number; name: string; list: Expr; body: Stmt[] }
	| { k: "return"; line: number; e: Expr | null };

interface Proc {
	params: string[];
	body: Stmt[];
	line: number;
}

interface Program {
	main: Stmt[];
	procs: Record<string, Proc>;
}

/** Strip the outer brackets of "(cond)" headers if present. */
function headerExpr(text: string): Expr {
	return parseExpr(text.trim());
}

export function parseProgram(code: string): Program {
	const lines = code.split("\n");
	let i = 0;
	const procs: Record<string, Proc> = {};

	const skipBlank = () => {
		while (i < lines.length && lines[i].trim() === "") i++;
	};

	function block(): Stmt[] {
		skipBlank();
		if (lines[i]?.trim() !== "{") throw new SyntaxError(`Expected "{" on line ${i + 1}`);
		i++;
		const body: Stmt[] = [];
		for (;;) {
			skipBlank();
			if (i >= lines.length) throw new SyntaxError("Missing }");
			if (lines[i].trim() === "}") {
				i++;
				return body;
			}
			const s = statement();
			if (s) body.push(s);
		}
	}

	function statement(): Stmt | null {
		const line = i;
		const text = lines[i].trim();
		i++;
		let m: RegExpMatchArray | null;
		if ((m = text.match(/^PROCEDURE\s+(\w+)\s*\((.*)\)$/))) {
			const params = m[2].trim() ? m[2].split(",").map((s) => s.trim()) : [];
			procs[m[1]] = { params, body: block(), line };
			return null;
		}
		if ((m = text.match(/^IF\s*(\(.*\))$/))) {
			const cond = headerExpr(m[1]);
			const then = block();
			skipBlank();
			let els: Stmt[] | null = null;
			let elseLine = -1;
			if (lines[i]?.trim() === "ELSE") {
				elseLine = i;
				i++;
				els = block();
			}
			return { k: "if", line, cond, then, else: els, elseLine };
		}
		if ((m = text.match(/^REPEAT\s+UNTIL\s*(\(.*\))$/))) return { k: "until", line, cond: headerExpr(m[1]), body: block() };
		if ((m = text.match(/^REPEAT\s+(.+)\s+TIMES$/))) return { k: "times", line, n: parseExpr(m[1]), body: block() };
		if ((m = text.match(/^FOR\s+EACH\s+(\w+)\s+IN\s+(.+)$/))) return { k: "each", line, name: m[1], list: parseExpr(m[2]), body: block() };
		if ((m = text.match(/^RETURN\s*\((.*)\)$/))) return { k: "return", line, e: m[1].trim() ? parseExpr(m[1]) : null };
		if ((m = text.match(/^(\w+)\s*\[(.+)\]\s*←\s*(.+)$/))) return { k: "setIndex", line, name: m[1], index: parseExpr(m[2]), e: parseExpr(m[3]) };
		if ((m = text.match(/^(\w+)\s*←\s*(.+)$/))) return { k: "assign", line, name: m[1], e: parseExpr(m[2]) };
		return { k: "expr", line, e: parseExpr(text) };
	}

	const main: Stmt[] = [];
	for (;;) {
		skipBlank();
		if (i >= lines.length) break;
		const s = statement();
		if (s) main.push(s);
	}
	return { main, procs };
}

// --------------------------------------------------------------------------
// Running

class Halt {
	constructor(
		public reason: "blocked" | "error" | "limit",
		public message: string,
	) {}
}
class ReturnSignal {
	constructor(public value: Value | undefined) {}
}

const DIRS: Facing[] = ["up", "right", "down", "left"];
const DELTA: Record<Facing, [number, number]> = { up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1] };

export function formatValue(v: Value | undefined): string {
	if (v === undefined) return "nothing";
	if (Array.isArray(v)) return `[${v.map(formatValue).join(", ")}]`;
	if (typeof v === "number") return String(Math.round(v * 1e9) / 1e9);
	return String(v);
}

const copy = (v: Value): Value => (Array.isArray(v) ? v.map(copy) : v);

export function run(code: string, opts: RunOptions = {}): RunResult {
	const program = parseProgram(code);
	const output: string[] = [];
	const steps: TraceStep[] = [];
	const globals: Record<string, Value> = {};
	const maxSteps = opts.maxSteps ?? 5000;
	let count = 0;
	let inputs = [...(opts.inputs ?? [])];
	let randoms = [...(opts.randoms ?? [])];
	const grid = opts.grid?.rows;
	const robot: RobotState | undefined = opts.grid ? { ...opts.grid.robot } : undefined;

	const open = (r: number, c: number) => !!grid && r >= 0 && c >= 0 && r < grid.length && c < grid[0].length && grid[r][c] !== "#";
	const relative = (d: string): Facing => {
		const i = DIRS.indexOf(robot!.facing);
		const off = { forward: 0, right: 1, backward: 2, left: 3 }[d];
		if (off === undefined) throw new Halt("error", `CAN_MOVE needs left, right, forward or backward (got ${d})`);
		return DIRS[(i + off) % 4];
	};

	function snapshot(scope: Record<string, Value>): Record<string, string> {
		const out: Record<string, string> = {};
		for (const [k, v] of Object.entries(globals)) out[k] = formatValue(v);
		if (scope !== globals) for (const [k, v] of Object.entries(scope)) out[k] = formatValue(v);
		return out;
	}

	function record(line: number, text: string, scope: Record<string, Value>) {
		if (++count > maxSteps) throw new Halt("limit", "The program ran for too long — it may never stop.");
		if (opts.trace && steps.length < 600) steps.push({ line, text, vars: snapshot(scope), output: [...output], robot: robot ? { ...robot } : undefined });
	}

	const lookup = (name: string, scope: Record<string, Value>): Value => {
		if (name in scope) return scope[name];
		if (name in globals) return globals[name];
		throw new Halt("error", `${name} has no value yet`);
	};
	const assign = (name: string, v: Value, scope: Record<string, Value>) => {
		if (scope !== globals && !(name in scope) && name in globals) globals[name] = v;
		else scope[name] = v;
	};
	const asList = (v: Value, what: string): Value[] => {
		if (!Array.isArray(v)) throw new Halt("error", `${what} is not a list`);
		return v;
	};
	const checkIndex = (list: Value[], i: Value) => {
		if (typeof i !== "number" || !Number.isInteger(i) || i < 1 || i > list.length)
			throw new Halt("error", `Index ${formatValue(i)} is outside the list (it has ${list.length} item${list.length === 1 ? "" : "s"})`);
		return i;
	};
	const num = (v: Value, op: string) => {
		if (typeof v !== "number") throw new Halt("error", `${op} needs numbers`);
		return v;
	};

	function evaluate(e: Expr, scope: Record<string, Value>): Value {
		switch (e.k) {
			case "lit":
				return e.v;
			case "list":
				return e.items.map((x) => evaluate(x, scope));
			case "var":
				return lookup(e.name, scope);
			case "index": {
				const list = asList(evaluate(e.list, scope), "That");
				return list[checkIndex(list, evaluate(e.index, scope)) - 1];
			}
			case "un": {
				const v = evaluate(e.e, scope);
				return e.op === "NOT" ? !v : -num(v, "-");
			}
			case "bin": {
				if (e.op === "AND") return !!evaluate(e.a, scope) && !!evaluate(e.b, scope);
				if (e.op === "OR") return !!evaluate(e.a, scope) || !!evaluate(e.b, scope);
				const a = evaluate(e.a, scope);
				const b = evaluate(e.b, scope);
				switch (e.op) {
					case "+":
						if (typeof a === "string" || typeof b === "string") throw new Halt("error", "+ needs numbers");
						return num(a, "+") + num(b, "+");
					case "-":
						return num(a, "-") - num(b, "-");
					case "*":
						return num(a, "*") * num(b, "*");
					case "/":
						if (num(b, "/") === 0) throw new Halt("error", "Division by zero");
						return num(a, "/") / b;
					case "MOD": {
						const x = num(a, "MOD");
						const y = num(b, "MOD");
						if (y <= 0) throw new Halt("error", "MOD needs a positive right-hand number");
						return ((x % y) + y) % y;
					}
					case "=":
						return formatValue(a) === formatValue(b) && typeof a === typeof b;
					case "≠":
						return !(formatValue(a) === formatValue(b) && typeof a === typeof b);
					case "<":
						return num(a, "<") < num(b, "<");
					case ">":
						return num(a, ">") > num(b, ">");
					case "≤":
						return num(a, "≤") <= num(b, "≤");
					case "≥":
						return num(a, "≥") >= num(b, "≥");
				}
				throw new Halt("error", `Unknown operator ${e.op}`);
			}
			case "call":
				return call(e.name, e.args, scope);
		}
	}

	function call(name: string, argExprs: Expr[], scope: Record<string, Value>): Value {
		const args = () => argExprs.map((a) => evaluate(a, scope));
		switch (name) {
			case "DISPLAY": {
				const [v] = args();
				output.push(formatValue(v));
				return true;
			}
			case "INPUT":
				return inputs.length ? inputs.shift()! : "";
			case "RANDOM": {
				const [a, b] = args() as number[];
				const v = randoms.length ? randoms.shift()! : a + Math.floor(Math.random() * (b - a + 1));
				if (v < a || v > b) throw new Halt("error", "RANDOM test value out of range");
				return v;
			}
			case "LENGTH":
				return asList(args()[0], "LENGTH's argument").length;
			case "APPEND": {
				const [l, v] = args();
				asList(l, "APPEND's first argument").push(v);
				return true;
			}
			case "INSERT": {
				const [l, i, v] = args();
				const list = asList(l, "INSERT's first argument");
				if (typeof i !== "number" || !Number.isInteger(i) || i < 1 || i > list.length + 1)
					throw new Halt("error", `Index ${formatValue(i)} is outside the list`);
				list.splice(i - 1, 0, v);
				return true;
			}
			case "REMOVE": {
				const [l, i] = args();
				const list = asList(l, "REMOVE's first argument");
				list.splice(checkIndex(list, i) - 1, 1);
				return true;
			}
			case "MOVE_FORWARD": {
				if (!robot) throw new Halt("error", "There is no robot");
				const [dr, dc] = DELTA[robot.facing];
				if (!open(robot.row + dr, robot.col + dc)) throw new Halt("blocked", "The square ahead is blocked or off the grid, so the robot stays put and the program ends.");
				robot.row += dr;
				robot.col += dc;
				return true;
			}
			case "ROTATE_LEFT":
				robot!.facing = DIRS[(DIRS.indexOf(robot!.facing) + 3) % 4];
				return true;
			case "ROTATE_RIGHT":
				robot!.facing = DIRS[(DIRS.indexOf(robot!.facing) + 1) % 4];
				return true;
			case "CAN_MOVE": {
				const [d] = args();
				const f = relative(String(d));
				const [dr, dc] = DELTA[f];
				return open(robot!.row + dr, robot!.col + dc);
			}
		}
		const proc = program.procs[name];
		if (!proc) throw new Halt("error", `There is no procedure called ${name}`);
		const values = args();
		const local: Record<string, Value> = {};
		proc.params.forEach((p, i) => (local[p] = values[i]));
		try {
			exec(proc.body, local);
		} catch (r) {
			if (r instanceof ReturnSignal) return r.value as Value;
			throw r;
		}
		return undefined as unknown as Value;
	}

	function describeCall(e: Expr): string {
		if (e.k !== "call") return "Evaluated an expression";
		const n = e.name;
		if (n === "DISPLAY") return `DISPLAY shows ${output[output.length - 1]}`;
		if (n === "MOVE_FORWARD") return `Moved forward to row ${robot!.row + 1}, column ${robot!.col + 1}`;
		if (n === "ROTATE_LEFT") return `Turned left — now facing ${robot!.facing}`;
		if (n === "ROTATE_RIGHT") return `Turned right — now facing ${robot!.facing}`;
		return `Called ${n}`;
	}

	function exec(body: Stmt[], scope: Record<string, Value>) {
		for (const s of body) {
			switch (s.k) {
				case "assign": {
					const v = evaluate(s.e, scope);
					assign(s.name, s.e.k === "var" ? copy(v) : v, scope);
					record(s.line, `${s.name} becomes ${formatValue(v)}`, scope);
					break;
				}
				case "setIndex": {
					const list = asList(lookup(s.name, scope), s.name);
					const i = checkIndex(list, evaluate(s.index, scope));
					const v = evaluate(s.e, scope);
					list[i - 1] = v;
					record(s.line, `${s.name}[${i}] becomes ${formatValue(v)}`, scope);
					break;
				}
				case "expr": {
					try {
						evaluate(s.e, scope);
					} catch (h) {
						if (h instanceof Halt && h.reason === "blocked") record(s.line, "Blocked! The robot stays where it is and the program ends", scope);
						throw h;
					}
					record(s.line, describeCall(s.e), scope);
					break;
				}
				case "if": {
					const c = !!evaluate(s.cond, scope);
					record(s.line, `Condition is ${c} — ${c ? "run the IF block" : s.else ? "run the ELSE block" : "skip the block"}`, scope);
					if (c) exec(s.then, scope);
					else if (s.else) exec(s.else, scope);
					break;
				}
				case "times": {
					const n = num(evaluate(s.n, scope), "REPEAT");
					for (let k = 1; k <= n; k++) {
						record(s.line, `Repeat: pass ${k} of ${n}`, scope);
						exec(s.body, scope);
					}
					break;
				}
				case "until": {
					for (let pass = 1; ; pass++) {
						const c = !!evaluate(s.cond, scope);
						record(s.line, c ? "Condition is true — the loop stops" : `Condition is false — run pass ${pass}`, scope);
						if (c) break;
						exec(s.body, scope);
					}
					break;
				}
				case "each": {
					const list = asList(evaluate(s.list, scope), "FOR EACH's list");
					list.forEach((item, k) => {
						assign(s.name, item, scope);
						record(s.line, `${s.name} is item ${k + 1}: ${formatValue(item)}`, scope);
						exec(s.body, scope);
					});
					break;
				}
				case "return": {
					const v = s.e ? evaluate(s.e, scope) : undefined;
					record(s.line, `RETURN ${formatValue(v)}`, scope);
					throw new ReturnSignal(v);
				}
			}
		}
	}

	let ended: RunResult["ended"] = "done";
	let error: string | undefined;
	try {
		exec(program.main, globals);
	} catch (h) {
		if (h instanceof Halt) {
			ended = h.reason;
			error = h.message;
			if (h.reason === "error" && opts.trace) steps.push({ line: steps.at(-1)?.line ?? 0, text: `Error: ${h.message}`, vars: snapshot(globals), output: [...output] });
		} else if (h instanceof ReturnSignal) {
			ended = "error";
			error = "RETURN outside a procedure";
		} else throw h;
	}
	return { output, ended, error, vars: globals, robot, steps };
}
