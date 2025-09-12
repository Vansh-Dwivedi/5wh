# 5WH Mobile App Fetch API Routes

This document lists all endpoints the mobile / React Native app should use for content fetching ("read-only" consumption). These routes are exposed through two equivalent base paths that mount the same router:

- Primary base: `http://5whmedia.com/api/app`
- Legacy / alias base: `http://5whmedia.com/app/fetch`

Example: News can be fetched from either `/api/app/news` or `/app/fetch/news` (choose one pattern and stay consistent; recommended: use `/api/app`).

---
## Authentication
Most endpoints require a static bearer token (temporary implementation).

Header:
```
Authorization: Bearer APPFETCHCOMMAND!@!@!
```

Public (no token required):
- `GET /api/app/radio`

Protected (token required):
- `GET /api/app/news`
- `GET /api/app/liveStreams`
- `GET /api/app/podcasts`
- `GET /api/app/videos`

If the header is missing you get:
```
401 { "error": "Missing Authorization header", "code": 401 }
```
If the token is wrong you get:
```
401 { "error": "Invalid token", "code": 401 }
```
If the header format is wrong you get:
```
403 { "error": "Malformed Authorization header", "code": 403 }
```

---
## Rate Limiting
Global limit: 60 requests per minute per IP (HTTP 429 when exceeded):
```
429 { "error": "Too many requests", "code": 429 }
```

---
## Global Response Conventions
Every successful fetch returns JSON with at least:
- `success: true`
- `data: [...]` or `data: { ... }`
- For paginated endpoints: `pagination: { page, limit, total, hasMore, totalPages }`

Error responses (server errors):
```
500 { "error": "<message>", "code": 500, "success": false }
```

Caching: All endpoints set no‑cache headers so clients should not rely on HTTP caching.

---
## Endpoints

### 1. GET /api/app/news (auth required)
Fetch published news articles with pagination, optional category filter and text search.

Query Parameters:
- `page` (number, default 1)
- `limit` (number, default 50)
- `category` (string, optional)
- `search` (string, optional; matches title, content, excerpt case-insensitive)

Sample Request:
```
GET /api/app/news?page=1&limit=20&category=Politics
Authorization: Bearer APPFETCHCOMMAND!@!@!
```

Sample Success Response (truncated):
```
200 {
  "data": [
    {
      "id": "6710e...",
      "title": "Headline...",
      "subtitle": "Short excerpt ...",
      "imageUrl": "https://.../image.jpg",
      "content": "Short excerpt ...",
      "date": "2025-09-11T10:15:00.000Z",
      "category": "Politics"
    }
  ],
  "pagination": { "page":1, "limit":20, "total":245, "hasMore":true, "totalPages":13 },
  "success": true
}
```

### 2. GET /api/app/liveStreams (auth required)
Returns currently live video streams. If none exist in DB, provides fallback mock data.

Query Parameters: none (future: pagination optional).

Response Fields (array items):
- `id`, `title`, `description`, `streamUrl`, `youtubeId`, `imageUrl`, `thumbnailUrl`, `isLive`, `startTime`, `category`, `viewerCount`

### 3. GET /api/app/radio (public)
Returns current radio stream configuration. Always returns a usable fallback even if DB fails.

Response Fields:
- `data.streamUrl` (string)
- `data.title` (string)
- `data.artist` (current artist / presenter)
- `data.isLive` (boolean)
- `data.currentShow` (string)

Sample Response:
```
200 {
  "data": {
    "streamUrl": "http://5whmedia.com/radio/stream",
    "title": "5WH Radio",
    "artist": "Live Programming",
    "isLive": true,
    "currentShow": "Live Programming"
  },
  "success": true
}
```

### 4. GET /api/app/podcasts (auth required)
Paginated list of published podcasts.

Query Parameters:
- `page` (number, default 1)
- `limit` (number, default 5)

Response Item Fields:
- `id`, `title`, `description`, `duration` (seconds), `imageUrl`, `youtubeId`, `category`

### 5. GET /api/app/videos (auth required)
Paginated list of published non-live (VOD) videos.

Query Parameters:
- `page` (number, default 1)
- `limit` (number, default 5)

Response Item Fields:
- `id`, `title`, `description`, `duration` (seconds), `imageUrl`, `youtubeId`, `category`

---
## Sample Usage (Pseudo Code)
```js
async function fetchNews(page = 1) {
  const res = await fetch(`http://5whmedia.com/api/app/news?page=${page}&limit=20`, {
    headers: { 'Authorization': 'Bearer APPFETCHCOMMAND!@!@!' }
  });
  return res.json();
}

async function fetchRadio() {
  const res = await fetch('http://5whmedia.com/api/app/radio'); // no auth
  return res.json();
}
```

---
## Error Handling Recommendations (Client Side)
- 401 / 403: Prompt re-auth / refresh the configured token (or surface a configuration error since token is static currently).
- 429: Backoff (e.g., wait 2–5 seconds, retry with jitter). Avoid hammering UI refresh.
- 500: Show generic error and optionally allow manual retry.

---
## Future Enhancements (Optional / Planned)
- Replace static bearer token with issued JWT per device + refresh mechanism.
- Add ETag / Last-Modified for selective caching where safe.
- Add localized content support (e.g., `?lang=en`).
- Add combined feed endpoint for initial app boot (aggregate news + live + radio metadata in one round trip).

---
## Quick Reference Table
| Endpoint | Auth | Params | Description |
|----------|------|--------|-------------|
| GET /api/app/news | Yes | page, limit, category, search | Paginated published news |
| GET /api/app/liveStreams | Yes | (none) | Current live streams (or fallback) |
| GET /api/app/radio | No | (none) | Radio stream config & status |
| GET /api/app/podcasts | Yes | page, limit | Paginated published podcasts |
| GET /api/app/videos | Yes | page, limit | Paginated published videos (non-live) |

---
If you add new app-facing endpoints, update this file to keep mobile integration aligned.
