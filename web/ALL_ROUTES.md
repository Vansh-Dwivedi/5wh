# 5WH API Route Inventory

This master document lists all current Express routes grouped by base path. Where two mounts serve the same router (e.g. `/api/app` and `/app/fetch`), endpoints are equivalent. Update this file whenever routes change.

Legend:
- Auth: Public | Auth | Editor | Admin (cascading: Admin implies editor access where coded)
- Params: Path parameters shown with `:`; query parameters noted qualitatively
- Notes: Special behaviors, rate limits, fallbacks

---
## Health
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /healthz | Public | Uptime/status probe |

## Mobile / App Fetch (mounted at BOTH `/api/app` and `/app/fetch`)
Rate limit: 60 req/min/IP. Static bearer token required except radio.
Token: `Authorization: Bearer APPFETCHCOMMAND!@!@!`
| Method | Path | Auth | Query | Notes |
|--------|------|------|-------|-------|
| GET | /news | Auth | page,limit,category,search | Paginated published news |
| GET | /liveStreams | Auth | (none) | Live stream list (fallback mock) |
| GET | /radio | Public | (none) | Radio config, always returns fallback |
| GET | /podcasts | Auth | page,limit | Paginated published podcasts |
| GET | /videos | Auth | page,limit | Paginated published non-live videos |

## Auth (/api/auth)
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | /register | Public | Create user (likely admin restricted in practice) |
| POST | /login | Public | Obtain session token |
| GET | /me | Auth | Current user profile |
| PUT | /profile | Auth | Update profile + avatar upload |
| PUT | /change-password | Auth | Change password |

## News (/api/news)
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | / | Public | Published news list (filter/pagination inside controller) |
| GET | /categories | Public | Category list |
| GET | /admin | Editor | All news (any status) |
| GET | /admin/:id | Editor | Single by id (any status) |
| POST | / | Editor | Create (JSON body) |
| POST | /upload | Editor | Create with file uploads |
| PUT | /:id | Auth | Update (author/editor/admin) |
| DELETE | /:id | Auth | Delete (author/admin enforced in controller) |
| GET | /:slug | Public | Published news by slug |

## Podcasts (/api/podcasts)
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | / | Public | Published podcasts |
| GET | /admin | Editor | All (any status) |
| POST | / | Editor | Create + upload |
| GET | /admin/:id | Editor | Single by ID any status |
| PUT | /:id | Auth | Update (author/editor/admin) |
| DELETE | /:id | Auth | Delete (author/admin) |
| GET | /:slug | Public | Published podcast by slug |

## Videos (/api/videos)
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | / | Public | Published videos |
| GET | /admin | Editor | All videos any status |
| GET | /admin/:id | Editor | Single by ID |
| POST | / | Editor | Create + upload |
| PUT | /:id | Auth | Update |
| DELETE | /:id | Auth | Delete |
| GET | /:slug | Public | Published by slug |

## Opinions (/api/opinions)
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | / | Public | List opinions (defaults status=published) |
| GET | /admin | Editor | All opinions (filters) |
| GET | /featured | Public | Featured published opinions |
| POST | / | Editor | Create (multipart) |
| GET | /admin/:id | Editor | Single by ID any status |
| PUT | /:id | Editor | Update (multipart) |
| DELETE | /:id | Admin | Delete |
| PUT | /:id/toggle-featured | Editor | Toggle featured |
| PUT | /:id/status | Editor | Change status |
| GET | /stats/dashboard | Admin | Opinion stats dashboard |
| GET | /:slug | Public | Published by slug |

## Life & Culture (/api/lifeculture)
(In-memory storage version)
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /books | Public | All book recommendations |
| GET | /books/:id | Public | Book detail |
| GET | /cultural-events | Public | Events list |
| GET | /cultural-events/:id | Public | Event detail |
| POST | /books | Admin | Add book |
| PUT | /books/:id | Admin | Update book |
| DELETE | /books/:id | Admin | Delete book |
| POST | /cultural-events | Admin | Add event |
| PUT | /cultural-events/:id | Admin | Update event |
| DELETE | /cultural-events/:id | Admin | Delete event |

## Home (/api/home)
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | / | Public | Aggregated homepage content |

## Live Streams (/api/live)
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | / | Public | All live + scheduled (sorted) |
| GET | /active | Public | Currently live only |
| GET | /:id | Public | Stream detail |
| POST | / | Auth | Create stream |
| PUT | /:id | Auth | Update stream |
| DELETE | /:id | Auth | Delete stream |
| POST | /:id/viewer-count | Public | Update viewer count (no auth) |

## Newsletter (/api/newsletter)
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | /subscribe | Public | Subscribe email |
| POST | /unsubscribe | Public | Unsubscribe |
| GET | /stats | Admin | Statistics |

## Notifications (/api/notifications)
In-memory device tokens & history (development / prototype).
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | /register-device | Public | Register device token |
| GET | /test | Public | Basic route check |
| POST | /push-notification-test | Public | Send test notification (no auth) |
| POST | /push-notification | Auth | Send notification |
| GET | /latest | Public | Poll for new notifications since lastCheck |
| GET | /history | Auth | Paginated history |
| GET | /stats | Auth | Stats summary |

## Upload (/api/upload)
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | /single | Auth | Single file upload |
| POST | /multiple | Auth | Multiple files (max 10) |
| POST | /image | Auth | Image upload + resize 300x200 |
| POST | /video | Auth | Video upload |

## Advertisers (/api/advertisers)
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | / | Public | (Query: active, adType, placement) list advertisers |
| GET | /admin | Editor | Full list for admin UI |
| GET | /:id | Public | Single advertiser |
| POST | / | Editor | Create advertiser (logo upload) |
| PUT | /:id | Editor | Update advertiser |
| DELETE | /:id | Admin | Delete advertiser |
| POST | /:id/click | Public | Track click |
| POST | /:id/impression | Public | Track impression |

## News Fetch / Scheduler (/api/fetch)
Primarily internal / admin oriented.
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | /fetch-rss | Public | Manual RSS ingestion (consider restrict) |
| POST | /fetch-scraping | Public | Manual scraping (consider restrict) |
| POST | /fetch-all | Public | Combined fetch (consider restrict) |
| POST | /scrape-site | Public | Scrape specific site (site=abp-sanjha) |
| GET | /status | Public | Aggregated ingestion stats |
| POST | /enable-auto-sync | Editor | Enable scheduled ingest |
| POST | /disable-auto-sync | Editor | Disable scheduled ingest |
| GET | /scheduler-status | Editor | Scheduler status |

## Admin (/api/admin)
(Selected key endpoints only; user, RSS, and radio management shown.)
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /dashboard | Editor | Dashboard metrics |
| GET | /scheduled-upcoming | Editor | Upcoming scheduled content |
| GET | /audit-logs | Editor | Paginated audit logs |
| GET | /users | Admin | List users |
| POST | /users | Admin | Create user |
| PUT | /users/:id/role | Admin | Update role |
| PUT | /users/:id/status | Admin | Activate/deactivate |
| PUT | /users/:id | Admin | Update details |
| DELETE | /users/:id | Admin | Delete user |
| GET | /rss/feeds | Editor | List configured RSS feeds |
| POST | /news/fetch | Editor | Manual RSS/web scrape combined |
| GET | /rss/articles | Editor | List RSS sourced articles |
| GET | /radio-config | Editor | Get radio configuration |
| PUT | /radio-config | Admin | Update radio stream/config |
| POST | /radio-config/schedule | Admin | Add/update schedule for a day |
| DELETE | /radio-config/schedule/:day | Admin | Remove schedule for day |

---
## Unused / Empty
- `routes/advertisements.js` currently empty (placeholder) – ensure removal or implement.

---
## Security / Hardening TODOs
- Protect news fetch & scraping endpoints with at least editor auth.
- Replace static mobile token with issued JWT per device.
- Add rate limiting to notification test endpoints (public) to avoid abuse.
- Persist notification device tokens & history in database.

---
Generated automatically (timestamp: 
