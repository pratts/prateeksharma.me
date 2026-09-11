---
title: "Composite index column order should match the query, not the schema"
date: 2026-08-30
draft: false
tags: [PostgreSQL, Databases, Performance]
related:
  - /projects/tts-study-assistant/
---

In the [TTS Study Assistant](/projects/tts-study-assistant/) notes table, queries
filter by `user_id` always and `domain` often, so the index is declared in that
order:

```sql
CREATE INDEX idx_uid_did ON notes(user_id, domain);
```

A composite index is only fully useful as a left-prefix: this index serves
`WHERE user_id = ?` and `WHERE user_id = ? AND domain = ?`, but not
`WHERE domain = ?` alone. The rule of thumb is to order columns by how the
queries actually filter — most selective / most-always-present first — not by
declaration order in the table, and not alphabetically.
