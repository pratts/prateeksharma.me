---
title: Tidylnk
date: 2026-08-23
draft: false
featured: true
description: "A self-hosted URL shortener with a React admin panel, built with Go, Redis, and PostgreSQL."
status: live
categories: [Developer Tools, Backend]
tags: [Go, React, Redis, PostgreSQL, Docker, Railway, Caching]
tech: [Go, React, Redis, PostgreSQL, Docker]
live: https://admin.tidylnk.com/
related:
  - /projects/tts-study-assistant/
---

[Tidylnk](https://admin.tidylnk.com/) is a URL shortener I built to have a
simple, self-hosted alternative to the usual third-party link shorteners, with an
admin panel to manage and track links.

## Tech stack

- **Backend** — Go, serving the redirect and link-management APIs.
- **Frontend** — a React admin panel for creating, organizing, and tracking
  shortened links.
- **Storage** — PostgreSQL as the primary datastore for link records, with Redis
  on the redirect hot path for fast lookups.
- **Deployment** — backend and database containerized with Docker and deployed on
  Railway.

## Why I built it

I wanted a link shortener I fully controlled — no reliance on a third party's
uptime, rate limits, or analytics restrictions — and a project to exercise Go and
Redis together on a workload where caching genuinely matters: redirect latency.

It's also the link shortener behind other project links I share, including the
[TTS Study Assistant](/projects/tts-study-assistant/) Chrome Web Store listing.
