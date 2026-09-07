---
title: CoinTracker
company: CoinTracker
role: Software Engineer
date: 2025-09-01
start: "Sep 2025"
end: "Apr 2026"
location: Remote
draft: false
description: "Blockchain integrations and fault-tolerant wallet-sync workflows for a crypto portfolio and tax platform."
categories: [Distributed Systems, Backend]
tags: [Python, Flask, Temporal, Snowflake, Blockchain, pytest, Reconciliation]
---

CoinTracker is a crypto portfolio and tax platform. I worked on the ingestion
and reconciliation side: getting on-chain data into the system correctly, and
keeping wallet balances consistent across chains.

## Engineering areas

### Blockchain integrations

- Integrated **Cardano** and **Stellar**, reading on-chain data from Snowflake
  for balance reconciliation, transaction parsing, and portfolio tracking.
- Onboarded **Akash** and **Axelar** (cross-chain), plus **Bitcoin Ordinals,
  Inscriptions, BRC-20, and Runes** via the Ordiscan API.
- Worked behind a unified blockchain abstraction so each new chain was a smaller,
  more predictable piece of work than the last.

### Fault-tolerant wallet sync

- Wrote the business logic behind **Temporal** workers for wallet-sync
  workflows: idempotent, retry-safe, and consistent across chains.
- Built reconciliation pipelines and validation checks so cross-chain data
  disagreements surface as failures rather than silently wrong balances.

### Data tooling

- Built and consumed **Flask** REST APIs and CLI scripts for ingestion,
  validation, and reconciliation.
- Used **pytest** and **mypy** to keep correctness and type safety enforced in
  CI.
- Adopted Claude Code as an agentic assistant for feature work, debugging, and
  issue resolution.

## Stack

Python · Flask · Temporal · Snowflake · pytest · mypy
