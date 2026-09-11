# prateeksharma.me — editorial redesign

Source for [prateeksharma.me](https://prateeksharma.me/), on the
`editorial-redesign` branch: a minimal, typography-first personal engineering
site. Content is unchanged from the previous (Nerdy-based) design, preserved on
the `nerdy-redesign` branch — this branch replaces the presentation layer
entirely.

Inspiration: the editorial, writing-first restraint of `arnav.tech` combined
with the breadth of an engineer's personal knowledge base (projects, writing,
open source, books) in the spirit of `arpitbhayani.me`. Neither site's content,
layout, or markup was copied — see [Design philosophy](#design-philosophy).

## Branches

```text
main                 — whatever is currently live
nerdy-redesign       — the previous Nerdy-based design (preserved, frozen)
editorial-redesign   — this branch
```

To compare the two designs locally, `git worktree add ../nerdy-preview
nerdy-redesign` and run `hugo server` in each checkout on different ports, or
just `git switch` between them and re-run `hugo server`.

## Quick start

```bash
hugo server
```

That's it. **No Node, no npm, no build tool.** Hugo's own asset pipeline
(`resources.Get`, `minify`, `fingerprint`, and `js.Build` — which uses Hugo
Extended's embedded esbuild) handles the one CSS file and one JS file this site
ships. You need **Hugo extended ≥ 0.165**.

```bash
hugo server              # dev server with live reload, http://localhost:1313
hugo server -D           # include draft content
hugo --gc --minify       # production build to public/
```

## Design philosophy

Typography and whitespace carry the visual identity — not components. Concretely:

- **One reading measure.** Prose maxes out at `40rem`; listings and chrome at
  `46rem`. Single column throughout — no sidebar, no dashboard grid.
- **Two typefaces, both system fonts.** A serif stack (`Georgia, "Iowan Old
  Style", ...`) for headings and titles; a system sans stack for UI text and
  body copy. Zero font files are downloaded.
- **One accent colour** (a muted terracotta in light mode, warm amber in dark),
  used only for links and hover states — not a four-colour accent system.
- **Hairline borders, not cards.** Lists (`entry-list`) separate items with a
  1px top border, not boxes with shadows.
- **No icons.** Public links, nav, and metadata are plain text.
- **No JavaScript-driven components.** The mobile menu is a native `<details>`;
  dark mode defaults to `prefers-color-scheme` and is only *overridable* via
  JS. Code-copy buttons and the Mermaid loader are the only JS-dependent
  affordances, and both are strictly additive — nothing breaks without them.

This is a deliberate contrast with `nerdy-redesign` (Tailwind, Alpine.js, a
terminal, a profile sidebar, a four-accent card system) — see `git diff
nerdy-redesign editorial-redesign --stat` for the scope of the change.

## Architecture

```text
.
├── archetypes/            # `hugo new` templates, one per content type
├── assets/
│   ├── css/editorial.css   # the entire design system, one file
│   ├── js/
│   │   ├── theme-init.js    # tiny, inlined, blocking — no theme flash
│   │   └── main.js          # theme toggle, code-copy, mermaid loader
│   └── images/profile.jpg   # profile photo — replace this file to change it
├── content/
│   ├── about.md  resume.md
│   ├── writing/_index.md   # hub page — reads data/navigation.yaml's
│   │                       #   Writing > children to list Blog+Opinions+Notes
│   ├── blog/  opinions/  notes/     # each a flat Hugo section
│   ├── projects/           # page bundles, one per project
│   ├── open-source/        # one file per contribution
│   ├── experience/         # page bundles, one per company
│   └── books/
│       ├── <slug>/index.md  # one page bundle per book (+ cover.jpg)
│       ├── reviews/          # /books/reviews/   (layout: reviews)
│       └── reading-list/     # /books/reading-list/  (layout: reading-list)
├── data/
│   ├── profile.yaml        # name, title, photo, intro, links
│   └── navigation.yaml     # nested nav model (see below)
├── layouts/
│   ├── baseof.html  index.html  page.html  section.html
│   ├── taxonomy.html  term.html
│   ├── _partials/
│   │   ├── article/{page,list}.html   # shared blog+opinions+notes templates
│   │   ├── components/                # entry, book, toc, related, ...
│   │   └── site/                      # head, header, footer, seo, assets
│   ├── _markup/            # Markdown render hooks (images → figure, links)
│   ├── _shortcodes/mermaid.html
│   └── <section>/{section,page}.html  # projects, experience, open-source, books
├── static/CNAME
├── .github/workflows/deploy.yml
└── hugo.toml
```

### Why no Node this time

The previous design used Tailwind CSS (via `@tailwindcss/cli`) and Alpine.js,
which meant `npm install`, a two-pass build to generate `hugo_stats.json` for
Tailwind's content scanning, and a `security.exec.allow` entry so Hugo could
shell out to the Tailwind binary. An editorial, mostly-static design doesn't
need a utility-class framework or a reactive component library — hand-written
CSS is a few hundred lines here, and the JS is four small, independent
enhancements. Dropping Node removes an entire toolchain and its failure modes
for a personal site that changes rarely.

### Extensible navigation and content model

`data/navigation.yaml`'s `main` list is what the header renders — flat, by
design (see the philosophy above: no dropdown menus). Each entry may also carry
`children`, which the **hub pages** (`/writing/`, `/books/`) read directly to
know which sections/filters to pull from:

```yaml
- name: Writing
  url: /writing/
  children:
    - { name: Blog, url: /blog/, section: blog }
    - { name: Opinions, url: /opinions/, section: opinions }
    - { name: Notes, url: /notes/, section: notes }
```

Adding a fourth writing kind (say, Essays) is: create `content/essays/`, add
`layouts/essays/section.html` and `page.html` that each delegate to
`_partials/article/list.html` / `article/page.html` (copy the three lines from
`layouts/blog/*.html`), add one entry under `children` here, and add it to the
`$sectionOrder` list in `layouts/term.html` if you want it to show up in
tag/category aggregation. No other template changes.

### URL structure

```text
/                         /categories/            /tags/
/writing/                 /categories/<name>/     /tags/<name>/
/blog/  /blog/<post>/
/opinions/  /opinions/<slug>/
/notes/  /notes/<slug>/
/projects/  /projects/<project>/
/open-source/  /open-source/<slug>/
/experience/  /experience/<company>/
/books/  /books/<book>/  /books/reviews/  /books/reading-list/
/about/  /resume/
```

## Editing content

Categories (broad) and tags (specific) are shared by every content type, so a
tag/category page aggregates blog, opinions, notes, projects, open-source, and
books.

### Add a blog post / opinion / note

```bash
hugo new blog/my-post/index.md        # page bundle, for images
hugo new opinions/my-take.md          # single file
hugo new notes/some-fact.md           # single file
```

All three share one archetype pattern and one template
(`_partials/article/*.html`) — only the eyebrow label and reading-time display
differ, both derived from the section. `##`/`###` headings feed a collapsible
Contents box once a post has three or more. Drop `cover.jpg` or `hero.jpg` in a
blog post's bundle for a hero image.

### Add an image or a diagram

Page bundles: put the image file next to `index.md` and reference it with plain
Markdown — a render hook wraps it in `<figure>` (with a caption if the image has
a Markdown title) and generates a resized WebP. For a diagram-as-code, use the
Mermaid shortcode:

```text
{{</* mermaid */>}}
graph TD
  A[Client] --> B[API] --> C[(Postgres)]
{{</* /mermaid */>}}
```

Mermaid's JS is fetched from a CDN only on pages that actually use the
shortcode (see `initMermaid` in `assets/js/main.js`) — every other page pays
nothing for it. Static PNG/SVG/JPEG diagrams always work with no JavaScript.

### Add a project

```bash
hugo new projects/my-project/index.md
```

`code` / `live` URLs, `featured: true` to surface it on the homepage, `tech =
[...]`. Add `architecture.png` / `diagram.png` / `flow.png` for the hero figure
and `screenshot-*.png` for a gallery.

### Add an open-source contribution

```bash
hugo new open-source/what-i-did.md
```

`contribution_type` is one of `pr`, `issue`, `bug`, `discussion`, `docs`,
`other`; `project = 'owner/repo'`; `link` is the PR/issue URL. This is a
hand-maintained log, not a GitHub API sync.

### Add experience

```bash
hugo new experience/company-name/index.md
```

One bundle per **company** — cover role progression in the body, not as
separate entries. `date` is the start date (drives ordering); `start`/`end` are
the display strings.

### Add a book / review

```bash
hugo new books/the-book-title/index.md
```

`status` (`want-to-read` | `reading` | `read` | `paused` | `abandoned`),
optional `rating` (1–5), `started`/`finished`, `priority` (reading-list order).
Drop `cover.jpg` in the bundle — without one, a text placeholder renders. Set
`review: true` and write the review in the body to have it appear on
`/books/reviews/` (a paragraph is a valid review).

## Configuration

- **`data/navigation.yaml`** — header (`main`, flat) and footer (`footer`,
  grouped) links; also the source of truth `/writing/` and `/books/` hub pages
  read for their sub-navigation and section lists.
- **`data/profile.yaml`** — name, title, tagline, `intro` (the homepage
  paragraph), `currently`, and `links` (plain `{label, url}` pairs, rendered as
  text, not icon buttons).
- **Profile photo** — replace `assets/images/profile.jpg` (roughly square).
  Hugo generates the resized/OG variants; no template change needed.
- **Résumé** — `content/resume.md` currently links to the existing Google Drive
  PDF. To self-host, drop `static/resume.pdf` and update the link.

## Deployment

`.github/workflows/deploy.yml` triggers on push to `main`: install Hugo
extended, `hugo --gc --minify`, upload the Pages artifact, deploy. No Node step,
no generated output committed, no `public/` submodule. `static/CNAME` pins the
custom domain; `baseURL` is `https://prateeksharma.me/`, used everywhere
(canonical links, sitemap, RSS, Open Graph).

**This branch does not deploy anything by itself** — the workflow only fires on
`main`. Merge `editorial-redesign` into `main` (after comparing it against
`nerdy-redesign` and deciding) to go live.

**One-time GitHub setup** (if not already done): Settings → Pages → Build and
deployment → Source: **GitHub Actions**; Settings → Pages → Custom domain:
`prateeksharma.me`; enable Enforce HTTPS once the certificate issues.

## SEO / accessibility

Canonical URLs, per-page title/description, Open Graph + Twitter cards,
JSON-LD (`Person` on the homepage, `BlogPosting` on blog/opinions/notes),
`sitemap.xml`, `robots.txt`, RSS for the home page, every section, and every
taxonomy term. Semantic landmarks, a skip link, visible focus rings, a
correct (non-skipping) heading hierarchy, alt text on every image, keyboard-
and no-JS-navigable menus, and `prefers-reduced-motion` handling.

## What's still a TODO

- **Books** are a starter reading list (all `want-to-read`) — replace with your
  actual shelf, add `cover.jpg` files, write reviews as you finish books.
- **Open Source** has one real entry (the OpenVoice patch). Add your actual
  PRs/issues on other repos.
- Run `hugo server` and eyeball light/dark + mobile (375/768px) before merging
  to `main`.
