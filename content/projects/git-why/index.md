---
title: git-why
date: 2026-09-16
draft: false
featured: true
lastmod: 2026-11-24T18:00:00Z
description: "Captures the design reasoning behind commits as git notes, via a git hook or an agent skill (Claude Code, Codex, Antigravity, Cursor), so the 'why' stays retrievable from the terminal long after the chat that produced it is gone."
status: experiment
categories: [Developer Tools]
tags: [Shell, Git, Claude Code, Codex, AI Agents, Developer Tools]
tech: [Shell]
code: https://github.com/pratts/git-why
---

Chat history is where most of the reasoning behind a commit actually lives:
why an approach was chosen, what alternative got rejected, what constraint
ruled out the simpler option. None of that survives once the conversation is
gone, even though `git log` still has the commit. [git-why](https://github.com/pratts/git-why)
closes that gap by writing the reasoning directly onto the commit itself, as a
`git notes` entry. It started as a Claude Code skill and is now tool-neutral: it
works the same whether an AI agent or a person made the commit.

## How it works

An agent applies the skill in two situations: right after a commit that
involved real design reasoning, and whenever asked "why does this exist" or
"why was this done this way" about existing code. Not every commit gets a
note. Mechanical changes (formatting, dependency bumps, typo fixes) are
skipped on purpose. A note only earns its place if it answers a question
someone will actually ask while staring at the code later, rather than
restating what the diff already shows.

Three scripts back the lookups:

- `git-why.sh <file> [line]`: find the commit(s) that touched a file or line
  and print any note attached.
- `git-notes-grep.sh <keyword>`: search every note in the repo for a
  keyword, for when you remember the concept but not the file.
- `git-why-record.sh`: a coverage check, walking history from newest to
  oldest to report which recent commits still have no note.

## Hook first, skill optional

The original version depended on a Claude Code hook, which meant it only worked
in one tool. It now has two independent entry points:

- **A `post-commit` git hook** that works for any tool and for you at a
  terminal. After a commit with no note, a human gets a one-line "why this
  change?" prompt (it gives up after 30 seconds); an agent with no terminal
  gets a reminder containing the exact `git notes append` command. It's
  skipped during rebase and cherry-pick.
- **A skill folder** (`SKILL.md` pointing at a shared `INSTRUCTIONS.md`) that
  Claude Code, Codex CLI, Antigravity and Cursor can all load, so the agent
  checks after each commit without any hook, including in repos that already
  have their own `post-commit`.

Agents surfaced two practical problems. A prompt nobody can answer hangs an
agent's terminal, so agents commit with `GIT_WHY_PROMPT=0`, which keeps the
reminder but never asks. And Codex's and `agy`'s default sandboxes make `.git`
read-only, so `git commit` and `git notes append` fail until the command is
approved. The README documents both.

## Installing it without leaving a trace in your repo

You clone git-why once, anywhere outside your other projects, and link it
in: the hook into a repo's `.git/hooks`, the skill into each tool's skills
folder. Either way, nothing from the clone is copied or committed into the
target repo. Everything is a **symlink** back to the clone, so there's no
nested `.git` to worry about and nothing to keep in sync by hand. Updating is
a `git pull` in the clone; uninstalling is removing the symlink. The cost is
that moving or deleting the clone breaks the links, and the hook then stops
running silently. (An earlier `install-skill.sh` that wrote Claude-specific
settings and exclude entries was dropped in favor of this.)

## The part that will bite someone

`git notes` live on their own ref, `refs/notes/commits`, which a normal
`git push`, `fetch`, or `clone` does not carry along. For a solo project
that's invisible. The moment the repo is shared, notes have to be pushed and
fetched explicitly, or a collaborator's clone will just look like the notes
never existed:

```bash
git push origin refs/notes/commits
git fetch origin refs/notes/commits:refs/notes/commits
```

The README leads with this caveat rather than burying it, since it's the
single most likely way the whole thing quietly stops working for someone
else.
