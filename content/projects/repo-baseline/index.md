---
title: Repo Baseline
date: 2026-10-25
draft: false
featured: false
lastmod: 2026-11-24T18:00:00Z
description: "A script that applies the same branch-protection and repo settings across my GitHub repositories in one command."
status: maintained
categories: [Developer Tools]
tags: [Shell, GitHub, Automation]
tech: [Shell, GitHub CLI, jq]
code: https://github.com/pratts/repo-baseline
---

Every new repo I create needs the same handful of settings: branch
protection, required reviews, no force pushes. Setting that up by hand in
GitHub's UI every time is the kind of small, repetitive chore that's easy to
skip, which is exactly when a repo ends up without it. [Repo Baseline](https://github.com/pratts/repo-baseline)
is a single script that applies it consistently instead.

## What it sets

Running `scripts/apply-baseline.sh <owner/repo> [check name]...` applies a
ruleset on the default branch: changes only land through a pull request with
at least one approving review, every commit must be signed, and force pushes
are blocked. Any status checks you pass in must pass before a merge is
allowed, and nobody can bypass them. It also turns on `delete_branch_on_merge`, so a PR's branch is
cleaned up automatically once it merges. Re-running the script is safe — if a
repo already has the ruleset, it's backed up locally and updated in place
rather than duplicated.

## Required checks get their own ruleset

The first version put everything in one ruleset, including a bypass so I could
merge my own PRs: GitHub won't let you approve your own pull request. That
turned out to be a hole. A bypass applies to every rule in its ruleset, so it
also let me merge while a required check was running or failing. Required
checks now live in a second ruleset with no bypass at all, so the approval can
be skipped for my own PRs but the checks can't. Re-running with no check names
on a repo that already has that ruleset leaves it alone with a warning,
rather than silently dropping the checks.

## Dropping the skill layer it started with

The first version paired the script with a Claude Code skill and an
installer, so it could be set up and invoked through Claude Code directly.
In practice I was just running the script from the terminal, and the extra
layer was more to maintain than it was saving me. I cut it back to the plain
script and its two JSON settings files — the README now covers exactly how
to use it and nothing else. It's a small reminder that not every tool needs
to be wrapped in automation; sometimes a script you run by hand is the
simpler, more maintainable choice.
