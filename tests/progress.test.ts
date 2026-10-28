// Run with: npm run test:pseudo (runs after the engine tests)
import { loadState, freshState, pickNext, recordAnswer, readiness, checkpoint, checkpointDue, closeCheckpoint, levelSuggestion, dismissAdvice, topicProgress, poolSize, RULES, type Settings, type State } from "../src/lib/pseudo/progress";
import { TOPICS, LEVELS, type Question } from "../src/lib/pseudo/core";

let failures = 0;
const check = (name: string, cond: boolean, detail = "") => {
	if (!cond) {
		failures++;
		console.log("FAIL", name, detail);
	}
};
let seed = 12345;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);

// 1. Migration from the old (version 2) save format
const v2 = { version: 2, progress: { "mod-1": { weight: 1, dueIn: 2 }, "var-1": { weight: 0.2, dueIn: null } }, streak: 3, best: 7, answered: 40, recent: [], categories: ["Lists"], level: "medium", bestByLevel: { easy: 7 } };
const m = loadState(JSON.parse(JSON.stringify(v2)))!;
check("v2 migrates", !!m && m.version === 3);
check("v2 keeps streak and bests", m.streak === 3 && m.best === 7 && m.bestByLevel.easy === 7);
check("v2 keeps answered count", m.legacyAnswered === 40);
check("v2 single topic becomes topic route", m.settings?.route === "topic" && m.settings.topic === "lists" && m.settings.level === "medium");
check("v2 waiting question becomes a review item", m.review.length === 1 && m.review[0].failedId === "mod-1", JSON.stringify(m.review));
check("garbage is rejected", loadState("nope") === null && loadState({ version: 9 }) === null && loadState(null) === null);
const roundTrip = loadState(JSON.parse(JSON.stringify(m)))!;
check("v3 survives a save/load", JSON.stringify(roundTrip.review) === JSON.stringify(m.review) && roundTrip.settings?.topic === "lists");

// 2. Every topic × level can be practiced
for (const topic of TOPICS) for (const level of LEVELS) check(`pool ${topic}/${level}`, poolSize({ route: "topic", topic, level }) >= 3, String(poolSize({ route: "topic", topic, level })));

// 3. No back-to-back repeats of a structure; a mistake comes back as a different example of the same skill
for (const level of LEVELS) {
	for (const route of ["mixed", "topic"] as const) {
		for (const topic of route === "topic" ? TOPICS : (["variables"] as const)) {
			const s: Settings = { route, topic, level };
			let st = freshState();
			let prev = "";
			let repeats = 0;
			for (let i = 0; i < 60; i++) {
				const p = pickNext(st, s, rand);
				if (p.question.group === prev && poolSize(s) > 1) repeats++;
				prev = p.question.group;
				st = recordAnswer(st, p.question, rand() < 0.7, p.review, rand);
			}
			check(`no back-to-back structure ${route}/${topic}/${level}`, repeats === 0, `${repeats} repeats`);
		}
	}
}
{
	const s: Settings = { route: "mixed", topic: "variables", level: "easy" };
	let st = freshState();
	const first = pickNext(st, s, rand).question;
	st = recordAnswer(st, first, false, null, rand);
	let came: Question | null = null;
	let gap = 0;
	let reviewItem = null;
	for (let i = 0; i < 6 && !came; i++) {
		const p = pickNext(st, s, rand);
		if (p.review) {
			came = p.question;
			reviewItem = p.review;
		} else {
			gap++;
			st = recordAnswer(st, p.question, true, null, rand);
		}
	}
	check("missed skill returns", !!came);
	check("…after 2–3 other questions", gap >= RULES.reviewGapMin && gap <= RULES.reviewGapMin + RULES.reviewGapSpread, `gap ${gap}`);
	check("…as a different example of the same skill", !!came && came.id !== first.id && came.skill === first.skill, `${first.id} → ${came?.id}`);
	st = recordAnswer(st, came!, true, reviewItem, rand);
	check("a correct review clears it", st.review.length === 0);
	check("review re-asks are flagged", st.attempts[st.attempts.length - 1].review === true);
}

// 4. Readiness rule
const fake = (i: number, group: string, correct: boolean, review = false) => ({ id: `${group}#${i}`, source: group, group, topics: ["lists"] as any, topic: "lists" as const, skill: group, level: "easy" as const, type: "output" as const, correct, review, t: i });
const withAttempts = (a: ReturnType<typeof fake>[]): State => ({ ...freshState(), attempts: a });
check("ready: 8/10 across 3 structures", readiness(withAttempts(Array.from({ length: 10 }, (_, i) => fake(i, ["a", "b", "c"][i % 3], i >= 2))), "easy").ready);
check("not ready: only 2 structures", !readiness(withAttempts(Array.from({ length: 10 }, (_, i) => fake(i, ["a", "b"][i % 2], true))), "easy").ready);
check("not ready: 7/10", !readiness(withAttempts(Array.from({ length: 10 }, (_, i) => fake(i, ["a", "b", "c"][i % 3], i >= 3))), "easy").ready);
check("not ready: fewer than 10", !readiness(withAttempts(Array.from({ length: 9 }, (_, i) => fake(i, ["a", "b", "c"][i % 3], true))), "easy").ready);
check(
	"review re-asks don't count",
	!readiness(withAttempts([...Array.from({ length: 9 }, (_, i) => fake(i, ["a", "b", "c"][i % 3], true)), fake(9, "c", true, true)]), "easy").ready,
);
const readyState = withAttempts(Array.from({ length: 10 }, (_, i) => fake(i, ["a", "b", "c"][i % 3], true)));
const sug = levelSuggestion(readyState, { route: "topic", topic: "lists", level: "easy" });
check("suggests Medium when ready", sug?.kind === "up" && sug.to === "medium");
check("dismissing hides it for 10 questions", levelSuggestion(dismissAdvice(readyState), { route: "topic", topic: "lists", level: "easy" }) === null);
const struggle = withAttempts(Array.from({ length: 10 }, (_, i) => ({ ...fake(i, ["a", "b", "c"][i % 3], i < 2), level: "medium" as const })));
check("suggests easier when struggling", levelSuggestion(struggle, { route: "mixed", topic: "lists", level: "medium" })?.kind === "down");
check("no suggestion with no history", levelSuggestion(freshState(), { route: "mixed", topic: "lists", level: "easy" }) === null);

// 5. Checkpoints and topic states
check("checkpoint after 10", checkpointDue(readyState) && !checkpointDue(closeCheckpoint(readyState)));
const cp = checkpoint(withAttempts(Array.from({ length: 10 }, (_, i) => fake(i, ["a", "b", "c"][i % 3], i !== 4))), { route: "mixed", topic: "lists", level: "easy" });
check("checkpoint counts first tries", cp.total === 10 && cp.correct === 9 && cp.trickySkills.length === 1);
check("empty topic is 'not practiced'", topicProgress(freshState(), "robots").state === "not-practised");
check("ready topic shows ready", topicProgress(readyState, "lists").state === "ready");
check("checkpoint works with an empty review queue", checkpoint(readyState, { route: "topic", topic: "lists", level: "easy" }).recommendation.action === "level-up");

console.log(failures ? `progress: ${failures} FAILURES` : "progress: ALL PASSED");
process.exit(failures ? 1 : 0);
