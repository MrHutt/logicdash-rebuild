import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const html = await readFile(new URL("../public/circuit-dash/index.html", import.meta.url), "utf8");
const start = html.indexOf("const gateRules =");
const end = html.indexOf("const allStages =", start);
assert.ok(start >= 0 && end > start, "Could not locate circuit puzzle definitions");
const source = html.slice(start, end);
const { nightShift, powerFailure, gateRules } = vm.runInNewContext(
  source + "\n({nightShift,powerFailure,gateRules})",
  {},
  { timeout: 2000 }
);

function actualValues(stage, mask, wiring) {
  const ids = Object.keys(stage.inputs);
  const values = Object.fromEntries(ids.map((id,i) => [id, (mask >> (ids.length-i-1)) & 1]));
  const evaluating = new Set();
  function value(id) {
    if (id == null) return null;
    if (Object.hasOwn(values,id)) return values[id];
    assert.ok(gateRules[id], `Unknown gate/source: ${id}`);
    assert.ok(!evaluating.has(id), `Cyclic repair wiring at ${id}`);
    evaluating.add(id);
    const [a,b] = gateRules[id].pins.map(pin => value(wiring[pin]));
    evaluating.delete(id);
    return values[id] = a === null || b === null ? null : gateRules[id].apply(a,b);
  }
  for (const lamp of Object.keys(stage.lamps)) values[lamp] = value(wiring[lamp]);
  return values;
}

function allPass(stage, wires) {
  const cases = 2 ** Object.keys(stage.inputs).length;
  for (let mask=0; mask<cases; mask++) {
    const actual = actualValues(stage,mask,wires);
    const expected = stage.target(actual);
    for (const lamp of Object.keys(stage.lamps)) {
      if (actual[lamp] !== expected[lamp]) return false;
    }
  }
  return true;
}

test("every repair mission has three-stage hint data and a valid complete repair", () => {
  assert.equal(nightShift.length,3);
  assert.equal(powerFailure.length,3);
  for (const stage of [...nightShift,...powerFailure]) {
    assert.ok(stage.repair, `${stage.title} is not a repair level`);
    assert.ok(stage.hintFocus && typeof stage.hintFocus === "string", `${stage.title} has no gate hint`);
    assert.equal(stage.hintRepair?.length,stage.moves ?? 1,`${stage.title} hint count must match move budget`);
    assert.equal(allPass(stage,stage.wiring),false,`${stage.title} starts already solved`);
    const fixed = {...stage.wiring};
    for (const [from,to] of stage.hintRepair) {
      assert.ok(to in fixed,`${stage.title}: unknown socket ${to}`);
      assert.ok(from in stage.inputs || stage.gates.includes(from),`${stage.title}: unknown OUT ${from}`);
      fixed[to] = from;
    }
    assert.equal(allPass(stage,fixed),true,`${stage.title}: disclosed repair must pass all cases`);
  }
});

test("two-wire missions cannot be solved with a single changed socket", () => {
  for (const stage of powerFailure.filter(stage => stage.moves === 2)) {
    const sources = [...Object.keys(stage.inputs),...stage.gates];
    for (const dest of Object.keys(stage.wiring)) {
      for (const source of sources) {
        if (stage.wiring[dest] === source) continue;
        try {
          const candidate = {...stage.wiring,[dest]:source};
          assert.equal(allPass(stage,candidate),false,`${stage.title} solvable by only ${source}->${dest}`);
        } catch (err) {
          if (String(err.message).includes("Cyclic repair wiring")) continue;
          throw err;
        }
      }
    }
  }
});

test("Trace Mode follows only existing connections without altering the circuit", () => {
  const traceStart = html.indexOf("function tracedSockets()");
  const traceEnd = html.indexOf("function traceMessage(", traceStart);
  assert.ok(traceStart > 0 && traceEnd > traceStart, "Missing trace path implementation");
  const traceFunction = html.slice(traceStart,traceEnd);
  const stage = nightShift[0];
  const wiringBefore = JSON.stringify(stage.wiring);
  const trace = (traceTarget) => {
    const result = vm.runInNewContext(
      traceFunction + "\ntracedSockets()",
      {tracing:true,traceTarget,stage,wires:stage.wiring,gateRules},
      {timeout:2000}
    );
    return [...result].sort();
  };
  assert.deepEqual(trace("window"),["entry","or2"].sort(),
    "Window path should show its live connections, not suggest the missing repair");
  assert.deepEqual(trace("alarm"),["alarm","and1","and2"].sort(),
    "Alarm trace should follow both wired inputs of AND");
  assert.deepEqual(trace("or"),["entry","or1","or2"].sort(),
    "OR trace should include its two inputs and live output");
  assert.equal(JSON.stringify(stage.wiring),wiringBefore,"Trace Mode must not change wiring");
});
