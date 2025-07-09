+++
date = '2025-07-09T17:31:45+05:30'
draft = false
title = 'Study Assistant: Chrome Extension'
categories = ["engineering", "chrome-extension", "golang", "tts"]
description = "A deep dive into the technical design and implementation of a TTS Study Assistant Chrome extension and its Go backend."
+++

## Introduction

In this post, I’ll walk through the technical details of building a Study Assistant—a productivity tool that lets users save, organize, and listen to notes from any website. The solution consists of a Chrome extension (frontend) and a Go/Fiber backend, with secure authentication, domain-based note management, and text-to-speech (TTS) features.

---

## 1. Chrome Extension: Technical Details

### Architecture

- **Popup UI:** Built with vanilla JS, HTML, and CSS for fast load and compatibility.
- **Content Scripts:** Injected into web pages to capture selected text and interact with the context menu.
- **Background Script:** Handles authentication, API calls, and communication between popup, content scripts, and backend.
- **Context Menus:** Adds a right-click menu for saving selected text as a note.
- **TTS Integration:** Uses the Web Speech API (`window.speechSynthesis`) for in-browser audio playback.

### Key Features

- **Save Notes:** Select text on any page, right-click, and save it as a note (with source URL and domain auto-detected).
- **Listen to Notes:** Play, pause, and replay notes using TTS directly from the popup.
- **Domain Awareness:** Notes are grouped and filtered by domain, including special handling for local files and PDFs.
- **Authentication:** Secure login with JWT/refresh tokens, passwords are pre-hashed (SHA-256) before sending to the backend.
- **Sync:** Notes are synced with the backend, so users can access them from the web dashboard as well.

### Permissions & Security

- **Permissions:** `activeTab`, `contextMenus`, `storage`, `tts`, and host permissions for all URLs.
- **Privacy:** No user data is sold or shared; only email, hashed password, and selected note content are sent to the backend.
- **Edge Cases:** Handles Chrome PDF viewer and local files by mapping their domains to a generic label ("Downloaded/Local file").

### Example: Context Menu Handler

```js
chrome.contextMenus.create({
  id: "save-note",
  title: "Save Note",
  contexts: ["selection"],
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "save-note" && info.selectionText) {
    // Send selected text to backend
    await apiClient.saveNote({
      content: info.selectionText,
      source_url: tab.url,
      domain: extractDomain(tab.url),
    });
  }
});
```

---

## 2. Backend Design (Go + Fiber + GORM)

### Overview

- **Framework:** Go with Fiber (Express-like web framework)
- **Database:** PostgreSQL, accessed via GORM ORM
- **API:** RESTful endpoints for authentication, notes CRUD, user profile, and stats
- **OpenAPI Spec:** Full API documentation via `openapi.json`

### Authentication & Security

- **JWT Auth:** Access tokens for API calls, refresh tokens for session management
- **Password Handling:** All passwords are pre-hashed (SHA-256) by the client; backend never sees plaintext passwords
- **Token Rotation:** Refresh tokens are rotated and stored securely in the database

### Notes Model

```go
type Note struct {
    ID         uuid.UUID      `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
    UserID     uuid.UUID      `gorm:"not null"`
    Content    string         `gorm:"type:text;not null"`
    SourceURL  string         `gorm:"type:text"`
    SourceTitle string        `gorm:"type:text"`
    Domain     string         `gorm:"type:text"`
    Metadata   datatypes.JSON `gorm:"type:jsonb"`
    CreatedAt  time.Time
    UpdatedAt  time.Time
}
```

### API Highlights

- **/auth/register, /auth/login, /auth/refresh, /auth/logout:** Secure user authentication
- **/notes:** CRUD for notes, with pagination, sorting, and filtering by domain/source
- **/notes/stats:** Returns note counts per domain for dashboard analytics
- **/user/profile, /user/password:** User info and password update endpoints

### Example: Notes Pagination Handler

```go
func GetNotes(c *fiber.Ctx) error {
    userID := c.Locals("user_id").(uuid.UUID)
    page, _ := strconv.Atoi(c.Query("page", "1"))
    pageSize, _ := strconv.Atoi(c.Query("page_size", "10"))
    var notes []models.Note
    db := database.DB.Where("user_id = ?", userID)
    if domain := c.Query("domain"); domain != "" {
        db = db.Where("domain = ?", domain)
    }
    db = db.Order("created_at DESC").Offset((page-1)*pageSize).Limit(pageSize)
    db.Find(&notes)
    return c.JSON(notes)
}
```

### Security & Best Practices

- **CORS:** Configured for frontend and extension origins
- **Error Handling:** Consistent error responses with codes/messages
- **OpenAPI:** All endpoints documented for easy integration

---

## Conclusion

This architecture enables a seamless, cross-platform study assistant experience. The Chrome extension and Go backend are decoupled, secure, and scalable. The same backend can power future mobile or desktop apps, and the extension can be ported to other browsers with minimal changes.

---

You can watch the demo of the plugin at: [TTS Study Assistant Chrome Extension](www.loom.com/share/8c291ec1989b44f793af83d4d2678d10?sid=e5dbd943-e8e6-46ea-b0a1-588134f8c3db)

## Future Enhancements
- **Mobile App:** Build a React Native app to access notes on the go.
- **Desktop App:** Create a cross-platform desktop app using Electron or Tauri.
- **AI Features:** Integrate AI for summarization, tagging, and smart search.
- **Collaboration:** Allow users to share notes with others or create public note collections.
- **Analytics Dashboard:** Provide insights on note usage, most active domains, etc.
