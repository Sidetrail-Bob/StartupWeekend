# API Documentation

## Overview

The Adventure Map Game backend exposes a simple REST API for session management and asset discovery. All endpoints return JSON responses.

**Base URL:** `http://localhost:3000/api`

## Endpoints

### 1. Get Manifest

Retrieves the list of available themes, characters, and mini-games.

#### Request
```http
GET /api/manifest
```

#### Response
```json
{
    "themes": [
        {
            "id": "forest",
            "name": "Whispering Woods",
            "type": "winding",
            "color": "#2d5a27"
        },
        {
            "id": "space",
            "name": "Galactic Route",
            "type": "circular",
            "color": "#000022"
        }
    ],
    "characters": [
        {
            "id": "knight",
            "name": "Brave Knight",
            "color": "#e74c3c"
        },
        {
            "id": "bunny",
            "name": "Space Bunny",
            "color": "#3498db"
        }
    ],
    "games": [
        {
            "id": "math_add",
            "name": "Number Cruncher",
            "script": "js/minigames/game_math_add.js"
        }
    ]
}
```

#### Response Fields

**themes[]:**
- `id` (string): Unique identifier for theme
- `name` (string): Display name
- `type` (string): Path type - `"winding"` or `"circular"`
- `color` (string): Primary theme color (hex)

**characters[]:**
- `id` (string): Unique identifier for character
- `name` (string): Display name
- `color` (string): Character color (hex)

**games[]:**
- `id` (string): Unique identifier for mini-game
- `name` (string): Display name
- `script` (string): Path to game module

#### Example Usage
```javascript
const manifest = await API.getManifest();
console.log(manifest.themes[0].name); // "Whispering Woods"
```

---

### 2. Start Session

Creates a new game session and returns session data.

#### Request
```http
POST /api/session/start
Content-Type: application/json
```

```json
{
    "profileName": "Alex",
    "charId": "forest_knight",
    "themeId": "forest"
}
```

#### Request Body
- `profileName` (string): Player's name or profile identifier
- `charId` (string): Selected character ID (must match manifest)
- `themeId` (string): Selected theme ID (must match manifest)

#### Response
```json
{
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "profileName": "Alex",
    "characterId": "forest_knight",
    "themeId": "forest",
    "currentLevel": 1,
    "currentNode": 0,
    "totalStars": 0,
    "mercyMode": false,
    "nodeHistory": []
}
```

#### Response Fields
- `sessionId` (string): UUID for this session
- `profileName` (string): Player name
- `characterId` (string): Selected character
- `themeId` (string): Selected theme
- `currentLevel` (integer): Current level (default: 1)
- `currentNode` (integer): Current node index (0-8, default: 0)
- `totalStars` (integer): Total stars collected
- `mercyMode` (boolean): Whether next game should be easier
- `nodeHistory` (array): Record of completed nodes

#### Backend Logic
1. Generate new UUID using `uuid` package
2. Create session object with defaults
3. Save to `data/sessions/{sessionId}.json`
4. Return session object

#### Example Usage
```javascript
const session = await API.startSession('Alex', 'forest_knight', 'forest');
console.log(session.sessionId); // "550e8400-..."
```

---

### 3. Update Progress

Updates session state after a mini-game attempt.

#### Request
```http
POST /api/session/update
Content-Type: application/json
```

```json
{
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "result": {
        "success": true,
        "stars": 3,
        "usedMercy": false
    }
}
```

#### Request Body
- `sessionId` (string): UUID of the session to update
- `result` (object): Game result data
  - `success` (boolean): Whether player won the challenge
  - `stars` (integer): Stars awarded (0-3)
  - `usedMercy` (boolean): Whether Mercy Rule was triggered

#### Response (Success)
```json
{
    "success": true,
    "state": {
        "sessionId": "550e8400-e29b-41d4-a716-446655440000",
        "profileName": "Alex",
        "characterId": "forest_knight",
        "themeId": "forest",
        "currentLevel": 1,
        "currentNode": 1,
        "totalStars": 3,
        "mercyMode": false,
        "nodeHistory": [
            {
                "node": 0,
                "success": true,
                "stars": 3
            }
        ]
    }
}
```

#### Response (Error - Session Not Found)
```json
{
    "error": "Session not found"
}
```
**Status Code:** 404

#### Backend Logic

**On Success (`result.success = true`):**
1. Increment `currentNode`
2. Add `result.stars` to `totalStars`
3. Set `mercyMode = false`
4. Add entry to `nodeHistory`
5. Save updated session
6. Return updated state

**On Failure (`result.success = false`):**
- If `result.usedMercy = true`:
  1. Increment `currentNode` (advance anyway)
  2. Set `mercyMode = true` (next game is easier)
  3. Add entry to `nodeHistory` with `usedMercy` flag
  4. Save updated session
- If `result.usedMercy = false`:
  1. Do not modify session state
  2. Frontend handles failure counter locally

#### Example Usage
```javascript
// After player wins a challenge
const response = await API.updateProgress(sessionId, {
    success: true,
    stars: 3,
    usedMercy: false
});

console.log(response.state.currentNode); // 1 (advanced)
console.log(response.state.totalStars);  // 3 (awarded)
```

```javascript
// After Mercy Rule is triggered (3 failures)
const response = await API.updateProgress(sessionId, {
    success: false,
    stars: 0,
    usedMercy: true
});

console.log(response.state.mercyMode); // true (next game easier)
console.log(response.state.currentNode); // 1 (still advanced)
```

---

## Data Models

### Session Model

**File Location:** `data/sessions/{sessionId}.json`

```json
{
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "profileName": "Alex",
    "characterId": "forest_knight",
    "themeId": "forest",
    "currentLevel": 1,
    "currentNode": 3,
    "totalStars": 8,
    "mercyMode": false,
    "nodeHistory": [
        {
            "node": 0,
            "success": true,
            "stars": 3
        },
        {
            "node": 1,
            "success": true,
            "stars": 2
        },
        {
            "node": 2,
            "success": false,
            "usedMercy": true
        }
    ]
}
```

#### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `sessionId` | string (UUID) | Unique session identifier |
| `profileName` | string | Player's display name |
| `characterId` | string | Selected character (references manifest) |
| `themeId` | string | Selected theme (references manifest) |
| `currentLevel` | integer | Current level (1-indexed) |
| `currentNode` | integer | Current node index (0-indexed) |
| `totalStars` | integer | Cumulative stars earned |
| `mercyMode` | boolean | If true, next challenge has reduced difficulty |
| `nodeHistory` | array | Record of all node attempts |

#### Node History Entry

```json
{
    "node": 0,
    "success": true,
    "stars": 3,
    "usedMercy": false
}
```

| Field | Type | Description |
|-------|------|-------------|
| `node` | integer | Node index (0-8) |
| `success` | boolean | Whether challenge was completed |
| `stars` | integer | Stars awarded (0-3) |
| `usedMercy` | boolean (optional) | Whether Mercy Rule was applied |

---

## Error Handling

### Standard Error Response
```json
{
    "error": "Error message description"
}
```

### Common Error Scenarios

#### Session Not Found
```http
POST /api/session/update
{
    "sessionId": "invalid-uuid",
    "result": { ... }
}
```

**Response (404):**
```json
{
    "error": "Session not found"
}
```

#### Malformed Request
```http
POST /api/session/start
{
    "invalidField": "value"
}
```

**Expected Behavior:** Server may return 500 or process with undefined values

**Recommendation:** Validate on client side before sending

---

## Client-Side API Wrapper

The frontend includes an API wrapper (`js/api.js`) for clean async calls:

```javascript
const API = {
    getManifest: async () => {
        const res = await fetch('/api/manifest');
        return await res.json();
    },
    
    startSession: async (profileName, charId, themeId) => {
        const res = await fetch('/api/session/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profileName, charId, themeId })
        });
        return await res.json();
    },
    
    updateProgress: async (sessionId, result) => {
        const res = await fetch('/api/session/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, result })
        });
        return await res.json();
    }
};
```

---

## Server Configuration

### Dependencies
```json
{
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "uuid": "^9.0.0"
}
```

### Middleware Stack
1. CORS (enabled for all origins)
2. JSON body parser
3. Static file serving (`/public`)

### Port Configuration
**Default:** `3000`

Change in `server.js`:
```javascript
const PORT = 3000; // Modify here
```

---

## Future API Enhancements

### Planned Endpoints

#### Get Session
```http
GET /api/session/:sessionId
```
Retrieve existing session without creating new one.

#### List Sessions
```http
GET /api/sessions?profileName=Alex
```
Get all sessions for a profile (for resume feature).

#### Delete Session
```http
DELETE /api/session/:sessionId
```
Remove saved session.

#### Analytics
```http
GET /api/analytics/:sessionId
```
Get detailed performance statistics.

---

## Testing

### Manual Testing

**1. Test Manifest Endpoint:**
```bash
curl http://localhost:3000/api/manifest
```

**2. Test Session Creation:**
```bash
curl -X POST http://localhost:3000/api/session/start \
  -H "Content-Type: application/json" \
  -d '{"profileName":"TestUser","charId":"knight","themeId":"forest"}'
```

**3. Test Progress Update:**
```bash
curl -X POST http://localhost:3000/api/session/update \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId":"YOUR_SESSION_ID",
    "result":{"success":true,"stars":3,"usedMercy":false}
  }'
```

### Browser Console Testing
```javascript
// Test from browser console
const test = async () => {
    const manifest = await API.getManifest();
    console.log('Manifest:', manifest);
    
    const session = await API.startSession('Test', 'knight', 'forest');
    console.log('Session:', session);
    
    const update = await API.updateProgress(session.sessionId, {
        success: true,
        stars: 3,
        usedMercy: false
    });
    console.log('Updated:', update);
};

test();
```

---

## Rate Limiting

**Current:** None

**Production Recommendation:**
- Implement rate limiting middleware (e.g., `express-rate-limit`)
- Limit: 100 requests per minute per IP
- Return 429 status on exceeded limits

---

## CORS Configuration

**Current:** Allow all origins
```javascript
app.use(cors());
```

**Production Recommendation:**
```javascript
app.use(cors({
    origin: 'https://yourdomain.com',
    credentials: true
}));
```
