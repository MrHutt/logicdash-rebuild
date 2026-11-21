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

test("Night Shift keeps three distinct themes without recolouring logic signals", async () => {
  const circuit = await text("circuit-dash/index.html");
  for (const theme of ["entry", "sensor", "relay"]) {
    assert.ok(circuit.includes(`data-night-mission="${theme}"`), `Missing ${theme} mission colours`);
  }
  assert.match(circuit, /document\.body\.dataset\.nightMission/, "Missing mission theme switch");
  assert.match(circuit, /green=1, grey=0, amber=selection/, "Keep signal colours consistent");
});

test("Circuit Dash repair navigation is continuous and grouped, and tracing has stable height", async () => {
  const circuit = await text("circuit-dash/index.html");
  for (const phrase of ["Night Shift · 1–3", "Power Failure · 4–6", "campaign-nav", "mission-numbers", "repairNumber"]) {
    assert.ok(circuit.includes(phrase), `Missing repair navigation: ${phrase}`);
  }
  assert.match(circuit, /trace-description[^}]*height:4\.35em/, "Desktop trace panel must reserve steady height");
  assert.match(circuit, /trace-description\{height:5\.8em\}/, "Mobile trace panel must reserve steady height");
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
