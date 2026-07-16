# Handoff brief: Pics by Peralta — deploy + editor setup

Read this before doing anything. It's written for an agent with no prior context on this project.

## What this is

A static photography portfolio site for Sawyer Peralta (high school sports photographer, Kansas, Instagram @picsbyperalta). Three design variants were built during earlier design work; **this folder (`sawyer-portfolio`) is the one that was chosen to actually ship** — a sail/charcoal color palette with a bento-grid homepage. The other two variants that may exist alongside this one (an editorial continuous-feed layout and a cinematic full-bleed layout) were exploratory and are not part of this task — ignore them unless the user says otherwise.

No framework, no build step, no `package.json`. Plain HTML/CSS/JS, meant to be served as-is by any static host.

## What's already built (do not redo this)

- Three pages: `index.html` (home/gallery), `about.html`, `contact.html`. Shared `styles.css` and `script.js`.
- 42 real photos in `assets/photos/*.jpg`, described by `assets/photos/meta.json`.
- **The site is content-driven, not hardcoded.** `script.js` fetches `assets/photos/meta.json`, `content/about.json`, and `content/settings.json` at page-load time and builds the homepage bento grid, the filterable photo gallery, the About page bio, and the footer/contact links from that data. This was done specifically so a non-technical editor tool could change the site's content without touching HTML.
- A Decap CMS (git-gateway backend) admin panel already exists at `admin/index.html` + `admin/config.yml`. It's configured to edit exactly those three JSON files, with an image-upload widget wired to `assets/photos/`. This is a static config — it works as soon as the site is on Netlify with Identity + Git Gateway turned on (see below). Nothing about the CMS config needs to change.
- `meta.json` shape: `{ "photos": [ { "slug": "...", "category": "...", "caption": "...", "bentoSlot": "a"–"h" or "" }, ... ] }`. `bentoSlot` controls which 8 photos appear in the homepage grid (one photo per letter, a–h).
- `content/about.json`: `{ "portrait": "path", "heading": "...", "bio": ["paragraph 1", "paragraph 2", ...] }`.
- `content/settings.json`: Instagram URL, contact email/phone, footer text.

Known minor cleanup opportunity, not urgent: `assets/about-portrait.svg`, `assets/hero-large.svg`, `assets/hero-secondary.svg`, `assets/thumb-*.svg` (6 files), and `gen_assets.py` are leftover from earlier iterations and are not referenced anywhere in the current HTML/CSS/JS. Safe to delete if you want a tidier repo, but harmless to leave.

Known caveat: `styles.css` has `object-position` overrides scoped to `.bento-item.item-a img` and `.bento-item.item-e img` (fixes a cropping bug on two specific tall photos in wide grid boxes). If the user reassigns a *different* photo to `bentoSlot: "a"` or `"e"`, that photo inherits the same crop offset and may need its own `object-position` tweak. Not a bug, just something to know if a framing complaint comes in about those two tiles specifically.

## What still needs to happen

The user (Jack) is non-technical about hosting and does not have GitHub/Netlify accounts set up yet. The plan, already explained to him in plain language in `../Pics by Peralta — Going Live + Editor Setup.md`, is:

1. Get this folder's contents into a GitHub repo (owned by Jack, not Sawyer).
2. Connect that repo to Netlify (also Jack's account) with no build command and `/` as the publish directory — it's static files, nothing to compile.
3. In the Netlify dashboard for that site: enable Identity, set registration to invite-only, enable Git Gateway. **These three toggles are dashboard-only** — there is no documented Netlify CLI/API shortcut for enabling Identity or Git Gateway on a site, so this step needs Jack to click through the Netlify UI himself even if everything else is automated.
4. Invite Sawyer's email address as an Identity user from that same dashboard. Sawyer accepts the emailed invite, sets a password, and lands on `/admin` — scoped only to the CMS editor, with no access to Jack's GitHub or Netlify account.

If you have `gh` (GitHub CLI) and/or `netlify-cli` authenticated in this environment, you can automate steps 1–2 (repo creation, initial commit, push, `netlify init`/`netlify deploy`). If you don't have those authenticated and can't run an interactive browser login, say so plainly and hand steps 1–2 back to Jack rather than guessing — don't fabricate a repo URL or deploy URL that doesn't actually exist. Step 3 needs to happen in the Netlify web dashboard regardless. Step 4 (inviting Sawyer) also needs Jack, since it requires him to actually know Sawyer's email and click "invite" himself — don't send that invite on his behalf.

## Constraints / things not to change without being asked

- Don't restructure the JSON schema (`meta.json` / `about.json` / `settings.json`) — `admin/config.yml` and `script.js` both assume the current field names and shapes. If you do need to change a field name, update it in all three places (the JSON, `config.yml`, and `script.js`) together.
- Don't reintroduce hardcoded photo/bio HTML into `index.html`/`about.html` — the whole point of this setup is that content lives in the JSON files, not the markup.
- The other two site variants (if present as sibling folders) are out of scope for this task.
