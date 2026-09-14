---
title: "Added an e-filing JSON validator to India ITR Copilot"
date: 2026-08-02
draft: false
contribution_type: pr
project: Loki200399/india-itr-copilot
link: https://github.com/Loki200399/india-itr-copilot/pull/2
status: "Open"
description: "Turned bugs found while hand-filing a real ITR-3 return into a reusable validator module and test suite for the project's e-filing JSON generator."
categories: [Programming]
tags: [Python, Validation, Testing]
---

While hand-building a government-schema ITR-3 JSON for AY 2026-27, importing
it into the tax department's own e-filing utility, and correcting it against
that utility's re-export, I found several bugs that passed the project's
existing JSON-schema validation with zero errors the whole time: a
capital-gains total that gets silently recomputed to zero on import if its
detail schedule isn't patched alongside it, an exemption that actually
belongs in a different section than the schema implies, a table that needs
exact rather than approximate equality with another schedule, a negative
carry-forward value from a zero-deduction claim, and a contact field left at
a skeleton default.

I turned those into a reusable module, a validator script with the concrete
cross-schedule checks, and a test for each one, wired into the project's
existing filer workflow for anyone who wants the raw portal-schema JSON
rather than just the data pack. Open as
[#2](https://github.com/Loki200399/india-itr-copilot/pull/2).
