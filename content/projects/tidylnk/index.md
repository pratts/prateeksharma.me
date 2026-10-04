---
title: Tidylnk
date: 2026-08-23
draft: false
featured: false
lastmod: 2026-09-28T06:54:01Z
description: "A self-hosted URL shortener with a React admin panel, built with Go, Redis, and PostgreSQL."
status: live
categories: [Developer Tools, Backend]
tags: [Go, React, Redis, PostgreSQL, Docker, Railway, Caching]
tech: [Go, React, Redis, PostgreSQL, Docker]
code: https://github.com/pratts/url-shortener
live: https://admin.tidylnk.com/
related:
  - /projects/tts-study-assistant/
---

[Tidylnk](https://admin.tidylnk.com/) is a URL shortener I built to have a
simple, self-hosted alternative to the usual third-party link shorteners, with an
admin panel to manage and track links.

## Tech stack

- **Backend:** two separate Go services sharing one codebase, an admin API
  for account and link management, and a redirect service that resolves
  short links and records clicks. Postgres and Redis sit on a private
  network that only those two services can reach, not even published Docker
  ports.
- **Frontend:** a React admin panel ([separate repo](https://github.com/pratts/url-shortener-admin),
  Vite, TypeScript, shadcn/ui) for creating, organizing, and tracking
  shortened links, generating QR codes for them, and managing the account.
- **Storage:** PostgreSQL as the primary datastore for link records, with Redis
  on the redirect hot path for fast lookups.
- **Deployment:** backend and database containerized with Docker and deployed on
  Railway.

## Decisions worth noting

### Clicks never block a redirect

Click recording writes happen in batches off the request path rather than
inline with the redirect. If the database falls behind and the in-memory
queue backs up past 10,000 pending clicks, further clicks are dropped and
counted in the logs rather than slowing redirects down or blocking on a
write. A redirect staying fast matters more than never losing a click.

### A strict CSP without `unsafe-eval`

The admin panel runs Zod for form validation, which normally needs
`new Function()` for its JIT-compiled parsers, incompatible with a CSP that
doesn't allow `unsafe-eval`. Running Zod in jitless mode gives up some
validation throughput in exchange for a CSP with no `unsafe-eval` exception
at all.

## Why I built it

I wanted a link shortener I fully controlled, with no reliance on a third party's
uptime, rate limits, or analytics restrictions, and a project to exercise Go and
Redis together on a workload where caching genuinely matters: redirect latency.

It's also the link shortener behind other project links I share, including the
[TTS Study Assistant](/projects/tts-study-assistant/) Chrome Web Store listing.
