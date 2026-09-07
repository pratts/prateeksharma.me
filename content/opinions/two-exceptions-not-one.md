---
title: "Give callers two error types, one extending the other"
date: 2026-08-28
draft: false
description: "A single catch-all exception forces every call site to over-handle. Two types in a hierarchy let each caller pick its own granularity."
categories: [Programming, Engineering]
tags: [Java, Error Handling, API Design]
related:
  - /projects/wazirx-connector-java/
---

In the [WazirX Java connector](/projects/wazirx-connector-java/) I split errors
into two:

- `WazirxClientException` — the caller made a mistake the caller can fix: a bad
  `side` value, a missing required field. Thrown before a request is even sent.
- `WazirxApiException` — something went wrong once the request left the process:
  a network failure, a non-2xx response.

`WazirxClientException extends WazirxApiException`. That one line is the whole
design. A caller who only cares "did this work?" catches the parent. A caller who
wants to retry network failures but fail fast on their own bad input catches both
separately. Nobody is forced into a giant `catch (Exception e)` that swallows
bugs, and nobody has to `try/catch` five specific types at every call site.

The general version: when you're deciding how many error types to expose, the
question isn't "how many kinds of failure are there" — it's "how many *different
responses* will a caller reasonably want to take." Here it's two. So: two types,
in a hierarchy, so callers can opt into the distinction or ignore it.
