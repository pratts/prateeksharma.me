---
title: "Added stats metrics to the Meilisearch Java client"
date: 2025-03-31
draft: false
contribution_type: pr
project: meilisearch/meilisearch-java
link: https://github.com/meilisearch/meilisearch-java/pull/830
status: "Merged"
description: "Added usedDatabaseSize plus per-index document and embeddings metrics to the Java client's stats object, mirroring what I'd already added to the Go client."
categories: [Backend]
tags: [Java, Meilisearch, API, Observability]
related:
  - /open-source/meilisearch-go-stats-metrics/
  - /experience/emission-critical/
---

Same gap as the [Go client](/open-source/meilisearch-go-stats-metrics/), on
the Java side: the `stats` object was missing fields the Meilisearch API
already exposes. This PR closed three open issues
([#819](https://github.com/meilisearch/meilisearch-java/issues/819),
[#820](https://github.com/meilisearch/meilisearch-java/issues/820),
[#821](https://github.com/meilisearch/meilisearch-java/issues/821)) in one
change, adding `usedDatabaseSize` to stats and both document-count and
embeddings metrics per index. Merged as
[#830](https://github.com/meilisearch/meilisearch-java/pull/830).
