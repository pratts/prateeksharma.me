---
title: TTS Study Assistant
date: 2024-01-15
draft: false
featured: true
description: "A Chrome extension for saving, organizing, and listening to notes from any webpage, backed by a Go/Fiber API and a React admin panel."
status: live
categories: [Developer Tools, Programming]
tags: [Go, Fiber, React, TypeScript, Chrome Extension, JWT, PostgreSQL]
tech: [Go, Fiber, React, TypeScript, PostgreSQL]
code: https://github.com/pratts/tts-study-assistant
live: https://tts-study-assistant.vercel.app/
---

The TTS Study Assistant lets you select text on any webpage, save it as a note,
hear it read aloud, and summarize it with AI for review. It's a Chrome extension
(Manifest V3), a Go/Fiber backend, and a React admin panel.

## Architecture

- **Backend (Go)** — Fiber for HTTP, PostgreSQL via GORM, JWT auth, OpenAI for
  summarization, deployed on Railway in a Docker container.
- **Frontend (React + TypeScript)** — Vite build, React Query + Context for
  state, deployed on Vercel.
- **Extension** — Manifest V3 service worker, Chrome Storage API for local state,
  Chrome TTS API for playback, content scripts for text selection.

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
- [Admin panel](https://tts-study-assistant.vercel.app/)
