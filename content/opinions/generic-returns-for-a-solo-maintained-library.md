---
title: "Generic returns can be the right call for a library you maintain alone"
date: 2026-08-26
draft: false
description: "Typed response structs are the default advice. For a one-person library wrapping a churny upstream API, `(any, error)` was the cheaper long-term choice."
categories: [Programming, Engineering]
tags: [Go, API Design, Libraries, Trade-offs]
related:
  - /blog/endpoint-maps-over-hand-rolled-methods/
  - /projects/wazirx-connector-go/
---

The standard advice for a client library is: give callers typed responses.
`client.Ticker(...) (*Ticker, error)`, not `(any, error)`. I went the other way
in my [WazirX Go connector](/projects/wazirx-connector-go/) and I still think it
was right *for that library*.

The upstream API's response shapes move around — objects that become arrays,
fields that appear and vanish across endpoints. With ~25 endpoints and one
maintainer (me, in spare hours), typed structs would mean 25 things to keep in
sync with an API I don't control and can't see changes to until they ship. The
generic return pushed that cost to the call site, where the caller already knows
which two fields they want and can assert for them.

If this had a team, downstream users with a compatibility promise, or a
code-generator fed by an OpenAPI spec, I'd choose typed responses without
thinking about it. The point isn't "generic returns are fine." It's that "always
return typed structs" is a rule with a maintenance cost, and a solo project with
a churny dependency is exactly where that cost outweighs the benefit.
