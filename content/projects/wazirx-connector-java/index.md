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

After building the [Go connector](/projects/wazirx-connector-go) for WazirX, I wanted the same thing on the JVM — but WazirX doesn't publish an official Java client at all, REST or WebSocket. The REST half was a fairly direct port of what I'd already learned building the Go client. The WebSocket half turned out to be its own project.

## Letting Callers Choose Their Failure Granularity

For errors, I didn't want every caller forced into one giant catch-all exception, but I also didn't want to force a `try/catch` at every single call site. I split errors into two, with one extending the other:

```java
public class WazirxApiException extends RuntimeException { ... }
public class WazirxClientException extends WazirxApiException { ... }
```

`WazirxClientException` covers mistakes the caller can fix — a bad `side` value, a missing required field — caught before a request is even sent. `WazirxApiException` covers everything that happens once a request leaves the process: network failures, non-2xx responses. Because one extends the other, a caller who only cares about "did something go wrong" can catch the parent; a caller who wants to distinguish "I made a mistake" from "the network or API failed" can catch both separately.

## Keeping a WebSocket Connection Alive

The REST client was the easy part. WazirX's WebSocket stream needed periodic pings to stay open, and I didn't want that logic tangled into the message-handling code. I pulled it into its own thread, started when the socket opens and stopped when it closes or errors:

```java
@Override
public void onOpen(ServerHandshake handshakedata) {
    sendPing = true;
    pingThread = new Thread(new PingMessage(this));
    pingThread.setDaemon(true);
    pingThread.start();
}

@Override
public void onClose(int code, String reason, boolean remote) {
    stopPing();
}
```

Making it a daemon thread mattered — I didn't want a forgotten open socket to keep the JVM alive after everything else had shut down.

## Not Re-Authenticating on Every Subscribe

Private streams (account updates, order updates, your own trades) require an auth token, fetched via a REST call. My first pass fetched a fresh token on every single private subscription — which meant subscribing to three private streams in a row meant three redundant round-trips for a token that hadn't actually expired.

I fixed it by caching the token and checking its stated expiry before deciding whether to refresh:

```java
private synchronized JsonObject refreshAuthTokenIfNeeded() {
    if (authToken != null) {
        int timeout = authToken.get("timeout_duration").getAsInt();
        long initTime = authToken.get("timestamp").getAsLong();
        if ((System.currentTimeMillis() - initTime) < ((long) timeout * 1000)) {
            return authToken;
        }
    }
    // fetch and cache a new token
}
```

It's a small thing, but it turned "every private subscribe hits the REST API" into "the REST API gets hit only when the cached token is actually about to expire" — which mattered once I was subscribing to multiple private streams from the same client.

## Where It's Landed

Like the Go connector, this library has been acknowledged by WazirX's co-founder, and I've kept it updated with new endpoints as the exchange's API has evolved on both the REST and WebSocket sides.

## Links
- [GitHub Repository](https://github.com/pratts/wazirx-connector-java)
