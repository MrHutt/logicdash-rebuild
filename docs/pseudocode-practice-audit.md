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
