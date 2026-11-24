---
title: TTS Study Assistant
date: 2024-01-15
draft: false
featured: true
lastmod: 2026-11-24T18:00:00Z
description: "A Chrome and Firefox extension for saving, organizing, and listening to notes from any webpage, backed by a Go/Fiber API and a React admin panel."
status: live
categories: [Developer Tools, Programming]
tags: [Go, Fiber, React, TypeScript, Chrome Extension, Firefox, JWT, PostgreSQL]
tech: [Go, Fiber, React, TypeScript, PostgreSQL]
code: https://github.com/pratts/tts-study-assistant
live: https://tts-study-assistant.vercel.app/
---

The TTS Study Assistant lets you select text on any webpage, save it as a note,
hear it read aloud, and summarize it with AI for review. It's a browser extension
(Manifest V3, for Chrome and Firefox), a Go/Fiber backend, and a React admin
panel.

## Architecture

- **Backend (Go):** Fiber for HTTP, PostgreSQL via GORM, JWT auth, OpenAI for
  summarization, deployed on Railway in a Docker container.
- **Frontend (React + TypeScript):** Vite build, React Query + Context for
  state, deployed on Vercel.
- **Extension:** Manifest V3 background script, Chrome Storage API for local
  state, Chrome TTS API (or the Web Speech API on Firefox) for playback,
  content scripts for text selection.

## Decisions worth noting

### Source-based token lifetimes

Web sessions and extension sessions have very different UX expectations, so the
access-token lifetime depends on where the request comes from:

```go
func (s *AuthService) generateAccessTokenWithSource(userID, email, source string) (string, error) {
    var exp time.Duration
    switch source {
    case "extension":
        exp = time.Hour * 1        // long-lived: the extension isn't a browser tab
    default:
        exp = time.Minute * 15     // short-lived for web sessions
    }
    claims := jwt.MapClaims{
        "user_id": userID, "email": email,
        "exp": time.Now().Add(exp).Unix(), "iat": time.Now().Unix(),
    }
    return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(s.cfg.JWTSecret))
}
```

Refresh tokens rotate on use, and the `source` is tracked for audit.

### Tracking TTS state by hand

Chrome's TTS API doesn't expose detailed playback state, so the background
service worker keeps its own state machine (`isPlaying`, `isPaused`,
`currentText`, `queue`) and broadcasts updates to the popup via
`chrome.runtime.sendMessage`. The popup is a pure view of that state.

### One extension, two browsers

The extension now ships to Chrome and Firefox from a single codebase and a
single release zip. The differences were smaller in number than in annoyance:

- **Background script:** Firefox has no extension service workers, so the
  manifest declares both `background.service_worker` and `background.scripts`
  pointing at the same file. Chrome 121+ ignores `scripts`, Firefox runs the
  file as an event page.
- **Playback:** Firefox has no `chrome.tts`. A small wrapper presents
  `speechSynthesis` through the same interface the playback engine already
  used, so the state machine didn't change. Cancelled utterances are reported
  as "interrupted" rather than errors, so seeking and changing speed don't look
  like failures.
- **Shortcut:** the save-selection shortcut became Alt+Shift+Y, because Alt+S
  opens Firefox's History menu on Windows and Linux.
- **Release:** CI lints the extension with `web-ext`, checks the zip, and can
  submit it to both stores.

### Notes schema

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT, source_title TEXT, domain TEXT,
  summary TEXT, metadata JSONB,
  created_at TIMESTAMP, updated_at TIMESTAMP
);
CREATE INDEX idx_uid_did ON notes(user_id, domain);
```

Domain is derived from `source_url` on write so notes can be filtered by site
without parsing URLs on every query.

## Links

- [GitHub](https://github.com/pratts/tts-study-assistant.git)
- [Chrome Web Store listing](https://www.tidylnk.com/1RucaU)
- [Firefox Add-ons listing](https://addons.mozilla.org/firefox/addon/tts-study-assistant/)
- [Admin panel](https://tts-study-assistant.vercel.app/)
