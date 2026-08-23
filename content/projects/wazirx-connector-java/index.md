+++
date = '2026-08-23T00:00:00+05:30'
draft = false
title = 'WazirX Java Connector'

readTime = true
autonumber = false
tags = ["Java", "Crypto", "REST API", "WebSocket"]
showTags = true
hideBackToTop = true

parent = "projects"
ancestor = "projects"
+++

[WazirX](https://wazirx.com) is one of India's largest crypto exchanges, but it doesn't publish an official Java client. [wazirx-connector-java](https://github.com/pratts/wazirx-connector-java) is the unofficial Java wrapper I built and open-sourced to fill that gap, covering both the REST API and WebSocket streams.

## What It Covers

- A `Client` implementing `Closeable`, backed by a pooled HTTP client, for all REST endpoints (general, market data, orders, account, crypto, sub-accounts).
- A `SocketClient` that connects to WazirX's live stream, keeps itself alive with periodic pings, and supports both public streams (trades, market ticker, depth) and private, authenticated streams (account updates, order updates, own trades).
- A small exception hierarchy — `WazirxClientException` for bad input caught before a request is sent, and `WazirxApiException` for network failures or API-rejected requests — so callers can catch at whatever granularity they need.
- SLF4J logging with no bundled binding, so consuming projects choose their own logging backend.

```java
try (Client client = new Client("your_api_key", "your_api_secret")) {
    String tickers = client.tickers();
}
```

## Recognition

The library has been acknowledged by WazirX's co-founder, and I've gone back to update it with new endpoints as the exchange's API evolved.

## Links
- [GitHub Repository](https://github.com/pratts/wazirx-connector-java)
