---
title: "Added stats metrics to the Meilisearch Go client"
date: 2025-03-30
draft: false
contribution_type: pr
project: meilisearch/meilisearch-go
link: https://github.com/meilisearch/meilisearch-go/pull/621
status: "Merged"
description: "Added usedDatabaseSize, per-index document count, and embeddings metrics to the Go client's stats response, across three small PRs."
categories: [Backend]
tags: [Go, Meilisearch, API, Observability]
related:
  - /experience/emission-critical/
---

I used Meilisearch at Emission Critical for full-text search over public
emission-factor databases. Separately, the Go client's `stats` response was
missing a few fields the Meilisearch API itself already returns: database
size, per-index document counts, and embeddings counts. I opened three small
PRs to close that gap:

- [#621](https://github.com/meilisearch/meilisearch-go/pull/621): adds
  `usedDatabaseSize` to `stats`.
- [#620](https://github.com/meilisearch/meilisearch-go/pull/620): adds
  `numberOfEmbeddedDocuments` and `numberOfEmbeddings` per index.
- [#619](https://github.com/meilisearch/meilisearch-go/pull/619): adds
  `rawDocumentDbSize` and `avgDocumentSize` per index.

Each was scoped to one issue the Meilisearch team had already filed
([#615](https://github.com/meilisearch/meilisearch-go/issues/615),
[#614](https://github.com/meilisearch/meilisearch-go/issues/614),
[#613](https://github.com/meilisearch/meilisearch-go/issues/613)), so the
change was mostly wiring the existing API fields through the SDK's response
struct. All three merged.
