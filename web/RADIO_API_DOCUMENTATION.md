# 5WH Radio API Documentation

## Overview
The radio configuration API allows administrators to manage radio stream settings that are served to the mobile application and website.

## Endpoints

### 1. Get Radio Configuration (Public)
**GET** `/api/app/radio`

Returns the current radio configuration for the application.

**Response:**
```json
{
  "data": {
    "streamUrl": "http://5whmedia.com/radio/stream",
    "title": "5WH Radio",
    "artist": "Live Programming",
    "isLive": true,
    "currentShow": "Morning Show"
  },
  "success": true
}
```

### 2. Get Radio Configuration (Admin)
**GET** `/api/admin/radio-config`

**Authentication:** Required (Admin/Editor)

Returns the full radio configuration including all fields.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "streamUrl": "http://5whmedia.com/radio/stream",
    "title": "5WH Radio",
    "currentShow": "Morning Show",
    "currentArtist": "Host Name",
    "isLive": true,
    "listenersCount": 150,
    "schedule": [
      {
        "day": "monday",
        "startTime": "06:00",
        "endTime": "10:00",
        "showName": "Morning Show",
        "host": "John Doe"
      }
    ],
    "createdAt": "2025-09-10T00:00:00.000Z",
    "updatedAt": "2025-09-10T12:00:00.000Z"
  }
}
```

### 3. Update Radio Configuration
**PUT** `/api/admin/radio-config`

**Authentication:** Required (Admin only)

Updates the radio configuration.

**Request Body:**
```json
{
  "streamUrl": "https://new-stream-url.com/stream",
  "title": "5WH Radio Updated",
  "currentShow": "Evening Show",
  "currentArtist": "New Host",
  "isLive": true,
  "listenersCount": 200
}
```

**Response:**
```json
{
  "success": true,
  "message": "Radio configuration updated successfully",
  "data": { /* updated config */ }
}
```

### 4. Add/Update Radio Schedule
**POST** `/api/admin/radio-config/schedule`

**Authentication:** Required (Admin only)

Adds or updates a radio show schedule for a specific day.

**Request Body:**
```json
{
  "day": "monday",
  "startTime": "06:00",
  "endTime": "10:00",
  "showName": "Morning Show",
  "host": "John Doe"
}
```

**Validation:**
- `day`: Must be one of: monday, tuesday, wednesday, thursday, friday, saturday, sunday
- `startTime`/`endTime`: Must be in HH:MM format (24-hour)
- `showName`: Required
- `host`: Optional

**Response:**
```json
{
  "success": true,
  "message": "Radio schedule updated successfully",
  "data": { /* updated config with schedule */ }
}
```

### 5. Delete Radio Schedule
**DELETE** `/api/admin/radio-config/schedule/:day`

**Authentication:** Required (Admin only)

Removes the radio schedule for a specific day.

**Parameters:**
- `day`: Day of the week (monday, tuesday, etc.)

**Response:**
```json
{
  "success": true,
  "message": "Radio schedule deleted successfully",
  "data": { /* updated config */ }
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (no auth token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Authentication

Admin endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer your-jwt-token
```

## Usage Examples

### Using curl

1. **Get public radio config:**
```bash
curl http://5whmedia.com/api/app/radio
```

2. **Update radio config (admin):**
```bash
curl -X PUT http://5whmedia.com/api/admin/radio-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "streamUrl": "https://new-stream.com/live",
    "title": "5WH Radio Live",
    "isLive": true
  }'
```

3. **Add schedule:**
```bash
curl -X POST http://5whmedia.com/api/admin/radio-config/schedule \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "day": "monday",
    "startTime": "06:00",
    "endTime": "10:00",
    "showName": "Morning Show",
    "host": "John Doe"
  }'
```

### Using JavaScript (Frontend)

```javascript
// Get radio config for app
const radioConfig = await fetch('/api/app/radio').then(r => r.json());

// Update radio config (admin)
const updateConfig = await fetch('/api/admin/radio-config', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + authToken
  },
  body: JSON.stringify({
    streamUrl: 'https://new-stream.com/live',
    title: '5WH Radio Live',
    isLive: true
  })
});
```

## Admin Interface

A web-based admin interface is available at:
`http://your-domain.com/radio-admin.html`

This interface provides:
- Current configuration display
- Form to update radio settings
- Stream URL testing
- Real-time status indicators

## Notes

1. **Single Configuration**: Only one radio configuration document exists in the database.
2. **Automatic Creation**: If no configuration exists, it will be created automatically with default values.
3. **Caching**: The public API endpoint (`/api/app/radio`) disables caching to ensure fresh data.
4. **Validation**: All URLs are validated for proper format.
5. **Audit Logging**: All admin actions are logged for security and audit purposes.
