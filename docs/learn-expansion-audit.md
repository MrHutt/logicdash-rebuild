# Learn library expansion — build + review notes

Covers the batch in the "Learn Library Expansion" brief: 14 new Learn pages, the
hub reorganization, and the Pseudocode Practice tool. Library now has 24 lessons
plus 1 practice tool (25 hub cards).

## What was built

- **Shared pieces** (new pages use these instead of copying ~200 lines of CSS each):
  - `src/components/LearnArticle.astro` — breadcrumb, centered hero/lead, content
    blocks, Previous/Next nav. No "Keep Going" box.
  - `src/components/DemoFrame.astro` — the "Try it yourself" box with a fullscreen
    button. Same approach as Countdown Clock / Student Picker (a CSS class for the
    fullscreen look plus the real Fullscreen API on top; Esc exits). Everything
    inside is sized in `em`, so one font-size setting scales the whole demo from
    phone (~17.6px) through a 1080p projector (~25px) to 4K (capped ~38px).
  - `src/components/RelatedLink.astro` — used for the cross-linked pairs.
  - `Layout.astro` now adds JSON-LD automatically, built from `learnTopics.ts`:
    `LearningResource` + `Article` (the practice tool is `WebApplication`) plus a
    `BreadcrumbList` on every Learn page, old and new; `CollectionPage` + `ItemList`
    on the hub.
- **Phase 1:** Abstraction, Binary Search (demo), Speedup, Scalability, Redundancy &
  Fault Tolerance, Encryption Basics (Caesar-cipher demo), Compression
  (run-length demo), Packets & Routing.
- **Phase 2:** Sorting Algorithms, Password Strength & Entropy, Phishing Red Flags,
  Bandwidth & Latency, Public-Key Cryptography, Crowdsourcing & Distributed
  Computing. All have fullscreen demos.
- **Phase 3:** Hub regrouped into Binary & Data / Reliability & Correction /
  Networks & Systems / Security / Practice, with a short intro per group, a
  wrapping "jump to section" nav, and centered card rows. Cross-links:
  Encryption ↔ Public-Key, Speedup ↔ Distributed Computing,
  Packets & Routing ↔ Bandwidth & Latency.
- **Phase 4:** `/learn/pseudocode-practice/` — 47 questions across 8 AP CSP
  reference-sheet topics (`src/lib/pseudocodeQuestions.ts`). Scheduling lives in
  `src/lib/pseudocodePractice.ts`:
  - A missed question comes back after 2–4 other questions, and keeps coming back
    until it's answered correctly.
  - A correct answer drops the question's weight to 0.2; it then recovers by 0.08
    per question.
  - The counter is a streak, not a score, with milestones at 2, 4, 8, 16….
  - There's a topic filter.
  - Progress is saved in `localStorage` (the tool still works if storage is blocked).

## Review checklist results

| Check | Result |
|---|---|
| Question answers | All 47 checked by running the pseudocode through a small interpreter (the 1 conceptual question was checked by hand). **Found and fixed:** robot-2's "A" label sat one row off the robot's real end square. |
| Scheduler behavior | Simulated 3,000 answers. A missed question came back after gaps of 3–5 turns, with no back-to-back repeats. Every question kept appearing (50–78 times each). The topic filter works. |
| SEO | All 25 Learn pages plus the hub have a title, a meta description (≤160 chars — **7 were too long and were shortened**), a correct canonical, all 5 OG tags, and valid JSON-LD. |
| Sitemap | The built `dist/sitemap-0.xml` has 34 URLs: every public page, including all 25 Learn URLs. |
| Internal links | No broken links or anchors across the built site. |
| Prev/Next | A single chain runs through all 25 pages in hub order, and the prev links match. |
| Contrast (WCAG AA) | 31 text and UI color pairs measured, all passing. Lowest: text 6.29:1 (muted on surface-alt); UI 3.12:1 (unsorted bar on background). |
| Accent color | Only amber and neutral greys in the new code. No cyan. The phishing mock email's button is slate, not blue. |
| Color signals | Demos use one signal per state, always paired with a word or symbol (✓/✗, ⚑, legends, hatching vs solid). |
| Responsive | No horizontal scroll at 320 / 375 / 768 / 1024 / 1280 / 1600 / 1920 px. |
| Fullscreen | All 10 demos tested at 375×667, 1280×720, 1920×1080 and 3840×2160. Each opens, moves focus to the exit button, closes on Esc, and never scrolls sideways. Every demo fits a 1080p screen without scrolling. **Fixed:** Phishing (now two columns in fullscreen), Bandwidth & Latency and Pseudocode Practice (slightly smaller in fullscreen). |
| Header / hub nav | Header is one line (41px) from 821px up, with the hamburger below that. Hub jump-nav wraps without overflow at every width. |
| Spoiler discipline | No page explains how to deduce Hamming distance. Binary Search only says LogicDash "uses feedback to make the next guess smarter." |

Other issues found and fixed during the build: the fullscreen exit button showed
when it shouldn't (a `display` rule beat `[hidden]`); inline phishing hotspots
broke lines on phones (now `span role="button"` with keyboard support); a table
got clipped on phones; the Public-Key scene overlapped at 320px; some copy used
UK spelling.

## Open items — need a decision

1. **`robots.txt` doesn't match the notes.** The notes say only
   `/tools/seating-chart` is disallowed. The file in the repo actually disallows
   all of `/tools/`, and `astro.config.mjs` also keeps Countdown Clock and Student
   Picker out of the sitemap, commented as "unpublished, direct-URL-only." This
   batch left both untouched (nothing new lives under `/tools/`). If those two
   tools should now be indexed:
   - change `Disallow: /tools/` to `Disallow: /tools/seating-chart`
   - remove those two entries from the sitemap filter.
2. **Sitemap deploy.** `@astrojs/sitemap` regenerates `sitemap-0.xml` on every
   `astro build`, but only into `dist/`, which isn't committed. The live site will
   only pick up the new URLs once a fresh build's `dist/` is uploaded, sitemap
   files included.
3. **Fonts in screenshots.** The review environment couldn't load Google Fonts,
   so screenshots used fallback fonts. Font assignments in the code follow the
   rules (JetBrains Mono for code/data, Space Grotesk for headings). Worth a quick
   look on the live site.
