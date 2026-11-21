# LogicDash: GitHub build, review and SiteGround release

This repository builds a **static Astro website**. SiteGround deployment remains manual.
GitHub Actions handles production builds, release verification and packaging.

## Development workflow

1. Work on one feature branch for a release. Open one pull request targeting `main`.
2. GitHub Actions runs `npm ci`, `npm run build` and `node --test tests/build-output.test.mjs` for each PR.
3. Review the changes and test gameplay on desktop and mobile (this initial workflow verifies the build and static output; it does **not yet** include real browser gameplay tests).
4. Merge only after the owner approves and the required checks pass.
5. A successful merge to `main` triggers a fresh, clean production build and a ready-to-download artifact.

## Download for SiteGround (no Codespaces required)

1. Open **GitHub > Actions > LogicDash build and SiteGround package**.
2. Open the successful **push** run for the approved merge on `main`.
3. Under **Artifacts**, download `logicdash-siteground-<run number>`.
4. The downloaded file is a ZIP whose **root** should contain `index.html`, `.htaccess`, `_astro/`, `quick-byte/`, `learn/`, and other site directories. There should be **no enclosing `dist/` directory**.
5. Before deploying, create/check the SiteGround backup and inspect the live `.htaccess` if hosting rules have changed.
6. Upload the downloaded ZIP to the LogicDash document root (`public_html` where applicable), extract, and replace matching website files. Never delete the entire directory or remove unrelated hosting files.
7. Check the live homepage, all three puzzles, mobile gameplay/results, share buttons, Tools, a case-insensitive short lesson URL (e.g. `/1a2/`) and the 404 page.

**Important:** Do not deploy a failed build. Do not confuse the artifact ZIP with the source-code ZIP shown on GitHub's Code page.

## Rebuilding a release without new source changes

On the **Actions** tab select **LogicDash build and SiteGround package** > **Run workflow** > branch `main`. This manually triggers a fresh build and artifact, but **does not deploy**.

## Permissions and safety

- GitHub workflow permissions: `contents: read`; no GitHub secrets or SiteGround credentials.
- The workflow does not merge PRs, publish to GitHub Pages, or access SiteGround.
- Artifact retention: 30 days.
- Recommended after first green run: set a branch ruleset requiring the check **Build and verify static site** on `main`. Availability and enforcement depend on repository visibility and GitHub plan.
- For each significant UI/gameplay release, add automated browser tests at 320, 375, 430, 768 and desktop widths and verify on a real mobile device before shipping.

## Troubleshooting

If a build fails, open the failed job step's logs in Actions. Fix in the development branch and rerun the checks. Do **not** work around a failing check by uploading an untested `dist` folder.
