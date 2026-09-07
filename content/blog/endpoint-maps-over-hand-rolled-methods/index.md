---
title: "Endpoint maps over hand-rolled methods"
date: 2026-08-25
draft: false
description: "When a client library wraps ~25 near-identical HTTP endpoints, describing them as data instead of writing 25 methods pays off — with one real trade-off."
categories: [Backend, Programming]
tags: [Go, API, API Design, REST, HTTP]
related:
  - /projects/wazirx-connector-go/
  - /opinions/generic-returns-for-a-solo-maintained-library/
---

I've now written two client libraries for the same exchange API — one in
[Go](/projects/wazirx-connector-go/), one in
[Java](/projects/wazirx-connector-java/) — and the thing I'd keep from both is
the same: don't write a method per endpoint. Describe the endpoints as data and
dispatch through one function.

## The shape of the problem

The API has roughly two dozen endpoints. They differ in four ways:

- HTTP verb (`GET`, `POST`, `DELETE`)
- path
- whether the request must be signed
- the response body

Everything else — building query params, adding a signature, choosing the verb
handler, parsing the response — is identical. Writing a hand-rolled method per
endpoint means writing that identical body 25 times, and then maintaining 25
copies of it when the signing scheme or the base URL handling changes.

## Endpoints as data

Instead, each endpoint is a row:

```go
var endpointMap = map[string]APIDetails{
    "ping":         {Client: "public", Action: actionGet,    URL: "/sapi/v1/ping"},
    "depth":        {Client: "public", Action: actionGet,    URL: "/sapi/v1/depth"},
    "create_order": {Client: "signed", Action: actionPost,   URL: "/sapi/v1/order"},
    "cancel_order": {Client: "signed", Action: actionDelete, URL: "/sapi/v1/order"},
    // ...
}
```

The public API is still one thin method per endpoint, because callers want
autocomplete and a real signature:

```go
func (c *Client) CancelOrder(ctx context.Context, p map[string]any) (any, error) {
    return c.call(ctx, "cancel_order", p)
}
```

But `call()` is the only place that knows *how* to make a request:

```go
func (c *Client) call(ctx context.Context, name string, params map[string]any) (any, error) {
    detail := c.apiDetails[name]
    if detail.Client == "signed" {
        params["recvWindow"] = c.recvWindow
        params["timestamp"] = time.Now().UnixMilli()
        params["signature"] = c.generateSignature(params)
    }
    switch detail.Action {
    case actionGet:    return c.get(ctx, detail.URL, params)
    case actionPost:   return c.post(ctx, detail.URL, params)
    case actionDelete: return c.delete(ctx, detail.URL, params)
    }
    return nil, fmt.Errorf("unknown action for %q", name)
}
```

Adding an endpoint is now a one-line map entry plus a three-line wrapper. Signing
is correct for every signed endpoint by construction, because there's exactly one
code path that signs.

## The trade-off I'd flag

To keep `call()` uniform, every method returns `(any, error)` rather than a typed
struct. Callers type-assert:

```go
data, err := client.Ticker(ctx, "btcinr")
ticker := data.(map[string]any)
```

That's genuinely worse to use than `client.Ticker(...) (*Ticker, error)`. I chose
it because the API's response shapes vary a lot — objects vs. arrays, fields that
appear and disappear — and I didn't want to chase every upstream change across 25
structs for a library I maintain alone. If this were a library with a team and a
compatibility promise, I'd probably eat the cost of typed responses and generate
them.

The endpoint map I'd keep regardless. The `any` return is the part to revisit
when the constraints change.
