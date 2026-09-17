---
title: "Added a Claude Code skill to audit the WazirX Postman collection against its docs"
date: 2026-09-02
draft: false
contribution_type: pr
project: WazirX/wazirx-api-postman
link: https://github.com/WazirX/wazirx-api-postman/pull/8
status: "Open"
description: "Turned the manual audit process behind PR #7 into a repeatable Claude Code Skill anyone maintaining the repo can invoke to check the collection against docs.wazirx.com and fix drift."
categories: [Developer Tools]
tags: [WazirX, Postman, Claude Code, Automation]
related:
  - /open-source/wazirx-postman-spec-alignment/
---

[PR #7](/open-source/wazirx-postman-spec-alignment/) fixed one concrete case
of the Postman collection drifting from the live API: a wrong endpoint path
and misplaced parameters on the Crypto Withdraw request. Since this
collection is treated as ground truth by third-party tooling built against
it, that kind of drift has a blast radius beyond the repo itself, so I
turned the process I used to find and fix it into a
[Claude Code Skill](https://github.com/WazirX/wazirx-api-postman/pull/8):
a plain Markdown file (`.claude/skills/wazirx-postman-docs-sync/SKILL.md`)
with instructions for an agent to fetch the real spec, compare method, path,
parameter location, and types against each existing request, fix confirmed
drift, and flag anything ambiguous rather than guess.

It's inert unless explicitly invoked, adds one file, and touches nothing
else in the collection. Open as
[#8](https://github.com/WazirX/wazirx-api-postman/pull/8).
