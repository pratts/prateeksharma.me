---
title: "Daemon threads for WebSocket keepalives"
date: 2026-08-29
draft: false
tags: [Java, WebSocket, Concurrency]
related:
  - /projects/wazirx-connector-java/
---

A WebSocket connection that needs periodic pings to stay open shouldn't run that
ping loop on a plain, non-daemon thread. In the
[WazirX Java connector](/projects/wazirx-connector-java/), the ping thread is
started `onOpen` and marked `setDaemon(true)` before starting it:

```java
pingThread = new Thread(new PingMessage(this));
pingThread.setDaemon(true);
pingThread.start();
```

A non-daemon thread keeps the JVM alive until it finishes. If a caller opens a
socket, forgets to close it, and the rest of the application shuts down, a
non-daemon ping thread will keep the process running indefinitely. A daemon
thread just gets killed when everything else is done — which is the right
default for background keepalive work that isn't itself the point of the
program.
