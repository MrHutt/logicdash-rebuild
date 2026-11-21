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

test("Power Failure includes three missions, chapter unlocks, and configurable move limits", async () => {
  const circuit = await text("circuit-dash/index.html");
  for (const phrase of ["Emergency lighting", "Lift interlock", "Control room", "POWER FAILURE", "powerProgressKey", "const powerStart", "movesUsed()", "canRewire()"]) {
    assert.ok(circuit.includes(phrase), `Missing Power Failure mechanic: ${phrase}`);
  }
  assert.match(circuit, /nightUnlocked < nightShift\.length/, "Power Failure should remain locked before Night Shift completion");
  assert.match(circuit, /step === lastChallenge/, "Night Shift must end with the next-chapter action");
});

test("Circuit Dash retains all original levels and adds six story briefings", async () => {
  const circuit = await text("circuit-dash/index.html");
  for (const phrase of [
    "Follow the signal", "Fix a fault", "Entry alarm", "Sensor check", "Backup relay",
    "Emergency lighting", "Lift interlock", "Control room",
    "23:42 · SECURITY DESK", "02:48 · CONTROL ROOM",
    "Training complete", "Night Shift — systems restored", "Power Failure — building back online",
  ]) {
    assert.ok(circuit.includes(phrase), `Missing story or original level: ${phrase}`);
  }
  assert.match(circuit, /id="story"/, "Missing inline story briefing");
  assert.match(circuit, /min-width:44px/, "Missing improved mobile navigation touch targets");
});

test("Repair chapter colours distinguish blue Night Shift and green Power Failure without recolouring signals", async () => {
  const circuit = await text("circuit-dash/index.html");
  for (const chapter of ["night", "power"]) {
    assert.ok(circuit.includes(`data-repair-chapter="${chapter}"`), `Missing ${chapter} theme`);
  }
  assert.match(circuit, /document\.body\.dataset\.repairChapter/, "Missing chapter theme selection");
  assert.match(circuit, /green=1, grey=0, amber=selection/, "Signal colours must stay consistent");
});

test("Circuit Dash repair navigation is continuous and grouped, and tracing has stable height", async () => {
  const circuit = await text("circuit-dash/index.html");
  for (const phrase of ["Night Shift · 1–3", "Power Failure · 4–6", "campaign-nav", "mission-numbers", "repairNumber"]) {
    assert.ok(circuit.includes(phrase), `Missing repair navigation: ${phrase}`);
  }
  assert.match(circuit, /trace-description[^}]*height:4\.35em/, "Desktop trace panel must reserve steady height");
  assert.match(circuit, /trace-description\{height:5\.8em\}/, "Mobile trace panel must reserve steady height");
});

test("Circuit Dash resumes current repair, shows completion ticks and uses the homepage frame width", async () => {
  const circuit = await text("circuit-dash/index.html");
  const home = await text("index.html");
  assert.match(circuit,/max-width:1280px/, "Game should match homepage wide container");
  assert.match(circuit,/if \(!hash \|\| hash === '#course' \|\| hash === '#training'\) return Math\.min\(unlocked,lastStep\)/, "Circuit Dash opens the course, not Night Shift");
  assert.match(circuit,/if \(unlocked >= stages\.length\) return challengeStep \+ Math\.min\(nightUnlocked,nightShift\.length-1\)/, "Night Shift introduction must resume unfinished repairs");
  assert.match(circuit,/<span aria-hidden="true">✓<\/span>/, "Completed steps need ticks");
  assert.match(circuit,/body\[data-repair-chapter\] \.story\{height:/, "Briefing should reserve stable space");
  assert.match(home,/href="\/circuit-dash\/"/, "Homepage must link Circuit Dash");
  assert.match(home,/href="\/circuit-dash\/#night-shift"/, "Homepage must link Night Shift");
});

test("Circuit Dash and Night Shift have separate entry routes and a dedicated story introduction", async () => {
  const circuit = await text("circuit-dash/index.html");
  const home = await text("index.html");
  assert.match(circuit,/if \(!hash \|\| hash === '#course' \|\| hash === '#training'\) return Math\.min\(unlocked,lastStep\)/, "Circuit Dash must stay on its training path");
  assert.match(circuit,/if \(hash === '#night-shift'\)/, "Night Shift must have an independent entry route");
  assert.match(circuit,/id="night-opening"/, "Missing Night Shift introduction");
  assert.match(circuit,/id="night-begin"/, "Missing story CTA");
  assert.match(circuit,/nightIntroOpen = location\.hash === '#night-shift'/, "Story must open on the Night Shift link");
  assert.match(circuit,/return '#night-shift-' \+ level/, "Mission deep links must differ from the story entry");
  assert.match(home,/href="\/circuit-dash\/#night-shift"/, "Homepage Night Shift link should open the story");
});

test("Power Failure has a story introduction and separate direct repair routes", async () => {
  const circuit = await text("circuit-dash/index.html");
  assert.match(circuit,/id="power-opening"/, "Power Failure intro is missing");
  assert.match(circuit,/id="power-begin"/, "Power Failure begin button is missing");
  assert.match(circuit,/if \(hash === '#power-failure'\)/, "Power Failure chapter entry is missing");
  assert.match(circuit,/return '#power-failure-' \+ chapterLevel/, "Individual repair routes must not conflict with intro");
  assert.match(circuit,/powerIntroOpen = location\.hash === '#power-failure'/, "Power Failure link must show introduction");
  assert.match(circuit,/id="night-finish"/, "Night Shift must link to the new chapter");
  assert.match(circuit,/Read the Power Failure briefing/, "Night Shift handover must introduce story");
  assert.match(circuit,/nightUnlocked < nightShift\.length/, "Power Failure requires Night Shift completion");
});

test("Final repair opens a saved six-repair success screen with replay routes", async () => {
  const circuit = await text("circuit-dash/index.html");
  assert.match(circuit,/id="campaign-complete"/, "Missing final success screen");
  assert.match(circuit,/id="campaign-complete-title"/, "Missing accessible success heading");
  assert.match(circuit,/location\.hash = '#mission-complete'/, "Last repair must open final success screen");
  assert.match(circuit,/campaignCompleteOpen = location\.hash === '#mission-complete'/, "Success screen must be independently navigable");
  assert.match(circuit,/hash === '#mission-complete' && powerUnlocked === powerFailure\.length/, "Only completed players can open success screen");
  assert.match(circuit,/Six faults found, six systems checked/, "Final story handover must recognise six repairs");
  assert.match(circuit,/href="\/circuit-dash\/"/, "Success screen must link to training");
  assert.match(circuit,/href="#night-shift"/, "Success screen must allow Night Shift replay");
  assert.match(circuit,/href="#power-failure"/, "Success screen must allow Power Failure replay");
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
