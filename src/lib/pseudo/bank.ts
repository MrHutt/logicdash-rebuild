// The question bank: parameterised templates plus the original fixed
// questions (kept, with corrected topic tags and a question type).
import { PSEUDO_QUESTIONS, type PseudoQuestion } from "../pseudocodeQuestions";
import { Rng, TOPIC_LABELS, TYPE_LABELS, type Level, type Option, type QType, type Question, type Template, type Topic } from "./core";
import { ARITHMETIC_TEMPLATES, BOOLEAN_TEMPLATES, SELECTION_TEMPLATES, VARIABLE_TEMPLATES } from "./templates1";
import { ITERATION_TEMPLATES, LIST_TEMPLATES, PROCEDURE_TEMPLATES } from "./templates2";
import { ROBOT_TEMPLATES } from "./templates3";

export const TEMPLATES: Template[] = [
	...VARIABLE_TEMPLATES,
	...ARITHMETIC_TEMPLATES,
	...BOOLEAN_TEMPLATES,
	...SELECTION_TEMPLATES,
	...ITERATION_TEMPLATES,
	...LIST_TEMPLATES,
	...PROCEDURE_TEMPLATES,
	...ROBOT_TEMPLATES,
];
const TEMPLATE_BY_ID = new Map(TEMPLATES.map((t) => [t.id, t]));

// ---------------------------------------------------------------------------
// Generated questions

/** Checks the rules every question must meet. Throws on failure. */
export function validate(q: Pick<Question, "options" | "explanation" | "prompt">) {
	if (q.options.length !== 4) throw new Error("needs exactly 4 options");
	if (new Set(q.options.map((o) => o.text)).size !== 4) throw new Error("options must be distinct");
	if (q.options.filter((o) => o.correct).length !== 1) throw new Error("needs exactly one correct option");
	if (!q.explanation || !q.prompt) throw new Error("missing prompt or explanation");
}

/**
 * Builds a template question from a seed. Same template + seed → same
 * question. If a seed can't make a valid question (e.g. two options came out
 * equal), the next seed is tried, and the ID records the seed actually used.
 */
export function generate(templateId: string, seed: number): Question {
	const t = TEMPLATE_BY_ID.get(templateId);
	if (!t) throw new Error(`Unknown template ${templateId}`);
	for (let k = 0; k < 50; k++) {
		const s = (seed + k * 7919) >>> 0;
		try {
			const body = t.build(new Rng(s));
			validate(body);
			return {
				...body,
				id: `${t.id}#${s}`,
				source: t.id,
				group: t.id,
				seed: s,
				topic: t.topic,
				topics: [t.topic, ...(t.topics ?? [])],
				skill: t.skill,
				level: t.level,
				type: t.type,
			};
		} catch {
			// try the next seed
		}
	}
	throw new Error(`Template ${templateId} could not build a valid question`);
}

/** Rebuilds any question from its ID (template "id#seed" or a fixed ID). */
export function questionById(id: string): Question | null {
	const hash = id.indexOf("#");
	if (hash > 0) {
		try {
			return generate(id.slice(0, hash), Number(id.slice(hash + 1)));
		} catch {
			return null;
		}
	}
	return FIXED_BY_ID.get(id) ?? null;
}

// ---------------------------------------------------------------------------
// Fixed questions: the original bank, adapted

const CATEGORY_TOPIC: Record<string, Topic> = {
	"Variables & display": "variables",
	"Arithmetic & MOD": "arithmetic",
	"Boolean logic": "boolean",
	Selection: "selection",
	Iteration: "iteration",
	Lists: "lists",
	Procedures: "procedures",
	Robot: "robots",
};

/** Topics the code actually uses — fixes the original bank's missing tags. */
function derivedTopics(q: PseudoQuestion): Topic[] {
	const code = (q.code ?? "").replace(/"[^"]*"/g, "");
	const out: Topic[] = [];
	if (/FOR EACH|REPEAT/.test(code)) out.push("iteration");
	if (/\[|LENGTH|APPEND|INSERT|REMOVE/.test(code)) out.push("lists");
	if (/PROCEDURE/.test(code)) out.push("procedures");
	if (/^\s*IF/m.test(code)) out.push("selection");
	if (/MOD/.test(code)) out.push("arithmetic");
	if (/ AND | OR |NOT /.test(code)) out.push("boolean");
	if (q.grid) out.push("robots");
	return out;
}

function fixedType(q: PseudoQuestion): QType {
	const p = q.prompt;
	const code = q.code ?? "";
	if (!q.code) return "concept";
	if (q.verify === "square" || q.verify === "facing" || q.grid) return "final-state";
	if (/<MISSING CODE>/.test(code + p)) return "missing";
	if (/^(Segment|Version) /m.test(code)) return "compare";
	if (/meant to|bug/i.test(p)) return "bug-input";
	if (/What happens/.test(p)) return "error";
	if (/^Which (expression|condition)/.test(p) || /always gives the same/.test(p)) return "choose-code";
	if (/For which value/.test(p)) return "input";
	return "output";
}

/** Same code shape with only names and numbers changed → same group. */
function shape(q: PseudoQuestion): string {
	if (!q.code) return `fixed:${q.id}`;
	return (
		"shape:" +
		q.code
			.replace(/"[^"]*"/g, "S")
			.replace(/\b\d+(\.\d+)?\b/g, "N")
			.replace(/\b(?!IF|ELSE|REPEAT|TIMES|UNTIL|FOR|EACH|IN|PROCEDURE|RETURN|DISPLAY|MOD|AND|OR|NOT|LENGTH|APPEND|INSERT|REMOVE|MOVE_FORWARD|ROTATE_LEFT|ROTATE_RIGHT|CAN_MOVE|RANDOM|INPUT|true|false)[a-zA-Z_]\w*\b/g, "v")
			.replace(/\s+/g, " ")
	);
}

function adaptFixed(q: PseudoQuestion): Question {
	const topic = CATEGORY_TOPIC[q.topics[0]];
	const tagged = q.topics.map((t) => CATEGORY_TOPIC[t]);
	const topics = [...new Set([topic, ...tagged, ...derivedTopics(q)])];
	const type = fixedType(q);
	const runnable = !!q.code && q.verify !== "manual" && !/<MISSING CODE>|^(Segment|Version) /m.test(q.code);
	const options: Option[] = q.options.map((text, i) => ({ text, correct: i === q.answer }));
	return {
		id: q.id,
		source: q.id,
		group: shape(q),
		seed: null,
		topic,
		topics,
		skill: `${TOPIC_LABELS[topic]}: ${TYPE_LABELS[type].toLowerCase()}`,
		level: q.level as Level,
		type,
		prompt: q.prompt,
		code: q.code,
		grid: q.grid ? { rows: q.grid.rows, robot: { ...q.grid.robot } } : undefined,
		options,
		explanation: q.explanation,
		trace: runnable ? { code: q.code!, grid: q.grid ? { rows: q.grid.rows, robot: { ...q.grid.robot } } : undefined, inputs: ["Sam"] } : null,
	};
}

export const FIXED: Question[] = PSEUDO_QUESTIONS.map(adaptFixed);
const FIXED_BY_ID = new Map(FIXED.map((q) => [q.id, q]));
