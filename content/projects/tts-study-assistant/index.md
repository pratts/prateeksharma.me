---
title: "TTS Study Assistant: A Chrome Extension"
date: 2024-01-15
draft: false
tags: ["chrome-extension", "go", "react", "typescript", "ai", "tts", "study-tools"]
categories: ["Development", "Projects"]
---

## Introduction

I recently built a comprehensive TTS (Text-to-Speech) Study Assistantthat enables a user to save notes, play audio for the saved notes and summarize them using AI. It combines a Chrome extension with a Go backend and React based admin panel.

## Project Overview

The TTS Study Assistant is a study tool that helps users:
- **Capture and organize notes** from any webpage
- **Listen to text selections** using Chrome's TTS API
- **Summarize notes** using AI for quick review
- **Manage notes** using a React-based admin panel

## Architecture

### Tech Stack

**Backend (Golang)**
- **Framework**: Fiber (high-performance HTTP framework)
- **Database**: PostgreSQL with GORM ORM
- **Authentication**: JWT with source-based token expiry
- **AI Integration**: OpenAI GPT-3.5-turbo for text summarization
- **Deployment**: Docker containerization on Railway

**Frontend (React + TypeScript)**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **State Management**: React Context + React Query
- **Deployment**: Vercel for static hosting

**Chrome Extension**
- **Manifest**: Manifest V3 for modern extension APIs
- **Storage**: Chrome Storage API for local state
- **TTS**: Chrome TTS API for text-to-speech
- **Content Scripts**: For webpage interaction

## Key Features

### 1. Text-to-Speech Functionality

The core TTS feature allows users to:
- **Select any text** on a webpage and have it read aloud
- **Control playback** with play, pause, resume, and stop controls
- **Queue management** for multiple text selections

**Technical Implementation:**
```javascript
// Content script handles text selection and TTS requests
chrome.runtime.sendMessage({
  action: 'speak',
  text: selectedText,
  tabId: tab.id
});

// Background script manages Chrome TTS API
chrome.tts.speak(text, {
  rate: 1.0,
  pitch: 1.0,
  onEvent: function(event) {
    // Handle TTS events
  }
});
```

### 2. Note Management System

Users can save and organize study notes with:
- **Automatic domain detection** from source URLs
- **Rich metadata** storage for additional context
- **Pagination and filtering** for large note collections

**Database Schema:**
```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT,
  source_title TEXT,
  domain TEXT,
  summary TEXT,
  metadata JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 3. AI-Powered Summarization

The system integrates OpenAI's GPT-3.5-turbo for intelligent text summarization:

**Go Implementation:**
```go
func (s *SummarizerService) Summarize(text string) (string, error) {
    payload := map[string]interface{}{
        "model": "gpt-3.5-turbo",
        "messages": []map[string]string{
            {
                "role":    "system",
                "content": "You are a helpful assistant that creates concise summaries. Summarize the following text in 2-3 sentences, capturing the key points.",
            },
            {
                "role":    "user",
                "content": text,
            },
        },
        "temperature": 0.7,
        "max_tokens":  150,
    }
    
    // Make API call to OpenAI
    // Parse response and return summary
}
```


### 4. Authentication & Security

**Multi-Source Authentication:**
- **Web sessions**: 15-minute access tokens, 30-day refresh tokens
- **Extension sessions**: 1-hour access tokens, 90-day refresh tokens
- **Token rotation** on refresh for enhanced security
- **Source tracking** for audit and security purposes

**JWT Implementation:**
```go
func (s *AuthService) generateAccessTokenWithSource(userID, email, source string) (string, error) {
    var exp time.Duration
    switch source {
    case "extension":
        exp = time.Hour * 1
    default:
        exp = time.Minute * 15
    }
    
    claims := jwt.MapClaims{
        "user_id": userID,
        "email":   email,
        "exp":     time.Now().Add(exp).Unix(),
        "iat":     time.Now().Unix(),
    }
    
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(s.cfg.JWTSecret))
}
```

### 5. Chrome Extension Architecture

**Manifest V3 Structure:**
```json
{
  "manifest_version": 3,
  "name": "TTS Study Assistant",
  "version": "1.0.0",
  "permissions": [
    "storage",
    "tts",
    "activeTab",
    "contextMenus"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"],
    "css": ["content.css"]
  }]
}
```

**Key Components:**
- **Background Service Worker**: Manages TTS state and API communication
- **Content Scripts**: Handle text selection and user interaction
- **Popup Interface**: Provides controls and note management
- **Storage API**: Persists user preferences and authentication state

## Development Challenges & Solutions

### 1. Chrome Extension TTS Limitations

**Challenge**: Chrome's TTS API doesn't provide detailed playback state information.

**Solution**: Implemented a custom state management system:
```javascript
// Track TTS state manually
let currentState = {
  isPlaying: false,
  isPaused: false,
  currentText: null,
  queue: []
};

// Update UI based on state
function updateButtonStates() {
  playBtn.disabled = !currentState.queue.length && !currentState.currentText;
  pauseBtn.style.display = currentState.isPlaying ? 'block' : 'none';
  resumeBtn.style.display = currentState.isPaused ? 'block' : 'none';
}
```

### 2. Cross-Origin API Communication

**Challenge**: Chrome extensions need to communicate with external APIs while handling CORS.

**Solution**: Used Chrome's storage API for token management and implemented proper error handling:
```javascript
class ApiClient {
  async _fetchWithAuth(url, options = {}) {
    const token = await this.getAccessToken();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (response.status === 401) {
      // Handle token refresh
      await this.refreshToken();
      return this._fetchWithAuth(url, options);
    }
    
    return response;
  }
}
```

### 3. Real-time UI Synchronization

**Challenge**: Keeping popup UI in sync with background TTS state.

**Solution**: Implemented message passing between background and popup:
```javascript
// Background sends state updates
chrome.runtime.sendMessage({
  action: 'stateUpdate',
  state: ttsState
});

// Popup listens for updates
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'stateUpdate') {
    // UI Update logic
  }
});
```

## Performance Optimizations

### 1. Database Indexing
```sql
-- Optimize note queries by user and domain
CREATE INDEX idx_uid_did ON notes(user_id, domain);

-- Index for refresh token lookups
CREATE INDEX idx_refresh_token ON refresh_tokens(token);
```

### 2. Frontend Code Splitting
```typescript
// Lazy load components for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Notes = lazy(() => import('./pages/Notes'));
const Profile = lazy(() => import('./pages/Profile'));
```

## Deployment Strategy

### Backend Deployment
```dockerfile
# Multi-stage Docker build
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/server

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 3000
CMD ["./main"]
```

### Frontend Deployment
```json
// vercel.json for SPA routing
{
    "routes": [
        {
            "src": "/[^.]+",
            "dest": "/",
            "status": 200
        }
    ]
}
```

## Security Considerations

### 1. Password Security
- **Client-side hashing**: Passwords are hashed using SHA-256 before transmission
- **No plain text storage**: Backend never sees plain text passwords
- **Secure comparison**: Direct hash comparison for authentication
Example to generate SHA-256 hash in TypeScript:
```go
export async function sha256(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
} 
```

### 2. API Security
- **JWT tokens**: Secure, time-limited access tokens
- **CORS configuration**: Properly configured for cross-origin requests
- **Input validation**: Comprehensive request validation
- **SQL injection prevention**: GORM ORM with parameterized queries

### 3. Extension Security
- **Minimal permissions**: Only requested necessary Chrome APIs
- **Content script isolation**: Proper sandboxing of web page interaction
- **Secure storage**: Chrome Storage API for sensitive data

## Future Enhancements

### Planned Features
1. **Offline support** with service workers
2. **Voice customization** for TTS (speed, pitch, voice selection)
3. **Study analytics** and progress tracking
4. **Collaborative notes** with sharing capabilities

### Technical Improvements
1. **WebSocket support** for real-time updates
2. **Advanced caching** with Redis

## Lessons Learned

### 1. Chrome Extension Development
- **Manifest V3** introduces new security models and limitations
- **Service workers** replace background pages but have different lifecycle
- **Content script isolation** requires careful message passing design

### 2. Go Backend Development
- **Fiber framework** provides excellent performance for HTTP APIs
- **GORM** simplifies database operations but requires careful query optimization
- **JWT implementation** needs proper error handling and token rotation

### 3. React Frontend Development
- **React** provides a component-based architecture for building UIs
- **TypeScript** catches many errors at compile time

### 4. Full-Stack Integration
- **API design** should be consistent across all clients
- **Error handling** needs to be comprehensive at all layers
- **Authentication flow** must work seamlessly across web and extension

### 5. End to end deployment
- **Docker** simplifies deployment but requires careful image management
- **Railway for backend** provides a great platform for Go applications with easy scaling
- **Railway for database** simplifies PostgreSQL management
- **Vercel** simplifies React deployments with automatic optimizations

## Conclusion

Building the TTS Study Assistant was an to learn full-stack development, covering everything from browser extension APIs, admin panel, Golang based backend development to AI integration. The project demonstrates modern development practices while solving real user problems.

The project is open-source and available on GitHub, serving as both a functional study tool and a reference implementation for similar applications.

## Links:
- [GitHub Repository](git@github.com:pratts/tts-study-assistant.git)
- [Chrome Web Store Listing](www.tidylnk.com/1RucaU)
- [Admin Panel](https://tts-study-assistant.vercel.app/)

## Feedback
I welcome any feedback or contributions to the project. Feel free to open issues or pull requests on the GitHub repository. Your input can help improve the tool and add new features that benefit all users.