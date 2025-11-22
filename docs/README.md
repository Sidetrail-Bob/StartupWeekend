# Adventure Map Educational Game

**Version:** 1.2  
**Platform:** Web Browser (Node.js Local Server)  
**Target Audience:** Children ages 5-9

## Overview

A browser-based, single-player educational adventure game featuring a linear map where progress is gated by mini-games. The system includes adaptive difficulty that adjusts in real-time to prevent frustration, coupled with a "Mercy Rule" mechanism that ensures continuous progress.

## Key Features

- **Visual Adventure Maps** - Winding or circular paths with 8-10 challenge nodes
- **Educational Mini-Games** - Modular math, memory, and pattern-matching challenges
- **Adaptive Difficulty Engine** - Real-time adjustment based on performance (Levels 1-5)
- **Mercy Rule System** - After 3 failures, players advance with encouragement
- **Progress Tracking** - Session-based saves with analytics
- **Admin Dashboard** - Parent/teacher configuration and reporting
- **Kid Themes** - 8 colorful themes (Forest, Space, Candy, Ocean, Volcano, Sky, Desert, Ice)

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

```bash
# 1. Navigate to project directory
cd adventure-game

# 2. Install dependencies
npm install

# 3. Generate theme assets
node generate_assets.js

# 4. Start the server
npm run dev
```

### Play the Game

Open your browser to: **http://localhost:3000**

## Project Structure

```
adventure-game/
├── server.js              # Express server & API
├── package.json           # Dependencies
├── generate_assets.js     # SVG asset generator
├── data/
│   └── sessions/          # Player save files
└── public/
    ├── index.html         # Game interface
    ├── css/style.css      # Styling
    ├── assets/
    │   ├── themes/        # Generated backgrounds
    │   └── characters/    # Generated avatars
    └── js/
        ├── main.js        # Game engine
        ├── api.js         # Backend communication
        ├── map_renderer.js # Canvas rendering
        ├── ui_manager.js   # UI controls
        └── minigames/     # Game modules
```

## Technology Stack

- **Backend:** Node.js + Express
- **Frontend:** Vanilla JavaScript (no frameworks)
- **Storage:** File System (JSON)
- **Rendering:** HTML5 Canvas
- **Audio:** HTML5 Audio API

## Core Gameplay Loop

1. **Character Selection** - Choose avatar (Knight, Astronaut, Bunny, etc.)
2. **Map Navigation** - Click nodes to trigger challenges
3. **Mini-Game Challenge** - Solve educational puzzles
4. **Adaptive Feedback:**
   - ✅ 1st try success = 3 stars
   - ✅ 2nd try success = 2 stars
   - ✅ 3rd try success = 1 star
   - ❌ 3 failures = Mercy Rule (advance with 0 stars)
5. **Progress & Rewards** - Unlock new characters and themes

## User Personas

### Primary: The Player (Child)
- **Age:** 5-9 years old
- **Goal:** Reach the end of the map and unlock cool characters
- **Pain Point:** Getting stuck on hard problems

### Secondary: The Administrator (Parent/Teacher)
- **Goal:** Reinforce specific skills and track progress
- **Pain Point:** Games that are too easy (boring) or too hard (frustrating)

## Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and technical overview
- **[API.md](API.md)** - Backend endpoints and data models
- **[GAME_DESIGN.md](GAME_DESIGN.md)** - Game mechanics and UX flows
- **[SOURCE_CODE.md](SOURCE_CODE.md)** - Complete code reference
- **[SETUP.md](SETUP.md)** - Detailed installation guide

## Development Scripts

```bash
# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Generate/regenerate theme assets
node generate_assets.js
```

## Adding New Content

### New Theme
Edit `generate_assets.js` and add to the `themes` array:
```javascript
{
    id: 'myTheme',
    bgColors: ['#color1', '#color2'],
    bgPattern: '<svg-shape-element>',
    chars: [...]
}
```

### New Mini-Game
Create `/public/js/minigames/game_my_game.js`:
```javascript
window.GameLibrary["my_game"] = {
    config: { id: 'my_game', name: 'My Game', type: 'category' },
    start: function(container, difficulty, onComplete) {
        // Game logic here
        // Call onComplete(true/false) when done
    }
};
```

## License

Concept demonstration - Educational use

## Support

For questions or issues, please refer to the documentation files or contact the development team.
