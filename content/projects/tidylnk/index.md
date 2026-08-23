+++
date = '2026-08-23T00:00:00+05:30'
draft = false
title = 'Tidylnk.com'

readTime = true
autonumber = false
tags = ["Golang", "React", "Redis", "PostgreSQL", "Docker", "Railway"]
showTags = true
hideBackToTop = true

parent = "projects"
ancestor = "projects"
+++

[Tidylnk.com](https://admin.tidylnk.com/) is a URL shortener service I built to have a simple, self-hosted alternative to the usual third-party link shorteners, with an admin panel to manage and track links.

## Tech Stack

- **Backend**: Golang, serving the redirect and link-management APIs.
- **Frontend**: React-based admin panel for creating, organizing, and tracking shortened links.
- **Storage**: PostgreSQL as the primary datastore for link records, with Redis used for fast lookups on the redirect hot path.
- **Deployment**: Both the backend and database are containerized with Docker and deployed on Railway.

## Why I Built It

I wanted a link shortener I fully controlled — no reliance on a third party's uptime, rate limits, or analytics restrictions — and a project to exercise Golang and Redis together on a workload where caching genuinely matters: redirect latency.

It's also the link shortener behind other project links I share, including the [TTS Study Assistant](/projects/tts-study-assistant) Chrome Web Store listing.

## Links
- [Admin Panel](https://admin.tidylnk.com/)
