---
title: git-why
date: 2026-09-16
draft: false
featured: false
description: "A Claude Code skill that captures the design reasoning behind non-trivial commits as git notes, so the 'why' stays retrievable from the terminal long after the chat that produced it is gone."
status: experiment
categories: [Developer Tools]
tags: [Shell, Git, Claude Code, Developer Tools]
tech: [Shell]
code: https://github.com/pratts/git-why
---

Chat history is where most of the reasoning behind a commit actually lives:
why an approach was chosen, what alternative got rejected, what constraint
ruled out the simpler option. None of that survives once the conversation is
gone, even though `git log` still has the commit. [git-why](https://github.com/pratts/git-why)
is a Claude Code skill that closes that gap by writing the reasoning
directly onto the commit itself, as a `git notes` entry.

## How it works

Claude applies the skill in two situations: right after a commit that
involved real design reasoning, and whenever asked "why does this exist" or
"why was this done this way" about existing code. Not every commit gets a
note. Mechanical changes (formatting, dependency bumps, typo fixes) are
skipped on purpose. A note only earns its place if it answers a question
someone will actually ask while staring at the code later, rather than
restating what the diff already shows.

Three scripts back the workflow:

- `git-why.sh <file> [line]`: find the commit(s) that touched a file or line
  and print any note attached.
- `git-notes-grep.sh <keyword>`: search every note in the repo for a
  keyword, for when you remember the concept but not the file.
- `git-why-record.sh`: a coverage check, walking history from newest to
  oldest to report which recent commits still have no note.

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
