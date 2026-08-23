# prateeksharma.me

My personal website, built with [Hugo](https://gohugo.io) using the [typo](https://github.com/tomfran/typo) theme.

## Prerequisites

- [Hugo (extended version)](https://gohugo.io/installation/) — v0.165.0 or newer
- Git (with submodule support)

## Getting started

Clone the repo along with its submodules (the `typo` theme and the `public` deploy target both live in separate git repos):

```bash
git clone --recurse-submodules git@github.com:pratts/prateeksharma.me.git
cd prateeksharma.me
```

If you already cloned without `--recurse-submodules`, initialize them afterwards:

```bash
git submodule update --init --recursive
```

## Local development

Run the Hugo dev server with live reload:

```bash
hugo server -D
```

This serves the site at `http://localhost:1313/`. The `-D` flag includes draft content (`draft = true` in front matter).

## Building the site

Generate the static site into the `public/` directory:

```bash
hugo
```

To build including draft/future content:

```bash
hugo -D -F
```

## Adding content

New posts/pages can be scaffolded with the Hugo CLI, which applies the archetypes in `archetypes/`:

```bash
hugo new content posts/my-new-post.md
```

## Deploying

The `public/` directory is a git submodule pointing at the [pratts.github.io](https://github.com/pratts/pratts.github.io) repository, which serves the site via GitHub Pages.

To publish a new build:

```bash
hugo                       # regenerate public/
cd public
git add .
git commit -m "Publish site update"
git push
cd ..
git add public
git commit -m "Update public submodule reference"
git push
```

## Project structure

- `content/` — site content (Markdown pages and posts)
- `layouts/` — custom layout overrides on top of the `typo` theme
- `assets/` — images and other assets referenced by content/layouts
- `static/` — files copied as-is to the site root
- `themes/typo/` — the Hugo theme (git submodule)
- `public/` — generated site output (git submodule, deployed via GitHub Pages)
- `hugo.toml` — site configuration
