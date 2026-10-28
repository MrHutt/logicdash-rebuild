# Pseudocode Practice — audit and improvement report

Notation spec: the exam reference sheet (text form). Key rules checked:
- `/` is real division (17 / 5 = 3.4).
- MOD has the same precedence as `*` and `/`.
- `DISPLAY` shows a value followed by a space.
- Lists start at 1; an index below 1 or above LENGTH is an error that ends the program.
- `aList ← bList` assigns a copy.
- RETURN exits immediately.
- Robot: rotations turn in place; CAN_MOVE is relative to the robot; moving into a blocked square or off the grid leaves the robot in place and ends the program.

## 1. Audit of the existing tool (before changes)

### Inventory (213 questions)

**By level:** Easy 63, Medium 82, Challenging 68.

**By primary topic:**

| Topic | Questions |
|---|---|
| Variables & display | 15 |
| Arithmetic & MOD | 18 |
| Boolean logic | 19 |
| Selection | 12 |
| Iteration | 37 |
| Lists | 45 |
| Procedures | 41 |
| Robot | 26 |

**By question type:**

| Type | Questions |
|---|---|
| Predict the output ("What is displayed?") | 153 (72%) |
| Robot final square or facing | 26 |
| Possible random outcomes | 6 |
| Missing statement | 5 |
| Compare segments / which segments work | 5 |
| Procedure return / purpose | 5 |
| Choose an expression for a spec | 4 |
| What happens (error or termination) | 3 |
| Find the bug | 2 |
| Find an input | 1 |
| Conceptual | 3 |

**Distinct code structures:** 202 of 213 after removing names and numbers. There are 7 near-duplicate groups (same code shape, different values): mod-1 = mod-2 = mod-3 = e-mod-1 = e-mod-2 = m-ms-3; var-2 = m-disp-2; mod-6 = e-mod-4; loop-2 = m-la-2; loop-3 = loop-5; loop-7 = e-loop-4; list-6 = e-list-1.

### How questions work

- **Storage:** static objects. Each has a prompt, code, an optional robot grid, 4 option strings, an answer index and one explanation.
- **Distractors:** hand-written. Nothing records which misconception each wrong option represents.
- **Explanations:** one per question, the same whichever option was chosen.
- **Answer order:** shuffled on display.

### Scheduling (tested)

- A missed question returns after 2–4 other questions until it's answered correctly. It returns with **identical code and values**, so it can be memorized rather than re-reasoned.
- A correct answer drops the question's weight to 0.2, recovering 0.08 per question.

### What saved progress measures

Stored under `logicdash:pseudocode-practice:v1` (state version 2):
- per-question weight and "due in"
- current and best streak, and best streak per level
- total answered (retries included)
- last 3 question IDs
- chosen topics and level

It does **not** record correctness by topic or skill, first-attempt results, or anything that could support "ready for harder" advice.

### Verified defects

1. **Incomplete topic tags (46 cases).** The code uses a construct the question isn't tagged with, so topic practice misses these:
   - Selection: 16 (e.g. list-7, proc-3, robot-6, c-plr-1, x-seg-4)
   - Iteration: 15 (e.g. list-7, robot-2, m-plist-3, c-purpose-1)
   - Arithmetic & MOD: 5 (sel-3, list-8, e-sel-4, c-lmod-1, c-lmod-2)
   - Boolean logic: 5 (sel-4, robot-3, c-robot-1/6/7)
   - Lists: 5 (loop-7, proc-5, m-ls-5, m-ms-2, c-pp-5)
2. **Practice starts below the fold.** The question card starts about 1,000px down the page, after the introduction (1366×900 screen).
3. **Repeats are memorizable.** A missed question returns with identical values (see Scheduling).
4. **"Answered" counts retries**, so it can't be read as "different questions done".
5. **Near-duplicates:** the six MOD questions above are the same structure, so a "topic" can be mostly one pattern.

### Checked and working

- All 183 auto-checkable questions give the intended answer when re-run by a new, independent interpreter written to the reference sheet. The other 30 are conceptual or multi-segment questions, previously checked by hand or by a substitution harness.
- Every question has 4 distinct options, and no answer is ambiguous.
- Double-answering is blocked: pressing 1, 2, 1 quickly records one attempt.
- Keyboard 1–4, Enter and N work.
- Answer order is shuffled.
- Saved state survives a reload, and blocked storage falls back to in-memory.
- One note, not a defect: mod-4 deliberately shows 7 / 2 = 3.5, which matches the reference sheet's real division.

### Proposed improvements (not defects)

- More question types beyond "What is displayed?".
- Revisit a missed **skill** with a different example.
- Topic-level progress and next steps.
- Misconception-specific feedback.
- Traces.
- A start screen near the top.
- A consistent vector robot grid.

## 2. Summary of changes

Work followed the brief's order: correctness → interface and short links → variety and feedback → progression → robot trace. No framework, backend, login or live AI was added. The page is still plain static HTML and JavaScript built by Astro. No other lesson's content changed. The only shared component touched is `LearnArticle.astro`, which gained an optional `sections` prop; it defaults to the old behavior.

**Correctness**
- New reference-sheet interpreter (`src/lib/pseudo/interpreter.ts`). It covers real division, MOD precedence, `DISPLAY` spacing, 1-based lists with range errors, list copy on assignment, immediate `RETURN`, relative `CAN_MOVE`, and blocked moves ending the program. Programs that never stop hit a step limit. It records a step-by-step trace for the "Show trace" player.
- All 46 incomplete topic tags in the original bank are fixed, using tags derived from the code itself (`bank.ts`).
- One original prompt said "triangle"; the robot is now drawn as an arrow, so the word was removed.

**Interface and short links**
- **Start screen** at the top of the practice box:
  - the required instruction line
  - three routes (Practice a topic is the default; Mixed practice; Review mistakes)
  - Continue practice for returning students
  - topic and level pickers, with each topic's progress state
  - a Pseudocode help panel (cheat sheet, robot rules, keys)
- At 1366×900 the Start button sits at about y=770, above the fold. Before, the first question started at y≈1009.
- **One question card per screen.** Each card has a meta line (topic · level · question type), the prompt, the code, the grid if any, and 4 options. Next is always in the same place, at the right under the options. It is disabled until the student answers and never moves after answering.
- **Keyboard:** 1–4 answer, Enter/N next, T trace, Esc closes help. Fullscreen still works and fits with no scrolling.
- **Short links are case-insensitive** on SiteGround:
  - The build writes `dist/.htaccess` from the lesson-code list (see section 5).
  - `/404.html` has a JavaScript fallback for hosts without `.htaccess`.
  - The lesson-code box on /learn/ trims spaces and ignores case.

**Variety and feedback**
- **53 seeded, parameterised templates**, 6–7 per topic, across 8 question types (see the coverage table).
  - Each question ID is `templateId#seed`, and the same ID always rebuilds the same question.
  - Every question is validated (4 distinct options, exactly one correct, explanation present) before it's shown.
  - Wrong options come from named misconceptions. Most carry their own "About your answer" note.
- **The 213 original questions are kept** in the pool alongside the templates.
- **Answer positions are shuffled**, except where order carries meaning (grid letters, compass directions).
- **No two questions in a row share a template or code shape.** The last 3 structures are avoided.
- **After answering:**
  - The chosen and correct answers are marked with text badges ("✓ Correct answer", "✗ Your answer") and border styles (solid vs dashed), not color alone.
  - Then come a verdict, "You chose 2: … The correct answer is 4: …", the explanation for this exact instance, and the misconception behind the wrong choice.
- **One attempt per question.** There is no auto-advance.
- **"Show trace"** steps through the program line by line. It shows the current line, what happened ("x becomes 7", "Condition is false — skip the IF block", "Blocked! …"), the variables (changed ones highlighted), the output so far, and, for robots, the grid with the robot's trail. Controls: Back / Step / Play / Reset.

**Progression** (`src/lib/pseudo/progress.ts`)
- **Easy, Medium and Challenging** are defined by reasoning demand. The definitions are shown on the level buttons and in the For Teachers box.
- **Students can change level at any time** from the session bar. The tool suggests a change but never makes one.
- **Up:** suggested when at least 8 of the last 10 eligible first attempts are correct, across at least 3 templates.
- **Down:** suggested at 3 or fewer of 10.
- Retries and revealed answers never count; each question is answered once. "No thanks" hides the suggestion for the next 10 questions.
- **Topic states:** Not practiced / Building confidence / Ready for a harder challenge / Review suggested.
- **A missed skill returns** after 2–3 other questions as a *different* example (a different template or seed), labeled "Review: new example". It leaves the review list once answered right.
- **Checkpoint every 10 questions:**
  - first-try score
  - the skills that caused difficulty
  - one recommended next step
  - Continue / Review mistakes / Change topic, plus a level switch when that is the recommendation
- **Saved progress uses the same storage key as before.** Version 1 and 2 saves are migrated: streak, best and level are kept, and questions that were due to come back become review items. Unreadable data is set aside under `…:unreadable` instead of being erased. With storage blocked, the page works in memory and says progress won't be saved.

**Robot trace** (`src/lib/pseudo/robotSvg.ts`)
- **One SVG renderer** draws every robot grid, in questions and traces alike:
  - equal square cells, with row and column numbers
  - black hatched blocked squares
  - dashed outlined, lettered target squares
  - an arrow-shaped robot with a front dot
  - a legend under each grid
- **Code and grid** sit side by side on wide cards and stack on narrow ones.
- **Each grid has a text description** for screen readers: size, robot position and facing, blocked squares and labeled squares. It never gives the answer.
- **Play honors reduced motion.** It still steps (the steps are the content), but every 1.6 s instead of 0.9 s, with no transitions.

## 3. Coverage

Template counts are by the template's main topic. "Structures available" counts the distinct templates plus original-question code shapes a student can get in that scope (cross-tagged questions included). Every topic × level has at least 6, and the progress tests require at least 3.

| Topic | Templates (E/M/C) | Question types in templates | Original questions (E/M/C) | Structures available per level, incl. cross-tagged (E/M/C) |
|---|---|---|---|---|
| Variables & output | 6 (2 / 3 / 1) | Predict the output, Missing code, Compare code | 15 (8 / 4 / 3) | 11 / 11 / 14 |
| Arithmetic & MOD | 7 (3 / 2 / 2) | Predict the output, Choose the code | 18 (12 / 5 / 1) | 12 / 23 / 17 |
| Boolean logic | 6 (1 / 2 / 3) | Predict the output, Find an input, Choose the code, Find the bug | 19 (8 / 6 / 5) | 11 / 14 / 23 |
| Selection | 6 (1 / 3 / 2) | Predict the output, Compare code, Find the bug, Missing code | 12 (7 / 4 / 1) | 8 / 45 / 36 |
| Iteration | 7 (1 / 4 / 2) | Predict the output, Spot the error, Missing code | 37 (9 / 14 / 14) | 8 / 53 / 53 |
| Lists | 7 (2 / 2 / 3) | Predict the output, Final state, Spot the error, Choose the code, Find the bug | 45 (9 / 18 / 18) | 11 / 32 / 37 |
| Procedures | 7 (1 / 3 / 3) | Predict the output, Missing code, Find the bug | 41 (5 / 18 / 18) | 6 / 21 / 23 |
| Robots | 7 (2 / 3 / 2) | Final state, Choose the code | 26 (5 / 13 / 8) | 7 / 16 / 10 |

Template question types overall:

| Type | Templates |
|---|---|
| Predict the output | 27 |
| Final state | 8 |
| Choose the code | 5 |
| Missing code | 4 |
| Find the bug (pick the input that exposes it) | 4 |
| Spot the error | 2 |
| Compare code | 2 |
| Find an input | 1 |

All 213 original questions are still available, alongside the 53 templates. Mixed practice draws on 68 / 104 / 86 structures at Easy / Medium / Challenging.

**Gaps (honest list)**
- **Easy has the fewest structures** in some topics (Procedures 6, Robots 7, Iteration and Selection 8). Easy is deliberately "one idea", so this is reasonable, but those topics would benefit most from new Easy templates.
- **Robots only uses two question types** (final state and choose the code). There is no robot "find the bug" yet.
- **Some templates have only a few code variants;** the values in their options still change with the seed. For example, `se-order-bug` has 4 and `li-remove-bug` 4. A returning skill picks a different template where it can.
- **A few question types have only 1–2 templates:** Find an input, Spot the error, Compare code.

## 4. Test results and limitations

All of these were run against the final build.

| Suite | What it checks | Result |
|---|---|---|
| `npm run test:pseudo`: interpreter | 24 hand-written programs with expected results worked out independently from the reference sheet (division, MOD precedence, DISPLAY spacing, list copy, index errors, RETURN, relative CAN_MOVE, blocked moves, step limit) plus trace output | pass |
| `npm run test:pseudo`: templates | 53 templates × 300 seeds = 15,900 questions. Each one: valid; 4 distinct options; exactly one correct; the right answer confirmed by running the code or a template-specific checker that recomputes it independently (e.g. a "find the bug" option is correct only if the code's result differs from the stated rule) | pass |
| `npm run test:pseudo`: original bank | all 183 runnable original questions re-run through the new interpreter | pass |
| `npm run test:pseudo`: progress | v1/v2 migration; pool ≥ 3 for every topic × level; no back-to-back structure; review returns after 2–3 questions as a different example; readiness (8/10 over 3 templates, retries excluded); suggestions; checkpoint | pass |
| `npm run test:ui` (Playwright, 327 checks) | start routes; empty review; arrow-key routes; help and Esc; keys 1–4, Enter, N and T; second attempt ignored; Next doesn't move; no auto-advance; trace Step/Back/Reset/Play/Pause; level change; reload → Continue; change topic; 10-question checkpoint and review; robot grid, description, legend, side-by-side vs stacked; reduced motion; no horizontal overflow at 320 / 390 / 768 / 1366 / 1920 px (12 questions each, with feedback and trace open); fullscreen fit at 1366×768, 1920×1080, 1024×768 and 390×844; blocked storage; v2 save migration; corrupt save; no console errors | pass |
| Site crawl | all 49 content pages at 390 and 1366 px: status, horizontal overflow, console errors | pass, 0 problems |
| Apache 2.4 with the generated `.htaccess` | `/5A2`, `/5a2`, `/5a2/`, `/5A2/` → 302 to the lesson; `/5a2?ref=class` keeps `?ref=class`; unknown code `/zzz` → 404 page; normal URLs unaffected; no loops | pass |

**Limitations**
- **The course and exam description PDF couldn't be fetched** from this environment, because that host isn't on the session's allowed network list. The notation follows the uploaded reference sheet, which is what the brief made the spec.
- **Screenshots and tests used headless Chromium.** Safari and Firefox weren't tested here; the page uses only standard features (container queries, SVG, `<details>`).
- **Fullscreen on a phone in portrait** fits by shrinking the text, down to about 11 px on the longest robot questions. It's meant for projecting, where screens are wide.
- **Progress is per browser and per device** (localStorage), as before. Clearing site data resets it.
- **"Ready for a harder challenge" is a practice signal, not an assessment.** The For Teachers box says so.

## 5. Deployment

### Build

```
git checkout claude/cloud-project-ym7sal
npm install
npm run build
```

The build prints `[lesson-code-redirects] .htaccess written with 35 lesson codes`. Two files are generated in `dist/`:
- `dist/.htaccess`: the complete file, if SiteGround has no `.htaccess` of its own.
- `dist/htaccess-lesson-codes.txt`: the same block, for pasting into an existing `.htaccess`. It isn't needed on the server.

### Upload to SiteGround

1. **Check for an existing `.htaccess`.** In SiteGround File Manager, open `public_html/` and turn on "Show hidden files". Look for `.htaccess`; SiteGround often adds one for HTTPS and caching.
   - **No existing file:** upload `dist/.htaccess` as is.
   - **Existing file:** don't overwrite it. Edit it, paste the whole block from `dist/htaccess-lesson-codes.txt` (from `# BEGIN LogicDash lesson codes` to `# END LogicDash lesson codes`) **below** SiteGround's own rules, and save. When the lesson-code list changes, replace just that block.
2. **Upload the contents of `dist/`** (not the folder itself) to `public_html/`, replacing the old files.
3. **Hidden-file warning:** `.htaccess` starts with a dot. macOS Finder hides it, and some zip and upload tools leave it out. If you upload a zip, check afterwards that `public_html/.htaccess` exists.
4. **Optional clean-up:** the old upper- and lowercase short-code folders (`/5A2/`, `/5a2/`, …) can stay. The rewrite rules answer before they're used, and they act as a fallback.

### Check after deploying

- `https://logicdash.io/5A2`, `/5a2`, `/5a2/` and `/5a2?ref=class` should all land on Pseudocode Practice; the last should keep `?ref=class`.
- `https://logicdash.io/zzz` should show the "Page not found" page.
- `https://logicdash.io/learn/pseudocode-practice/` with an old save in the browser should offer **Continue practice**.

### Routing differences: GitHub vs SiteGround

- **SiteGround (Apache)** uses the `.htaccess` rules. Each known code, in any case and with or without a trailing slash, gets a server-side 302 redirect to its lesson. Query strings are kept, and only codes in the list match.
- **GitHub (and any host without `.htaccess`)** ignores the rules. The exact-case folders (`/5A2/`, `/5a2/`) still work. Mixed case (for example `/5A2` typed as `/5a2`) on a case-sensitive host falls through to `404.html`, whose script looks the code up in `/lesson-codes.json` and forwards to the lesson. That only works for 3-character codes in the list, so there are no loops.
- **Why the bug appeared:** building on a Mac, whose file system ignores case, merges the `5A2` and `5a2` folders into one, so only one case was uploaded. The `.htaccess` rules don't depend on those folders, so this can't recur.

### Local preview

```
git fetch origin
git checkout claude/cloud-project-ym7sal
git pull
npm install
npx astro dev          # → http://localhost:4321/learn/pseudocode-practice/
# or the production build:
npm run build && npx astro preview   # → http://localhost:4321/
npm run test:pseudo    # engine + progress tests
npx astro preview --port 4329 & npm run test:ui   # browser tests (needs Playwright)
```

`astro dev` and `astro preview` don't read `.htaccess`, so mixed-case short links there go through the 404 fallback.

## 6. Screenshots

All are in `docs/screenshots/`.

| File | Shows |
|---|---|
| `desktop-start.png`, `phone-start.png` | Start screen at 1366 px and 390 px |
| `desktop-feedback.png`, `phone-feedback.png` | A question after a wrong answer: badges, explanation, misconception note |
| `robot-desktop-question.png`, `robot-phone-question.png` | Robot question: code and grid side by side on desktop, stacked on the phone |
| `robot-desktop-trace.png`, `robot-phone-trace.png` | Robot trace mid-run, with the trail |
| `robot-reduced-*.png` | The same with reduced motion |
| `checkpoint-desktop.png` | The 10-question checkpoint |
| `fullscreen-desktop.png` | Fullscreen at 1366×768: everything fits |
