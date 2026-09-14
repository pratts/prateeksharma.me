# prateeksharma.me

Source for [prateeksharma.me](https://prateeksharma.me/) — a personal engineering
knowledge hub: who I am, where I have worked, what I have built, what I contribute
to open source, what I write, what I think about, and what I read.

Built with **Hugo** + **Tailwind CSS v4** + a little **Alpine.js**. The visual
language is adapted from the [Nerdy](https://github.com/hugo-themes/nerdy) Hugo
theme (MIT) — see [Architecture](#architecture) for what was kept and what was
rebuilt.

---

## Quick start

```bash
nvm use            # Node 24 (see .nvmrc)
npm install        # Tailwind CLI + Alpine + typography plugin
npm run dev        # Hugo dev server with drafts + future posts, at http://localhost:1313
```

Other scripts:

| Command          | What it does                                                            |
| ---------------- | --------------------------------------------------------------------- |
| `npm run dev`    | Dev server, includes `draft`/`future` content, live reload.          |
| `npm run serve`  | Dev server, **production** content only (no drafts).                 |
| `npm run build`  | Production build to `public/` (two-pass, minified). Used by CI.      |
| `npm run clean`  | Remove `public/`, `resources/`, and the Hugo build lock.            |

You need **Hugo extended ≥ 0.165** and **Node ≥ 24** installed. Hugo's built-in
Tailwind integration shells out to the `@tailwindcss/cli` binary from
`node_modules`, so `npm install` must run before any Hugo build.

### Why the two-pass build

`npm run build` runs Hugo twice:

1. `hugo --gc --renderToMemory` — produces `hugo_stats.json` (a list of every CSS
   class Hugo emitted) without writing HTML.
2. `hugo --gc --minify` — the real build; Tailwind now sees `hugo_stats.json` and
   only ships the classes actually used.

`build.buildStats.enable` in `hugo.toml` turns on step 1's output.

---

## Architecture

### Hugo, not a JS framework

Everything is static Hugo + Markdown + data files. The only JavaScript is
`assets/js/main.js` (~11 KB): the theme toggle, the interactive terminal,
table-of-contents highlighting, and code-block copy buttons. Navigation, content,
and every section work with JS disabled.

### Nerdy as a local design system, not a theme dependency

Nerdy is a strongly opinionated theme built around a single `posts/` surface. This
site needed a different information architecture (six first-class content types
plus cross-cutting taxonomy), so rather than fighting the theme with dozens of
brittle overrides or vendoring it as a Hugo Module (which drags in the Go
toolchain and a `hugo mod npm pack` workspace), **Nerdy's design layer was copied
into the project and its layout layer was rebuilt**:

- **Kept, close to upstream:** `assets/css/main.css` (the `nerdy-*` component
  classes and colour tokens), `assets/js/main.js`, `assets/js/theme-scheme.js`,
  `assets/icons/*`, and small components (`icon`, `accent-classes`,
  `page-heading`, `section-heading`, `empty-state`, `theme-toggle`). Site-specific
  CSS is appended to `main.css` in one clearly-marked block so the upstream part
  stays diffable.
- **Rebuilt for this site:** `baseof`, the homepage, every section/single layout,
  the data-driven nested navigation, taxonomy pages, and the terminal's
  command registry.

There is **no `themes/` directory, no Hugo Module, and no `public/` submodule.**
Everything lives in this one repo.

### Directory layout

```text
.
├── archetypes/            # `hugo new` templates, one per content type
├── assets/
│   ├── css/main.css        # Nerdy design system + appended site CSS
│   ├── js/                 # main.js (Alpine, terminal, toc, copy), theme-scheme.js
│   ├── icons/              # SVG icons referenced by name
│   └── images/profile.jpg  # profile photo — replace this file to change it
├── content/
│   ├── _index.md           # homepage intro copy
│   ├── about.md            # /about/
│   ├── writing/_index.md   # /writing/ hub — aggregates blog+opinions+notes
│   ├── experience/         # one page bundle per company
│   ├── projects/           # one page bundle per project
│   ├── open-source/         # one file per contribution
│   ├── blog/               # one page bundle per post
│   ├── opinions/            # one file per opinion
│   ├── notes/               # one file per note (short technical fragments)
│   └── books/
│       ├── <slug>/index.md  # one page bundle per book (+ cover.jpg)
│       ├── reviews/         # /books/reviews/  (layout: reviews)
│       └── reading-list/    # /books/reading-list/  (layout: reading-list)
├── data/
│   ├── profile.yaml        # name, title, photo, links, stats, stack
│   ├── navigation.yaml     # nested main nav + footer link groups
│   ├── home.yaml           # homepage section order + limits
│   └── terminal.yaml       # terminal config + command registry
├── layouts/
│   ├── baseof.html  index.html  page.html  section.html
│   ├── taxonomy.html  term.html
│   ├── <section>/section.html + <section>/page.html   # per content type
│   ├── books/reviews.html  books/reading-list.html
│   ├── _markup/            # Markdown render hooks (images → <figure>, external links)
│   └── _partials/          # site chrome, cards, home sections, terminal
├── static/CNAME            # prateeksharma.me
├── .github/workflows/deploy.yml
└── hugo.toml
```

### URL structure

```text
/                         /categories/            /tags/
/about/                   /categories/<name>/     /tags/<name>/
/writing/                 # hub — blog + opinions + notes, newest first
/experience/              /experience/<company>/
/projects/                /projects/<project>/
/open-source/             /open-source/<slug>/
/blog/                    /blog/<post>/
/opinions/                /opinions/<slug>/
/notes/                   /notes/<slug>/
/books/                   /books/<book>/
/books/reviews/           /books/reading-list/
```

There is deliberately no `/resume/` page — every "Résumé" link (sidebar, footer,
terminal `contact`, About, Experience) opens the actual résumé URL directly in a
new tab. See **Résumé** under Configuration below.

Leaf URLs use the file/bundle name (`permalinks` in `hugo.toml` pin
`:contentbasename`), so renaming a file changes only that one URL. Old
`pratts.github.io` URLs are **not** preserved — content architecture was the
priority.

---

## Editing content

All content types share the same taxonomy: **`categories`** (broad — Backend,
Distributed Systems, Databases, Infrastructure, Programming, Systems, Engineering,
Career, Books) and **`tags`** (specific — Go, PostgreSQL, Redis, Kubernetes,
Temporal, API, concurrency, system-design, …). A tag or category page aggregates
matching blog posts, opinions, notes, projects, books, experience, and
open-source entries — that's the "knowledge graph."

### Writing: Blog, Opinions, and Notes

These are three deliberately different content types, all reachable from
`/writing/` (which mixes and dates them together) as well as their own
listing pages:

| Type     | For                                             | Command                              |
| -------- | ------------------------------------------------ | ------------------------------------ |
| Blog     | Substantial, structured technical writing.        | `hugo new blog/my-post/index.md`     |
| Opinions | Short, personal takes — a paragraph is fine.      | `hugo new opinions/my-take.md`       |
| Notes    | One fact or observation — a sentence is fine.     | `hugo new notes/some-fact.md`        |

Blog posts use a page bundle so images sit next to `index.md`; Opinions and
Notes are single files. Common front matter: `description`, `categories`,
`tags`; blog posts additionally support `cover.jpg`/`hero.jpg` in the bundle
for a hero image, and `##`/`###` headings feed the floating table of contents.
Optional `related = ['/projects/x/', '/books/y/']` adds explicit "related"
links on top of the automatic taxonomy-based matches.

Adding a fourth kind later (say, Essays) is a data change plus one new
section, not a rewrite — see **Navigation** under Configuration below.

### Add a project

```bash
hugo new projects/my-project/index.md
```

Key front matter: `code` (repo URL), `live` (demo URL), `featured` (true → shows
on the homepage), `status`, `tech = [...]`. Add `architecture.png` / `diagram.png`
/ `flow.png` for the architecture figure and `screenshot-*.png` for the gallery.

### Add an open-source contribution

```bash
hugo new open-source/what-i-did.md
```

Set `contribution_type` to one of `pr`, `issue`, `bug`, `discussion`, `docs`,
`other`; `project = 'owner/repo'`; `link` = the PR/issue URL; `status`. This log
is maintained by hand — it is **not** a GitHub API sync.

### Add experience

```bash
hugo new experience/company-name/index.md
```

One bundle per **company** (not per title — cover role progression in the body).
`date` is the start date and drives ordering; `start` / `end` are the display
strings. Use body headings like `## Engineering areas` → `### <area>` →
bullet points, then `## Stack`. Keep proprietary detail out; don't invent metrics.

### Add a book

```bash
hugo new books/the-book-title/index.md
```

Front matter: `author`, `status` (`want-to-read` | `reading` | `read` | `paused` |
`abandoned`), optional `rating` (1–5), `started` / `finished`, `priority`
(reading-list ordering), `link`, `note`. Drop `cover.jpg` in the folder — without
one, a text placeholder renders. `want-to-read` books appear on
`/books/reading-list/` automatically.

### Add a book review

In an existing book's `index.md`, set `review = true` and write the review in the
body (a paragraph is valid; or use headings like *What I liked*, *Key ideas*,
*Notes*). It then appears on `/books/reviews/`.

---

## Configuration

### Navigation — `data/navigation.yaml`

`main` is a list of `{ name, url }`. Add `children: [...]` for a dropdown
(accessible: CSS hover/focus on desktop, native `<details>` on mobile — no JS
required). Nest as deep as you like; add sections without touching a template.
`footer` is a list of `{ title, items: [...] }` link groups.

The **Writing** entry is also read programmatically by `layouts/writing/section.html`:
its `children`'s URLs (`/blog/`, `/opinions/`, `/notes/`) tell the `/writing/`
hub which Hugo sections to mix together, so adding a fourth writing kind is:

1. `content/<kind>/` with a `page.html`/`section.html` pair copied from
   `layouts/opinions/*.html`.
2. One child entry here.
3. One label + accent in `layouts/_partials/cards/writing-row.html`'s
   `$kindMeta`.
4. Add it to `$sectionOrder` in `layouts/term.html` if it should show up in
   tag/category aggregation.

No changes to `layouts/writing/section.html` itself. The same nesting
supports future top-level groups (a `Knowledge` entry with Books/Papers/
Courses children, say) without touching the header template.

### Profile & homepage identity — `data/profile.yaml`

Name, title, `tagline`, `intro`, `status`, `links` (each `{ icon, label, url }`
where `icon` is a file in `assets/icons/`), `stats` (`{ label, value, accent }` —
keep these truthful, no vanity metrics), and `stack` (the curated homepage list).

### Homepage sections — `data/home.yaml`

`sections` is an ordered list of `{ type, title, icon, limit }`. `type` maps to
`layouts/_partials/home/sections/<type>.html`. Reorder, retitle, or drop sections
here. Featured projects come from `featured: true`; `featured-writing` mixes the
most recent Blog/Opinions/Notes entries (kind-labeled); the rest are "most
recent N".

### Terminal — `data/terminal.yaml`

`config` (prompt, window title, `auto_command`, `builtins`), the text blocks
(`whoami`, `about`, `interests`, `contact`, `stack`), and `commands` — a registry
of `{ name, description, weight, quick, section, page }`. A command with
`section:` lists that content section's recent pages; `quick: true` pins it to the
quick-command bar. Rendering logic is in
`layouts/_partials/terminal/render.html`; built-ins (`clear`, `cat`, `pwd`,
`date`, `echo`, `sudo`) are in `assets/js/main.js`.

### Images

- **Profile photo:** replace `assets/images/profile.jpg` (roughly square, ≥ 320 px).
  Hugo generates the responsive/OG variants. No template change needed.
- **Content images:** put them in the page bundle and reference them with plain
  Markdown — a render hook wraps them in `<figure>` (with `<figcaption>` if the
  image has a title) and generates a resized WebP.
### Résumé

There is no `/resume/` page — "Résumé" links go straight to the actual URL and
open in a new tab (`target="_blank"`), rather than hopping through a page on
this site first. The same URL currently appears in five places, each with a
short comment pointing back here:

- `data/profile.yaml` — the sidebar link (icon-based, `hasPrefix .url "http"`
  already adds `target="_blank"` generically).
- `data/navigation.yaml` — the footer link (same generic handling).
- `data/terminal.yaml` — the `contact` command's link list (`text:` overrides
  the link label so the terminal doesn't print the full URL).
- `content/about.md` and `content/experience/_index.md` — plain Markdown
  links; the external-link render hook adds `target="_blank"` automatically.
- `layouts/experience/section.html` — one hardcoded link ("Prefer the
  one-pager?"), since it isn't sourced from a data file.

It's currently a Google Drive link. To self-host instead, drop the PDF at
`static/resume.pdf` and update all five URLs to `/resume.pdf` (an internal,
site-relative link needs no `target="_blank"`).

---

## Deployment

Push to `main` → GitHub Actions builds and deploys to GitHub Pages
(`.github/workflows/deploy.yml`): install Hugo extended, `npm ci`, two-pass Hugo
build, `upload-pages-artifact`, `deploy-pages`. No generated output is committed;
there is no `public/` submodule.

**One-time GitHub setup:**

1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. **Settings → Pages → Custom domain:** `prateeksharma.me` (the `static/CNAME`
   file keeps it set on every deploy). Point DNS at GitHub Pages
   (`A`/`AAAA` to the Pages IPs, or `CNAME` for `www`).
3. Enable **Enforce HTTPS** once the certificate is issued.

`baseURL` is `https://prateeksharma.me/` — canonical links, sitemap, RSS, and
Open Graph URLs all use it, never the `*.github.io` host.

### Migrating off the old workflow

The previous setup committed generated HTML into `pratts/pratts.github.io` and
tracked it as a `public/` submodule in the source repo. That is gone. The old
`pratts.github.io` repo can be kept for a while as a redirect/legacy holder but is
no longer part of development. This repo is the single source of truth.

---

## SEO / web

Configured: canonical URLs, per-page `<title>`/description, Open Graph + Twitter
cards, JSON-LD (`Person` on the homepage, `BlogPosting` on posts/opinions/notes),
`sitemap.xml`, `robots.txt`, and RSS for the home page, every section (including
`/blog/index.xml`, `/opinions/index.xml`, `/notes/index.xml`), and every
taxonomy term (`/tags/go/index.xml`, …).

## Analytics

[Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) — cookieless,
no consent banner required, reports page views (per path, so individual blog
posts show up separately), referrers, and real-user Core Web Vitals. Configured
in `data/analytics.yaml` (`cloudflare_token`); the beacon is only rendered in
production builds — `hugo server` never fires it, so local dev doesn't pollute
real traffic numbers. Clear the token to disable analytics entirely.

The domain's DNS is unproxied ("DNS only" in Cloudflare, required for the
GitHub Pages custom domain to work), so this uses Cloudflare's manual-setup
snippet rather than edge auto-injection — that's why the beacon is in
`layouts/_partials/site/head.html` instead of just a dashboard toggle.

## Accessibility

Semantic landmarks, a skip link, visible focus rings, keyboard-navigable menus
(no JS-only navigation), `prefers-reduced-motion` handling, alt text on images,
and a light/dark theme that redefines tokens rather than inverting colours.

## Credits

Design language, terminal concept, and CSS component system adapted from
[Nerdy](https://github.com/hugo-themes/nerdy) by Emruz Hossain, MIT licensed.
