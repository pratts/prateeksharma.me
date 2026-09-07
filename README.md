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
│   ├── resume.md           # /resume/
│   ├── experience/         # one page bundle per company
│   ├── projects/           # one page bundle per project
│   ├── open-source/         # one file per contribution
│   ├── blog/               # one page bundle per post
│   ├── opinions/            # one file per opinion
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
/experience/              /experience/<company>/
/projects/                /projects/<project>/
/open-source/             /open-source/<slug>/
/blog/                    /blog/<post>/
/opinions/                /opinions/<slug>/
/books/                   /books/<book>/
/books/reviews/           /books/reading-list/
/resume/
```

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
matching blog posts, opinions, projects, books, experience, and open-source
entries — that's the "knowledge graph."

### Add a blog post

```bash
hugo new blog/my-post/index.md      # page bundle — lets you add images alongside
```

Edit the front matter (`description`, `categories`, `tags`), set `draft = false`,
write the body. `##` / `###` headings feed the floating table of contents. Drop
`cover.jpg` or `hero.jpg` in the folder for a hero image. Optional
`related = ['/projects/x/', '/books/y/']` adds explicit "related" links (taxonomy
matches are added automatically).

### Add an opinion

```bash
hugo new opinions/my-take.md
```

A single file (no bundle needed). One or two paragraphs is fine — the listing is
built for short posts.

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

### Profile & homepage identity — `data/profile.yaml`

Name, title, `tagline`, `intro`, `status`, `links` (each `{ icon, label, url }`
where `icon` is a file in `assets/icons/`), `stats` (`{ label, value, accent }` —
keep these truthful, no vanity metrics), and `stack` (the curated homepage list).

### Homepage sections — `data/home.yaml`

`sections` is an ordered list of `{ type, title, icon, limit }`. `type` maps to
`layouts/_partials/home/sections/<type>.html`. Reorder, retitle, or drop sections
here. Featured projects come from `featured: true`; the rest are "most recent N".

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
- **Résumé PDF:** currently links to Google Drive (see `content/resume.md`). To
  self-host, drop `static/resume.pdf` and change the link to `/resume.pdf`.

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
cards, JSON-LD (`Person` on the homepage, `BlogPosting` on posts/opinions),
`sitemap.xml`, `robots.txt`, and RSS for the home page, every section, and every
taxonomy term (`/blog/index.xml`, `/tags/go/index.xml`, …).

## Accessibility

Semantic landmarks, a skip link, visible focus rings, keyboard-navigable menus
(no JS-only navigation), `prefers-reduced-motion` handling, alt text on images,
and a light/dark theme that redefines tokens rather than inverting colours.

## Credits

Design language, terminal concept, and CSS component system adapted from
[Nerdy](https://github.com/hugo-themes/nerdy) by Emruz Hossain, MIT licensed.
