// One shared vector renderer for every robot grid (questions and traces), so
// all robot questions look the same: equal square cells, crisp lines, row and
// column numbers, black hatched blocked squares, outlined labelled squares,
// and an arrow-shaped robot whose front is unmistakable.
import type { Grid } from "./core";
import type { RobotState } from "./interpreter";

const CELL = 40;
const PAD = 22; // room for the row/column numbers
const ANGLE = { up: 0, right: 90, down: 180, left: 270 } as const;
// Each SVG gets its own pattern ID: a pattern defined inside a hidden SVG
// can't be used by another one, so shared IDs would break.
let uid = 0;

/** Arrow with a notched back: the point is the front. Drawn facing up, centered on 0,0. */
export const ROBOT_PATH = "M0 -15 L12 12 L0 5 L-12 12 Z";

export function robotSvg(grid: Grid, robot: RobotState = grid.robot, opts: { trail?: { row: number; col: number }[]; crashed?: boolean } = {}): string {
	const rows = grid.rows.length;
	const cols = grid.rows[0].length;
	const w = PAD + cols * CELL + 2;
	const h = PAD + rows * CELL + 2;
	const parts: string[] = [];
	const hatch = `rg-hatch-${++uid}`;
	parts.push(
		`<defs><pattern id="${hatch}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#000"/><line x1="0" y1="0" x2="0" y2="8" stroke="#3b3f4f" stroke-width="3"/></pattern></defs>`,
	);
	for (let c = 0; c < cols; c++) parts.push(`<text class="rg-num" x="${PAD + c * CELL + CELL / 2}" y="${PAD - 7}">${c + 1}</text>`);
	for (let r = 0; r < rows; r++) parts.push(`<text class="rg-num" x="${PAD / 2}" y="${PAD + r * CELL + CELL / 2 + 4}">${r + 1}</text>`);
	const trail = new Set((opts.trail ?? []).map((p) => `${p.row},${p.col}`));
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const ch = grid.rows[r][c];
			const x = PAD + c * CELL;
			const y = PAD + r * CELL;
			if (ch === "#") {
				parts.push(`<rect class="rg-blocked" x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="url(#${hatch})"/>`);
				continue;
			}
			parts.push(`<rect class="rg-open${trail.has(`${r},${c}`) ? " rg-trail" : ""}" x="${x}" y="${y}" width="${CELL}" height="${CELL}"/>`);
			if (/[A-D]/.test(ch)) {
				const here = robot.row === r && robot.col === c;
				parts.push(`<rect class="rg-target" x="${x + 4}" y="${y + 4}" width="${CELL - 8}" height="${CELL - 8}" rx="5"/>`);
				parts.push(here ? `<text class="rg-letter rg-letter--small" x="${x + 4}" y="${y + 12}">${ch}</text>` : `<text class="rg-letter" x="${x + CELL / 2}" y="${y + CELL / 2 + 6}">${ch}</text>`);
			}
		}
	}
	// Grid lines on top so every cell edge is crisp and equal.
	for (let r = 0; r <= rows; r++) parts.push(`<line class="rg-line" x1="${PAD}" y1="${PAD + r * CELL}" x2="${PAD + cols * CELL}" y2="${PAD + r * CELL}"/>`);
	for (let c = 0; c <= cols; c++) parts.push(`<line class="rg-line" x1="${PAD + c * CELL}" y1="${PAD}" x2="${PAD + c * CELL}" y2="${PAD + rows * CELL}"/>`);
	const cx = PAD + robot.col * CELL + CELL / 2;
	const cy = PAD + robot.row * CELL + CELL / 2;
	// On a labeled square the robot shrinks a little so the letter stays readable in the corner.
	const onLabel = /[A-D]/.test(grid.rows[robot.row]?.[robot.col] ?? "");
	parts.push(`<g class="rg-robot${opts.crashed ? " rg-robot--stopped" : ""}" transform="translate(${cx} ${cy}) rotate(${ANGLE[robot.facing]})${onLabel ? " scale(0.75)" : ""}"><path d="${ROBOT_PATH}"/><circle cx="0" cy="-6" r="2.2"/></g>`);
	return `<svg class="rg" style="--rg-cols:${cols}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${describeGrid(grid, robot).replace(/"/g, "&quot;")}" preserveAspectRatio="xMidYMid meet">${parts.join("")}</svg>`;
}

const pos = (r: number, c: number) => `row ${r + 1}, column ${c + 1}`;

/** Text description of a grid and the robot's position — never the answer. */
export function describeGrid(grid: Grid, robot: RobotState = grid.robot): string {
	const rows = grid.rows.length;
	const cols = grid.rows[0].length;
	const blocked: string[] = [];
	const labels: string[] = [];
	grid.rows.forEach((row, r) =>
		[...row].forEach((ch, c) => {
			if (ch === "#") blocked.push(pos(r, c));
			if (/[A-D]/.test(ch)) labels.push(`${ch} at ${pos(r, c)}`);
		}),
	);
	return (
		`A ${rows} by ${cols} grid. Rows are numbered from the top, columns from the left. ` +
		`The robot is at ${pos(robot.row, robot.col)}, facing ${robot.facing}.` +
		(blocked.length ? ` Blocked squares: ${blocked.join("; ")}.` : " No squares are blocked.") +
		(labels.length ? ` Labeled squares: ${labels.join("; ")}.` : "")
	);
}

/** Small legend icons (inline SVG) for the key under each grid. */
export const LEGEND_ROBOT = `<svg viewBox="-16 -16 32 32" class="rg-key" aria-hidden="true"><rect x="-16" y="-16" width="32" height="32" class="rg-open"/><g class="rg-robot"><path d="${ROBOT_PATH}"/><circle cx="0" cy="-6" r="2.2"/></g></svg>`;
export const LEGEND_BLOCKED = `<svg viewBox="0 0 32 32" class="rg-key" aria-hidden="true"><defs><pattern id="rg-hatch-k" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#000"/><line x1="0" y1="0" x2="0" y2="8" stroke="#3b3f4f" stroke-width="3"/></pattern></defs><rect width="32" height="32" fill="url(#rg-hatch-k)"/></svg>`;
export const LEGEND_TARGET = `<svg viewBox="0 0 32 32" class="rg-key" aria-hidden="true"><rect width="32" height="32" class="rg-open"/><rect x="3" y="3" width="26" height="26" rx="4" class="rg-target"/><text class="rg-letter" x="16" y="21.5" style="font-size:14px">A</text></svg>`;
