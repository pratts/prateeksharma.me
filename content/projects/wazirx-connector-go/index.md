+++
date = '2026-08-23T00:00:00+05:30'
draft = false
title = 'WazirX Go Connector'

readTime = true
autonumber = false
tags = ["Go", "Crypto", "REST API"]
showTags = true
hideBackToTop = true

parent = "projects"
ancestor = "projects"
+++

[WazirX](https://wazirx.com) is one of India's largest crypto exchanges, and while its REST API is well documented, it doesn't ship an official Go client. I wanted to poke at their API for a side project and didn't want to hand-roll request signing and endpoint plumbing every time, so I built [wazirx-connector-go](https://github.com/pratts/wazirx-connector-go) and open-sourced it once it was in decent shape.

## Avoiding ~25 Near-Identical Methods

The exchange exposes close to two dozen endpoints — tickers, order book depth, order placement, withdrawals, sub-account transfers, and so on. Writing a hand-rolled method for each one would have meant the same boilerplate repeated two dozen times: build params, sign if needed, pick GET/POST/DELETE, hit the URL, parse the response.

Instead, I modeled each endpoint as data — a name mapped to its HTTP verb, path, and whether it needs signing:

```go
var endpointMap = map[string]APIDetails{
    "ping":          {Client: "public", Action: actionGet, URL: "/sapi/v1/ping"},
    "depth":         {Client: "public", Action: actionGet, URL: "/sapi/v1/depth"},
    "create_order":  {Client: "signed", Action: actionPost, URL: "/sapi/v1/order"},
    "cancel_order":  {Client: "signed", Action: actionDelete, URL: "/sapi/v1/order"},
    // ...
}
```

Every public method — `Ping`, `Depth`, `CreateOrder`, `CancelOrder` — is then a thin wrapper that calls into a single `call()` dispatcher, which looks up the endpoint, signs it if needed, and routes to the right HTTP verb handler. Adding a new endpoint later meant adding one line to a map and one thin wrapper method, not a new hand-written request/response cycle.

The trade-off is that every method returns `(any, error)` rather than a typed struct, so callers cast the result themselves:

```go
data, err := client.Ticker(ctx, "btcinr")
ticker := data.(map[string]any)
fmt.Println(ticker["lastPrice"])
```

I went back and forth on this. Typed response structs are nicer to use, but WazirX's response shapes vary enough across endpoints (objects vs. arrays, optional fields) that keeping everything generic meant I didn't have to chase every field WazirX might add or rename. For a library I maintain alone, that was the right trade-off.

## Signing Without Making Callers Think About It

Signed endpoints need a `timestamp`, a `recvWindow`, and an HMAC-SHA256 signature computed over the request params. I didn't want anyone using the library to have to know that:

```go
func (client *Client) call(ctx context.Context, name string, params map[string]any) (any, error) {
    detail := client.apiDetails[name]
    if detail.Client == "signed" {
        params["recvWindow"] = client.recvWindow
        params["timestamp"] = time.Now().UnixMilli()
        params["signature"] = client.generateSignature(params)
    }
    // ... dispatch by detail.Action
}
```

This happens inside `call()`, once, regardless of which of the ~15 signed endpoints is being hit — so a new signed endpoint gets correct signing for free just by being added to the map.

## Configuration as Functional Options

Rather than a constructor with a growing list of positional arguments, `New` takes optional functional options:

```go
client := wazirx.New("your-api-key", "your-secret-key",
    wazirx.WithHTTPClient(&http.Client{Timeout: 10 * time.Second}),
    wazirx.WithRecvWindow(5000),
    wazirx.WithBaseURL("https://api.wazirx.com"),
)
```

This made it easy to point the client at a different base URL for testing, or swap in a custom `http.Client`, without touching the constructor signature every time I wanted one more knob.

## Where It's Landed

The library has been acknowledged by WazirX's co-founder, and I've gone back to add new endpoints as the exchange's API surface has grown — something the data-driven endpoint map made easy, since most additions are just a new map entry and a thin wrapper.

## Links
- [GitHub Repository](https://github.com/pratts/wazirx-connector-go)
