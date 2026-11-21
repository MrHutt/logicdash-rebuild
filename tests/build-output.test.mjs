import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../dist/", import.meta.url);

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

test("the essential site pages are present in the production build", async () => {
  for (const path of [
    "index.html",
    "404.html",
    "5-bit/index.html",
    "overclocked/index.html",
    "quick-byte/index.html",
    "circuit-dash/index.html",
    "how-to-play/index.html",
    "learn/index.html",
    "tools/index.html",
    "tools/countdown-clock/index.html",
  ]) {
    assert.ok((await stat(new URL(path, root))).isFile(), `Missing ${path}`);
  }
});

test("the homepage and all three game pages render identifiable content", async () => {
  for (const [path, expected] of [
    ["index.html", /Quick\s*(?:<[^>]+>\s*)*Byte/i],
    ["5-bit/index.html", /Classic/i],
    ["overclocked/index.html", /OverClocked/i],
    ["quick-byte/index.html", /Quick\s*Byte/i],
  ]) {
    assert.match(await text(path), expected, `Page has unexpected content: ${path}`);
  }
});

test("Circuit Dash includes the tutorial progression and Night Shift repair challenge", async () => {
  const circuit = await text("circuit-dash/index.html");
  for (const phrase of ["Follow the signal", "Wire a switch", "The AND gate", "The OR gate", "The XOR gate", "Fix a fault", "Entry alarm", "Sensor check", "Backup relay", "Night Shift"]) {
    assert.ok(circuit.includes(phrase), `Missing circuit level: ${phrase}`);
  }
  assert.match(circuit, /testCases\(wires\)/, "Missing repair case checker");
});


test("Circuit Dash is one 16-level campaign with three scenarios", async () => {
  const circuit = await text("circuit-dash/index.html");
  const home = await text("index.html");
  assert.match(circuit,/const allStages = \[\.\.\.stages,\.\.\.nightShift,\.\.\.powerFailure\]/);
  for(const word of ["SCENARIO A / APPRENTICE SHIFT","SCENARIO B / NIGHT SHIFT","SCENARIO C / POWER FAILURE","Entry alarm","Sensor check","Backup relay","Emergency lighting","Lift interlock","Control room","Follow the signal","Fix a fault"]) {
    assert.ok(circuit.includes(word), "Missing campaign feature: "+word);
  }
  for(const id of ["campaign-overview","campaign-map","apprentice-complete","night-opening","night-complete","power-opening","campaign-complete"]) {
    assert.match(circuit,new RegExp('id="'+id+'"'));
  }
  assert.match(home,/16-LEVEL STORY PUZZLE/);
  assert.match(home,/Open Circuit Dash mission map/);
  assert.doesNotMatch(home,/Circuit Dash \+ Night Shift/);
});

test("All 16 levels appear on the map and the persistent navigation", async () => {
  const circuit = await text("circuit-dash/index.html");
  for (const line of ["function levelCompleted(index)","function nextCampaignLevel()","get('levels').innerHTML = groups.map","get('campaign-map').innerHTML = groups.map","levelButton(level,group.start+index)","if (canEnter(index)) openLevel(index)"]) {
    assert.ok(circuit.includes(line), "Missing unified navigation: "+line);
  }
  assert.match(circuit,/min-height:44px/);
  assert.match(circuit,/return index <= unlocked/);
  assert.match(circuit,/return nightUnlocked >= nightShift\.length && index <= powerStart \+ powerUnlocked/);
});

test("Routing has stable chapter destinations and allows replay of completed levels", async () => {
  const circuit = await text("circuit-dash/index.html");
  const start = circuit.indexOf("function completedCount()");
  const end = circuit.indexOf("function begin(index)",start);
  assert.ok(start>=0 && end>start,"Missing route implementation");
  const code = circuit.slice(start,end);
  const {runInNewContext} = await import("node:vm");
  function route(hash,progress) {
    const [unlocked,nightUnlocked,powerUnlocked] = progress;
    const ctx = {
      unlocked,nightUnlocked,powerUnlocked,
      stages:{length:10},nightShift:{length:3},powerFailure:{length:3},
      allStages:Array(16).fill(null),challengeStep:10,powerStart:13,lastStep:9,lastChallenge:12,lastPower:15,
      location:{hash},get:()=>({hidden:true,textContent:""}),
      canEnter:index=>index>=0&&index<=15&&(index<10?index<=unlocked:index<13?
        unlocked===10&&index<=10+nightUnlocked:unlocked===10&&nightUnlocked===3&&index<=13+powerUnlocked),
      challengeHash:index=>index>=13?"#power-failure-"+(index-12):"#night-shift-"+(index-9)
    };
    return runInNewContext(code+"\nrouteStep()",ctx,{timeout:2000});
  }
  assert.equal(route("#overview",[0,0,0]),0);
  assert.equal(route("#overview",[10,2,0]),12);
  assert.equal(route("#overview",[10,3,3]),15);
  assert.equal(route("#apprentice",[10,3,3]),0);
  assert.equal(route("#level-2",[10,3,3]),1);
  assert.equal(route("#level-11",[10,3,3]),10);
  assert.equal(route("#level-14",[10,3,3]),13);
  assert.equal(route("#night-shift",[10,3,3]),12);
  assert.equal(route("#power-failure",[10,3,3]),15);
  assert.equal(route("#night-shift",[9,0,0]),9);
  assert.equal(route("#level-16",[10,3,1]),14);
  assert.equal(route("#mission-complete",[10,3,3]),15);
});

test("Story checkpoints occur at levels 10, 13 and 16", async () => {
  const circuit = await text("circuit-dash/index.html");
  assert.match(circuit,/step === lastStep && unlocked === stages\.length[\s\S]*?location\.hash = '#apprentice-complete'/);
  assert.match(circuit,/step === lastChallenge && nightUnlocked === nightShift\.length[\s\S]*?location\.hash = '#night-shift-complete'/);
  assert.match(circuit,/step === lastPower && powerUnlocked === powerFailure\.length[\s\S]*?location\.hash = '#mission-complete'/);
  for (const phrase of ["You've been promoted… sort of","Accept your first Night Shift","Continue to Power Failure","Six faults found, six systems checked","16 / 16"]) {
    assert.ok(circuit.includes(phrase),"Missing checkpoint content: "+phrase);
  }
  for(const bits of ["001","010","011","100","101","110"]) assert.ok(circuit.includes("<span>"+bits+" <b>PASS</b>"));
});

test("Campaign retains its game mechanics, responsive layout and safe reset", async () => {
  const circuit = await text("circuit-dash/index.html");
  for(const phrase of ["function tracedSockets()","testCases(wires)","powerProgressKey","max-width:1280px","green=1, grey=0, amber=selection","Progress &amp; settings"]) {
    assert.ok(circuit.includes(phrase),"Missing baseline feature: "+phrase);
  }
  assert.match(circuit,/<header class="site-header">/);
  assert.match(circuit,/<footer class="site-footer">/);
  assert.match(circuit,/trace-description[^}]*height:4\.35em/);
  assert.match(circuit,/window\.confirm\('Reset ALL Circuit Dash training/);
  assert.match(circuit,/<svg viewBox="0 0 48 48"/);
});

test("Game view uses a lightweight progress strip and puts the full mission navigator below the circuit", async () => {
  const circuit = await text("circuit-dash/index.html");
  assert.match(circuit,/id="compact-progress"/, "Game needs compact progress");
  assert.match(circuit,/id="progress-track"/, "Sixteen numbered progress indicators missing");
  assert.match(circuit,/grid-template-columns:repeat\(16,minmax\(0,1fr\)\)/, "Desktop progress should be one row");
  assert.match(circuit,/grid-template-columns:repeat\(8,minmax\(0,1fr\)\)/, "Mobile progress should have short rows");
  assert.match(circuit,/<details class="level-review" id="level-review" hidden>/, "Review navigation should be collapsed by default");
  assert.ok(circuit.indexOf('id="level-review"') > circuit.indexOf('id="play"'), "Detailed navigation must follow circuit board");
  assert.ok(circuit.indexOf('id="compact-progress"') < circuit.indexOf('id="play"'), "Progress strip should precede circuit board");
  assert.match(circuit,/get\('level-review'\)\.hidden = showingIntro/);
  assert.match(circuit,/get\('progress-track'\)\.innerHTML = allStages\.map/);
});

test("built CSS/JavaScript files are generated", async () => {
  const entries = await readdir(new URL("_astro/", root));
  assert.ok(entries.some((name) => name.endsWith(".css")), "Missing built CSS");
  assert.ok(entries.some((name) => name.endsWith(".js")), "Missing built JavaScript");
});

test("SiteGround .htaccess contains case-insensitive lesson redirects and 404 handling", async () => {
  const htaccess = await text(".htaccess");
  assert.match(htaccess, /RewriteEngine On/);
  assert.match(htaccess, /RewriteRule\s+\^\(1A2\)\/\?\$\s+\/learn\/what-is-binary\/\s+\[NC,R=302,L\]/);
  assert.match(htaccess, /ErrorDocument 404 \/404\.html/);
  assert.match(htaccess, /END LogicDash lesson codes/);
});

test("SiteGround artifact has a root-level homepage and redirects", async () => {
  const index = await text("index.html");
  assert.match(index, /<html/i);
  const htaccess = await text(".htaccess");
  assert.ok(htaccess.trim().length > 100);
});
