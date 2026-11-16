// Question templates: Robots. Each template simulates the robot itself (in
// plain JavaScript, separately from the interpreter) to place the answer
// label and the misconception labels.
import type { Facing } from "./interpreter";
import { options, type Grid, type Rng, type Template } from "./core";

const L = (...lines: string[]) => lines.join("\n");
const DIRS: Facing[] = ["up", "right", "down", "left"];
const D: Record<Facing, [number, number]> = { up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1] };
const SIZE = 5;
const cap = (f: Facing) => f[0].toUpperCase() + f.slice(1);
const turn = (f: Facing, by: number): Facing => DIRS[(DIRS.indexOf(f) + by + 4) % 4];

type Cmd = "F" | "L" | "R";
interface Pos {
	row: number;
	col: number;
	facing: Facing;
}

class Board {
	blocked = new Set<string>();
	constructor(public size = SIZE) {}
	open(r: number, c: number) {
		return r >= 0 && c >= 0 && r < this.size && c < this.size && !this.blocked.has(`${r},${c}`);
	}
	/** Runs commands; stops (like the real robot) at the first blocked move. */
	run(start: Pos, cmds: Cmd[], opts: { skipBlocked?: boolean; mirror?: boolean; ignoreTurns?: boolean } = {}): { pos: Pos; blockedAt: number | null } {
		const p = { ...start };
		for (let i = 0; i < cmds.length; i++) {
			const c = cmds[i];
			if (c === "F") {
				const [dr, dc] = D[p.facing];
				if (!this.open(p.row + dr, p.col + dc)) {
					if (opts.skipBlocked) continue;
					return { pos: p, blockedAt: i };
				}
				p.row += dr;
				p.col += dc;
			} else if (!opts.ignoreTurns) p.facing = turn(p.facing, (c === "R") !== !!opts.mirror ? 1 : -1);
		}
		return { pos: p, blockedAt: null };
	}
	rows(labels: [string, number, number][]): string[] {
		const g = Array.from({ length: this.size }, (_, r) => Array.from({ length: this.size }, (_, c) => (this.blocked.has(`${r},${c}`) ? "#" : ".")));
		for (const [ch, r, c] of labels) g[r][c] = ch;
		return g.map((row) => row.join(""));
	}
}

const cmdText = (c: Cmd) => (c === "F" ? "MOVE_FORWARD()" : c === "L" ? "ROTATE_LEFT()" : "ROTATE_RIGHT()");
const where = (p: { row: number; col: number }) => `row ${p.row + 1}, column ${p.col + 1}`;
const key = (p: { row: number; col: number }) => `${p.row},${p.col}`;

/**
 * Labels the answer cell plus misconception cells A–D (in random letter
 * order), filling with random open cells. Returns the grid rows and options.
 */
function labelled(r: Rng, board: Board, start: Pos, answer: Pos, wrong: { pos: { row: number; col: number } | null; why: string }[]) {
	const used = new Set([key(start), key(answer)]);
	const cells: { pos: { row: number; col: number }; why?: string; correct?: boolean }[] = [{ pos: answer, correct: true }];
	for (const w of wrong) {
		if (!w.pos || used.has(key(w.pos)) || !board.open(w.pos.row, w.pos.col)) continue;
		used.add(key(w.pos));
		cells.push({ pos: w.pos, why: w.why });
	}
	let guard = 0;
	while (cells.length < 4 && guard++ < 200) {
		const p = { row: r.int(0, board.size - 1), col: r.int(0, board.size - 1) };
		if (used.has(key(p)) || !board.open(p.row, p.col)) continue;
		used.add(key(p));
		cells.push({ pos: p });
	}
	if (cells.length < 4) throw new Error("Could not place labels");
	const letters = r.shuffle(["A", "B", "C", "D"]);
	const rows = board.rows(cells.map((c, i) => [letters[i], c.pos.row, c.pos.col]));
	const correctLetter = letters[0];
	const opts = options(
		correctLetter,
		cells.slice(1).map((c, i) => ({ text: letters[i + 1], why: c.why })),
	).sort((a, b) => a.text.localeCompare(b.text));
	return { rows, options: opts, correctLetter };
}

function randomStart(r: Rng, board: Board): Pos {
	for (;;) {
		const p = { row: r.int(0, SIZE - 1), col: r.int(0, SIZE - 1), facing: r.pick(DIRS) };
		if (board.open(p.row, p.col)) return p;
	}
}

const startText = (p: Pos) => `The robot starts at ${where(p)}, facing ${p.facing}.`;
const gridOf = (rows: string[], p: Pos): Grid => ({ rows, robot: { row: p.row, col: p.col, facing: p.facing } });

export const ROBOT_TEMPLATES: Template[] = [
	{
		id: "ro-moves",
		topic: "robots",
		skill: "Following moves and turns",
		level: "easy",
		type: "final-state",
		structure: "A short list of moves and turns",
		build(r) {
			const board = new Board();
			for (let tries = 0; tries < 100; tries++) {
				const start = randomStart(r, board);
				const cmds: Cmd[] = r.shuffle(["F", "F", r.pick(["L", "R"] as Cmd[]), "F"]);
				if (cmds[cmds.length - 1] !== "F") continue;
				const real = board.run(start, cmds);
				if (real.blockedAt !== null) continue;
				const mirror = board.run(start, cmds, { mirror: true });
				const straight = board.run(start, cmds, { ignoreTurns: true });
				const short = board.run(start, cmds.slice(0, -1));
				const lab = labelled(r, board, start, real.pos, [
					{ pos: mirror.blockedAt === null ? mirror.pos : null, why: "ROTATE_RIGHT turns to the robot's right (clockwise) and ROTATE_LEFT to its left — this turned the other way." },
					{ pos: straight.blockedAt === null ? straight.pos : null, why: "A rotation changes the direction the robot faces, so the moves after it go the new way." },
					{ pos: short.pos, why: "Count the moves again — the last MOVE_FORWARD() was missed." },
				]);
				const code = L(...cmds.map(cmdText));
				return {
					prompt: `${startText(start)} Which square does it end on?`,
					code,
					grid: gridOf(lab.rows, start),
					options: lab.options,
					fixedOrder: true,
					explanation: `Follow each line in order, turning in place on each ROTATE. The robot finishes at ${where(real.pos)}, square ${lab.correctLetter}, facing ${real.pos.facing}.`,
					trace: { code, grid: gridOf(lab.rows, start) },
				};
			}
			throw new Error("no route");
		},
	},
	{
		id: "ro-facing",
		topic: "robots",
		skill: "Rotations turn in place",
		level: "easy",
		type: "final-state",
		structure: "Which way the robot faces after turns and a move",
		build(r) {
			const board = new Board();
			for (let tries = 0; tries < 100; tries++) {
				const start = randomStart(r, board);
				const cmds: Cmd[] = r.shuffle(["L", "R", "R", r.pick(["L", "R"] as Cmd[]), "F"]);
				const real = board.run(start, cmds);
				if (real.blockedAt !== null) continue;
				const end = real.pos.facing;
				const mirror = board.run(start, cmds, { mirror: true }).pos.facing;
				const code = L(...cmds.map(cmdText));
				const whyFor = (f: Facing) =>
					f === mirror ? "ROTATE_RIGHT is clockwise and ROTATE_LEFT is counterclockwise — these were swapped." : f === start.facing ? "The turns don't cancel out completely — count them again." : "Count each turn: right is +90° clockwise, left is −90°. MOVE_FORWARD() doesn't change direction.";
				return {
					prompt: `${startText(start)} Which way is it facing at the end?`,
					code,
					grid: gridOf(board.rows([]), start),
					options: options(
						cap(end),
						DIRS.filter((f) => f !== end).map((f) => ({ text: cap(f), why: whyFor(f) })),
					).sort((a, b) => DIRS.indexOf(a.text.toLowerCase() as Facing) - DIRS.indexOf(b.text.toLowerCase() as Facing)),
					fixedOrder: true,
					explanation: `Rotations turn the robot in place and MOVE_FORWARD() doesn't change its direction. Net turning: ${cmds.filter((c) => c === "R").length} right and ${cmds.filter((c) => c === "L").length} left, so it ends facing ${end}.`,
					trace: { code, grid: gridOf(board.rows([]), start) },
				};
			}
			throw new Error("no route");
		},
	},
	{
		id: "ro-repeat",
		topic: "robots",
		topics: ["iteration"],
		skill: "Repeating robot moves",
		level: "medium",
		type: "final-state",
		structure: "REPEAT n TIMES around a move-and-turn pattern",
		build(r) {
			const board = new Board();
			for (let tries = 0; tries < 200; tries++) {
				const n = r.int(2, 3);
				const body: Cmd[] = r.pick([["F", "F", "R"], ["F", "L"], ["F", "R", "F"], ["F", "F", "L"]] as Cmd[][]);
				const start = randomStart(r, board);
				const all = Array.from({ length: n }, () => body).flat();
				const real = board.run(start, all);
				if (real.blockedAt !== null) continue;
				const fewer = board.run(start, Array.from({ length: n - 1 }, () => body).flat());
				const once = board.run(start, body);
				const mirror = board.run(start, all, { mirror: true });
				const lab = labelled(r, board, start, real.pos, [
					{ pos: fewer.pos, why: `REPEAT ${n} TIMES runs the whole block ${n} times — one repetition was missed.` },
					{ pos: mirror.blockedAt === null ? mirror.pos : null, why: "The turns went the wrong way round." },
					{ pos: once.pos, why: "The block inside the braces repeats; it doesn't just run once." },
				]);
				const code = L(`REPEAT ${n} TIMES`, "{", ...body.map((c) => "  " + cmdText(c)), "}");
				return {
					prompt: `${startText(start)} Which square does it end on?`,
					code,
					grid: gridOf(lab.rows, start),
					options: lab.options,
					fixedOrder: true,
					explanation: `The ${body.length} lines inside the braces run ${n} times in a row (${n * body.length} commands in all). The robot ends at ${where(real.pos)} — square ${lab.correctLetter}.`,
					trace: { code, grid: gridOf(lab.rows, start) },
				};
			}
			throw new Error("no route");
		},
	},
	{
		id: "ro-blocked-stop",
		topic: "robots",
		skill: "A blocked move ends the program",
		level: "medium",
		type: "final-state",
		structure: "A route that runs into a blocked square",
		build(r) {
			for (let tries = 0; tries < 300; tries++) {
				const board = new Board();
				const start = randomStart(r, board);
				const cmds: Cmd[] = ["F", "F", r.pick(["L", "R"] as Cmd[]), "F", "F"];
				// Put a block in front of the robot at step k so the program stops there.
				const k = r.pick([1, 3]);
				const before = board.run(start, cmds.slice(0, k));
				if (before.blockedAt !== null) continue;
				const [dr, dc] = D[before.pos.facing];
				const br = before.pos.row + dr;
				const bc = before.pos.col + dc;
				if (!board.open(br, bc)) continue;
				board.blocked.add(`${br},${bc}`);
				const real = board.run(start, cmds);
				if (real.blockedAt !== k) continue;
				const skip = board.run(start, cmds, { skipBlocked: true });
				const lastOpen = board.run(start, cmds.slice(0, Math.max(0, k - 1)));
				const lab = labelled(r, board, start, real.pos, [
					{ pos: skip.pos, why: "A blocked move isn't skipped — the robot stays put and the whole program ends there." },
					{ pos: lastOpen.pos, why: "The moves before the blocked one still happen." },
				]);
				const code = L(...cmds.map(cmdText));
				return {
					prompt: `${startText(start)} Black squares are blocked. Which square does the robot end on?`,
					code,
					grid: gridOf(lab.rows, start),
					options: lab.options,
					fixedOrder: true,
					explanation: `Line ${k + 1} tries to move into a blocked square. The robot stays at ${where(real.pos)} (square ${lab.correctLetter}) and the program ends — the lines after it never run.`,
					trace: { code, grid: gridOf(lab.rows, start) },
				};
			}
			throw new Error("no route");
		},
	},
	{
		id: "ro-can-move-relative",
		topic: "robots",
		topics: ["selection"],
		skill: "CAN_MOVE directions are relative to the robot",
		level: "challenging",
		type: "final-state",
		structure: "IF / ELSE on CAN_MOVE(\"left\") with a robot not facing up",
		build(r) {
			for (let tries = 0; tries < 400; tries++) {
				const board = new Board();
				const start = randomStart(r, board);
				if (start.facing === "up") continue; // robot's left must differ from the screen's left
				// Block either the robot's left or its right so exactly one way is open.
				const blockLeft = r.bool();
				const side = turn(start.facing, blockLeft ? -1 : 1);
				const [sr, sc] = D[side];
				if (!board.open(start.row + sr, start.col + sc)) continue;
				board.blocked.add(`${start.row + sr},${start.col + sc}`);
				const cmds = (canLeft: boolean): Cmd[] => [canLeft ? "L" : "R", "F", "F"];
				const relLeftOpen = board.open(start.row + D[turn(start.facing, -1)][0], start.col + D[turn(start.facing, -1)][1]);
				const real = board.run(start, cmds(relLeftOpen));
				if (real.blockedAt !== null) continue;
				const screenLeftOpen = board.open(start.row, start.col - 1);
				if (screenLeftOpen === relLeftOpen) continue;
				const absolute = board.run(start, cmds(screenLeftOpen));
				const otherBranch = board.run(start, cmds(!relLeftOpen), { skipBlocked: false });
				const lab = labelled(r, board, start, real.pos, [
					{ pos: absolute.blockedAt === null ? absolute.pos : null, why: `"left" means the robot's own left. Facing ${start.facing}, that isn't the left side of the screen.` },
					{ pos: otherBranch.blockedAt === null ? otherBranch.pos : null, why: "Check which side is open from the robot's point of view — the other branch runs." },
				]);
				const code = L('IF (CAN_MOVE("left"))', "{", "  ROTATE_LEFT()", "}", "ELSE", "{", "  ROTATE_RIGHT()", "}", "MOVE_FORWARD()", "MOVE_FORWARD()");
				return {
					prompt: `${startText(start)} Black squares are blocked. Which square does it end on?`,
					code,
					grid: gridOf(lab.rows, start),
					options: lab.options,
					fixedOrder: true,
					explanation: `Facing ${start.facing}, the robot's left is ${turn(start.facing, -1)} on the screen. That square is ${relLeftOpen ? "open, so it turns left" : "blocked, so it turns right"}, then moves forward twice to ${where(real.pos)} — square ${lab.correctLetter}.`,
					trace: { code, grid: gridOf(lab.rows, start) },
				};
			}
			throw new Error("no route");
		},
	},
	{
		id: "ro-until-wall",
		topic: "robots",
		topics: ["iteration", "boolean"],
		skill: "Repeating until the robot can't move",
		level: "challenging",
		type: "final-state",
		structure: "Two REPEAT UNTIL (NOT CAN_MOVE) loops with a turn between",
		build(r) {
			for (let tries = 0; tries < 400; tries++) {
				const board = new Board();
				const nBlocks = r.int(1, 3);
				for (let b = 0; b < nBlocks; b++) board.blocked.add(`${r.int(0, SIZE - 1)},${r.int(0, SIZE - 1)}`);
				const start = randomStart(r, board);
				const goStraight = (p: Pos) => {
					const q = { ...p };
					let moved = 0;
					while (board.open(q.row + D[q.facing][0], q.col + D[q.facing][1])) {
						q.row += D[q.facing][0];
						q.col += D[q.facing][1];
						moved++;
					}
					return { q, moved };
				};
				const right = r.bool();
				const first = goStraight(start);
				if (first.moved < 2) continue;
				const turned = { ...first.q, facing: turn(first.q.facing, right ? 1 : -1) };
				const second = goStraight(turned);
				if (second.moved < 1) continue;
				const end = second.q;
				const oneShort = { row: end.row - D[end.facing][0], col: end.col - D[end.facing][1] };
				const wrongTurn = goStraight({ ...first.q, facing: turn(first.q.facing, right ? -1 : 1) }).q;
				const lab = labelled(r, board, start, end, [
					{ pos: oneShort, why: "The loop keeps moving while the square ahead is open — it stops right next to the wall or block." },
					{ pos: wrongTurn, why: `It turns ${right ? "right" : "left"} (${right ? "clockwise" : "counterclockwise"}), not the other way.` },
					{ pos: first.q, why: "After turning, the second loop moves the robot again." },
				]);
				const loop = ["REPEAT UNTIL (NOT CAN_MOVE(\"forward\"))", "{", "  MOVE_FORWARD()", "}"];
				const code = L(...loop, right ? "ROTATE_RIGHT()" : "ROTATE_LEFT()", ...loop);
				return {
					prompt: `${startText(start)} Black squares are blocked. Which square does it end on?`,
					code,
					grid: gridOf(lab.rows, start),
					options: lab.options,
					fixedOrder: true,
					explanation: `The first loop moves ${first.moved} squares until something blocks the way, stopping at ${where(first.q)}. After turning ${right ? "right" : "left"}, the second loop moves ${second.moved} more to ${where(end)} — square ${lab.correctLetter}.`,
					trace: { code, grid: gridOf(lab.rows, start) },
				};
			}
			throw new Error("no route");
		},
	},
	{
		id: "ro-choose-code",
		topic: "robots",
		skill: "Choosing code that reaches a target",
		level: "medium",
		type: "choose-code",
		structure: "Choose the code that moves the robot onto a square",
		build(r) {
			for (let tries = 0; tries < 300; tries++) {
				const board = new Board();
				const start = randomStart(r, board);
				const a = r.int(1, 2);
				const t: Cmd = r.pick(["L", "R"]);
				const b = r.int(1, 2);
				const route: Cmd[] = [...Array(a).fill("F"), t, ...Array(b).fill("F")];
				const real = board.run(start, route);
				if (real.blockedAt !== null) continue;
				const wrongTurn: Cmd[] = [...Array(a).fill("F"), t === "L" ? "R" : "L", ...Array(b).fill("F")];
				const short: Cmd[] = [...Array(a).fill("F"), t, ...Array(Math.max(0, b - 1)).fill("F")];
				const turnFirst: Cmd[] = [t, ...Array(a).fill("F"), ...Array(b).fill("F")];
				const ends = [wrongTurn, short, turnFirst].map((c) => board.run(start, c));
				if (ends.some((e) => e.blockedAt === null && key(e.pos) === key(real.pos))) continue;
				const rows = board.rows([["A", real.pos.row, real.pos.col]]);
				const txt = (c: Cmd[]) => c.map(cmdText).join("\n");
				return {
					prompt: `${startText(start)} Which code moves the robot onto square A?`,
					grid: gridOf(rows, start),
					options: options(
						txt(route),
						[
							{ text: txt(wrongTurn), why: "This turns the wrong way — check left and right from the robot's point of view." },
							{ text: txt(short), why: "One move short of A." },
							{ text: txt(turnFirst), why: "Turning first sends every move in the new direction — the order of lines matters." },
						],
						[],
						true,
					),
					explanation: `Facing ${start.facing}, move ${a}, turn ${t === "L" ? "left" : "right"} to face ${turn(start.facing, t === "L" ? -1 : 1)}, then move ${b} to reach A at ${where(real.pos)}.`,
					trace: { code: txt(route), grid: gridOf(rows, start), note: "Tracing the correct code." },
				};
			}
			throw new Error("no route");
		},
	},
];
