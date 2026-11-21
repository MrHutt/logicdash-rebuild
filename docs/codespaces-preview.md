# LogicDash preview before deployment

The site is never deployed to SiteGround just to test a release. Preview the **production build** from the relevant development branch first.

## First time: open a Codespace

1. Open the development pull request and choose **Code > Codespaces > Create codespace on [branch]** (or follow its branch in the repository's Codespaces menu).
2. Codespaces installs dependencies automatically (`npm ci`).
3. On startup it runs a clean production build, then Astro preview on **port 4323**.
4. Codespaces normally opens the forwarded preview in your browser. If it does not, open the **Ports** tab, find **4323**, and click the globe/open-in-browser icon.
5. Preview the homepage, game pages and tools at the forwarded URL. In particular check a phone-sized viewport and a real mobile browser if available.

**Important:** This is an on-demand preview hosted within your Codespace, not a permanent public URL. It is reachable while your Codespace is running. Port visibility defaults to private; do not change this just to create a public preview link without considering the implications.

## Rebuild after new GitHub changes

In the Codespaces terminal:
```bash
git switch <development-branch>
git pull
# Stop any running preview on port 4323 first (Ctrl+C).
rm -rf dist .astro
npm run build
npm run preview -- --host 0.0.0.0 --port 4323
```

For a fresh Codespace, the startup hook builds automatically. If you are already using an existing Codespace, rebuild manually after pulling updates. Running `npm run build` while another preview or dev build is writing to `dist` can cause inconsistent output.

Check `/tmp/logicdash-preview.log` if startup fails. On the **Ports** tab, port 4323 should show the production preview.

## Release gate

- Working preview of the actual release branch available to the site owner
- No sideways overflow at 320, 375, 430, 768 px and desktop widths
- Gameplay and results/shares checked on mobile and desktop
- Owner approves design and functionality
- GitHub Actions build passes
- Only then merge to `main` and download the artifact ZIP
- SiteGround upload remains manual

The automated GitHub Action checks that Astro builds and essential files exist; it does not yet automate visual, touch or gameplay browser checks.
