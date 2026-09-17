---
title: tocli
date: 2026-09-17
draft: false
featured: false
description: "A terminal BitTorrent client with a process-per-torrent architecture, where every command works as a scriptable one-shot invocation or an interactive TUI."
status: maintained
categories: [Developer Tools, Systems]
tags: [Go, CLI, TUI, BitTorrent, Concurrency]
tech: [Go, Cobra, Bubble Tea]
code: https://github.com/pratts/tocli
---

[tocli](https://github.com/pratts/tocli) is a terminal BitTorrent client
built around one rule: if a command has everything it needs to act, it just
acts, no prompts, safe to script or cron; if it's missing something, it
opens the relevant interactive screen instead of printing a usage error.
`tocli start ./file.torrent` downloads immediately; `tocli start` with no
source opens a screen to type one in. `tocli list` on a real terminal opens
a live, refreshing dashboard; piped or `--plain`/`--json` output stays
static and scriptable.

## One process per torrent, no daemon

There's no long-running tocli server. `start`/`resume` spawn one detached
background process per torrent, which owns that torrent's download for its
entire life. `pause` is just `SIGTERM` to that process's pid. There's no IPC
between the CLI and the background processes; they only communicate through
files on disk under `~/.tocli/`. A crash in one torrent's process can't
touch any other torrent, and nothing keeps running when nothing is
downloading.

## Trusting on-disk state after a crash

A background process can die with no chance to update its own bookkeeping:
`kill -9`, an OOM kill, the machine losing power. So tocli never fully
trusts a stale `status: running`. It cross-checks the recorded pid against a
real, live process, and compares a recorded boot-session id against the
current one, so a pid reused by an unrelated process after a reboot is never
mistaken for the original torrent. Each background process also holds an OS
advisory lock (`flock`) on its torrent's lock file for as long as it's
alive, released automatically the instant its file descriptors close, for
any reason. That's a direct kernel guarantee rather than an inference, so a
second process can never start downloading into the same directory while
another one already is, even in the narrow window right after a crash.

## One engine, two front ends

The interactive TUI never talks to the torrent client or the on-disk state
directly. Every screen calls the exact same `internal/engine` functions
(`StartTorrent`, `PauseTorrent`, `ResumeTorrent`, `RemoveTorrent`) that the
plain CLI commands call, so there's exactly one implementation of what each
action does. The CLI and TUI only differ in when they call it and how they
render the result.

Built on [anacrolix/torrent](https://github.com/anacrolix/torrent) for the
BitTorrent protocol, [cobra](https://github.com/spf13/cobra) for the command
layer, and [bubbletea](https://github.com/charmbracelet/bubbletea) for the
TUI. Tagged releases are cross-compiled for Linux and macOS (amd64/arm64)
via GitHub Actions.
