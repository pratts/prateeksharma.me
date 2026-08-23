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

[WazirX](https://wazirx.com) is one of India's largest crypto exchanges, but it doesn't publish an official Go client. [wazirx-connector-go](https://github.com/pratts/wazirx-connector-go) is the unofficial Go client I built and open-sourced to fill that gap.

## What It Covers

- **General & market data** — ping, server time, system status, exchange info, tickers, order book depth, trades, and klines/candlesticks.
- **Trading** — creating, querying, and cancelling limit and stop-limit orders, plus a test-order endpoint for validating requests before they hit the matching engine.
- **Account & funds** — balances, fund info, and sub-account management (listing, transfer history, and fund transfers).
- **Crypto operations** — coin info, deposit addresses, withdrawal history, and withdrawals.

Signed requests automatically inject the `timestamp`, `recvWindow`, and an HMAC-SHA256 `signature`, so callers never have to build these by hand. Configuration is handled through functional options (`WithHTTPClient`, `WithRecvWindow`, `WithBaseURL`), and non-2xx responses surface as a typed `*APIError` with the status code and response body attached.

```go
client := wazirx.New("your-api-key", "your-secret-key")
depth, err := client.Depth(ctx, "btcinr", 10)
```

## Recognition

The library has been acknowledged by WazirX's co-founder, and I've gone back to update it with new endpoints as the exchange's API evolved.

## Links
- [GitHub Repository](https://github.com/pratts/wazirx-connector-go)
