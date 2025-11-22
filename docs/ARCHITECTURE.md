# System Architecture

## Overview

The Adventure Map Game follows a **Client-Server model** using a plugin-style architecture where assets (Themes, Characters, Games) are recognized by their presence in specific folders rather than a central database registry.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  index.html (SPA)                                │  │
│  │  ├── UI Manager (Modals, Menus, Animations)     │  │
│  │  ├── Map Renderer (Canvas + Path Generation)    │  │
│  │  ├── Game Engine (State, Flow, Audio)           │  │
│  │  └── Mini-Game Modules (Pluggable)              │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↕ API (fetch)                    │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│              Node.js Server (Express)                    │
│  ├── Static File Serving (/public)                      │
│  ├── API Endpoints                                       │
│  │   ├── GET  /api/manifest                             │
│  │   ├── POST /api/session/start                        │
│  │   └── POST /api/session/update                       │
│  └── File System Storage (data/sessions/*.json)         │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
adventure-game/
├── server.js                   # Entry Point: Express Server & API
├── package.json                # Dependencies & Scripts
├── generate_assets.js          # Asset Generation Tool
│
├── data/                       # SERVER-SIDE STORAGE
│   └── sessions/               # User save files (e.g., uuid.json)
│
└── public/                     # CLIENT-SIDE APPLICATION
    ├── index.html              # Single Page Application Entry
    │
    ├── css/
    │   └── style.css           # Global Styles & Modal Animations
    │
    ├── assets/                 # CONTENT LIBRARIES
    │   ├── themes/             # Map Backgrounds (SVG)
    │   │   ├── forest_bg.svg
    │   │   ├── space_bg.svg
    │   │   └── ...
    │   ├── characters/         # Player Avatars (SVG)
    │   │   ├── forest_knight.svg
    │   │   ├── space_astro.svg
    │   │   └── ...
    │   └── audio/              # Voiceovers & SFX (future)
    │
    └── js/
        ├── main.js             # Game Manager (State, Level Flow, Audio)
        ├── api.js              # Fetch wrappers for Backend communication
        ├── map_renderer.js     # HTML5 Canvas Logic (Drawing paths/nodes)
        ├── ui_manager.js       # DOM Logic (Modals, Menus, Star Animations)
        │
        └── minigames/          # GAME LOGIC MODULES (Plugin Architecture)
            ├── game_math_add.js
            ├── game_memory_flip.js
            └── ... (Drop new JS files to add games)
```

## Component Architecture

### Backend Components

#### 1. Express Server (`server.js`)
**Responsibilities:**
- Serve static files from `/public`
- Provide REST API endpoints
- Manage session persistence
- Initialize data directories

**Key Features:**
- CORS enabled for local development
- JSON body parsing
- File-based session storage
- UUID generation for session IDs

#### 2. Data Storage (`data/sessions/`)
**Format:** JSON files (one per session)
**Naming:** `{uuid}.json`
**Persistence:** File system (no database required)

### Frontend Components

#### 1. Main Game Engine (`main.js`)
**Responsibilities:**
- Initialize application
- Manage game state
- Coordinate between UI, Map, and API
- Handle game flow logic
- Implement Mercy Rule system

**Key State:**
```javascript
{
    manifest: null,      // Available themes/chars/games
    session: null,       // Current player session
    currentNodeFailures: 0  // Mercy rule counter
}
```

#### 2. Map Renderer (`map_renderer.js`)
**Responsibilities:**
- HTML5 Canvas initialization
- Path generation (winding/circular)
- Node drawing and click detection
- Character position updates

**Rendering Features:**
- Responsive canvas (window resize)
- Dashed path lines
- Color-coded node status (locked/current/completed)
- Click hit detection (30px radius)

#### 3. UI Manager (`ui_manager.js`)
**Responsibilities:**
- Screen transitions
- Modal windows
- Character sprite movement
- Score updates
- Feedback messages

**UI Elements:**
- Setup panel (character/theme selection)
- Game container (canvas + HUD)
- Modal overlay (mini-games)
- Feedback messages (success/failure)

#### 4. API Layer (`api.js`)
**Responsibilities:**
- Abstract fetch calls
- Handle request/response formatting
- Error handling

**Methods:**
- `getManifest()` - Retrieve available content
- `startSession()` - Create new game session
- `updateProgress()` - Save game state

#### 5. Mini-Game Modules (`minigames/*.js`)
**Architecture:** Plugin-based
**Interface Standard:**
```javascript
window.GameLibrary["game_id"] = {
    config: {
        id: 'game_id',
        name: 'Display Name',
        type: 'category'
    },
    start: function(container, difficulty, onComplete) {
        // Game implementation
        // Must call onComplete(true/false) when done
    }
};
```

## Data Flow

### Session Creation Flow

```
User → UI (Setup Panel)
  ↓
UI → API.startSession(profileName, charId, themeId)
  ↓
API → POST /api/session/start
  ↓
Server → Create UUID, Build Session Object
  ↓
Server → Save to data/sessions/{uuid}.json
  ↓
Server → Return Session Object
  ↓
API → Return to Game Engine
  ↓
Game → Initialize Map, Place Character
```

### Challenge Flow

```
User Clicks Node
  ↓
Map Renderer → Dispatch 'node-clicked' event
  ↓
Game Engine → Validate (current node only)
  ↓
Game → Launch Mini-Game Modal
  ↓
Mini-Game → User Plays → Calls onComplete(success)
  ↓
Game Engine → Handle Result:
  ├─ Success: Award Stars, Update Progress
  ├─ Failure: Increment Failure Counter
  └─ 3rd Failure: Trigger Mercy Rule
  ↓
Game → API.updateProgress(sessionId, result)
  ↓
Server → Update session JSON file
  ↓
Game → Update UI (move character, update map)
```

## Storage Model

### Session File Structure
**Location:** `data/sessions/{sessionId}.json`

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
        { "node": 0, "success": true, "stars": 3 },
        { "node": 1, "success": true, "stars": 2 },
        { "node": 2, "success": false, "usedMercy": true }
    ]
}
```

### Asset Discovery
Assets are discovered by **directory scanning** (future) or **hardcoded manifest** (current demo):

**Current Implementation:**
```javascript
// server.js - Hardcoded manifest
{
    themes: [
        { id: 'forest', name: 'Whispering Woods', type: 'winding', color: '#2d5a27' },
        { id: 'space', name: 'Galactic Route', type: 'circular', color: '#000022' }
    ],
    characters: [...],
    games: [...]
}
```

**Future Enhancement:**
```javascript
// Scan public/assets/themes/ for *.svg files
// Scan public/js/minigames/ for game_*.js files
```

## Plugin Architecture

### Adding New Themes
1. Edit `generate_assets.js`
2. Add theme definition to `themes` array
3. Run `node generate_assets.js`
4. SVG files auto-generated in `public/assets/themes/`

### Adding New Mini-Games
1. Create `public/js/minigames/game_myname.js`
2. Implement standard interface
3. Include in `index.html`
4. Game auto-available via `window.GameLibrary`

## Rendering Architecture

### Canvas Rendering Pipeline

1. **Initialization**
   - Create canvas context
   - Set dimensions (full window)
   - Attach resize listener

2. **Node Generation**
   - Calculate positions based on theme type:
     - `circular`: Nodes arranged in circle
     - `winding`: Nodes on sine wave path
   - Store node positions in array

3. **Draw Loop**
   - Clear canvas
   - Draw connecting paths (dashed lines)
   - Draw nodes (circles with status colors)
   - Draw node numbers

4. **Interaction**
   - Listen for click events
   - Calculate distance from click to each node
   - Dispatch event if within 30px radius

### Character Animation
- CSS transitions (1s ease-in-out)
- Positioned absolutely over canvas
- Updated via `style.left` and `style.top`

## State Management

### Client-Side State
Managed in `Game` object (main.js):
- `manifest`: Static game content
- `session`: Current player session (synced with server)
- `currentNodeFailures`: Local counter for Mercy Rule

### Server-Side State
Persisted in JSON files:
- Session data per user
- No in-memory state (stateless API)

### State Synchronization
- Client is source of truth during gameplay
- Server confirms and persists on each update
- Server state loaded on page refresh

## Scalability Considerations

### Current Architecture (Demo)
- ✅ Simple file-based storage
- ✅ No database setup required
- ✅ Easy to understand and modify
- ⚠️ Limited to single server instance
- ⚠️ File I/O on every state change

### Production Enhancements
1. **Database Migration**
   - Replace JSON files with MongoDB/PostgreSQL
   - Add connection pooling
   - Implement caching layer

2. **Asset Management**
   - Move to CDN (Cloudflare, AWS S3)
   - Implement lazy loading
   - Add compression

3. **Authentication**
   - Add user accounts
   - JWT token-based auth
   - Session management

4. **Real-time Features**
   - WebSocket for live updates
   - Multi-player modes
   - Teacher dashboard live view

## Technology Choices

### Why Node.js?
- Simple HTTP server
- JavaScript on both client and server
- Rich npm ecosystem
- Easy deployment

### Why Vanilla JS?
- No framework overhead
- Fast load times
- Educational value (clear logic)
- Easy to modify

### Why File System Storage?
- Zero setup complexity
- Perfect for demo/prototype
- Easy to inspect and debug
- Portable (just copy folder)

### Why Canvas?
- Flexible path rendering
- Smooth animations
- Full control over visuals
- Good performance

## Security Considerations

### Current Demo
- ⚠️ No authentication
- ⚠️ Session IDs not validated
- ⚠️ Open CORS policy
- ⚠️ Direct file system access

### Production Recommendations
1. Add input validation
2. Implement rate limiting
3. Add HTTPS/TLS
4. Sanitize file paths
5. Add authentication middleware
6. Implement CSRF protection
