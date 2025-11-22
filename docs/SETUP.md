# Setup & Installation Guide

Complete guide to installing, configuring, and deploying the Adventure Map Educational Game.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Installation](#detailed-installation)
4. [Configuration](#configuration)
5. [Development Workflow](#development-workflow)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

**Node.js** (v14 or higher)
```bash
# Check version
node --version

# Should output: v14.x.x or higher
```

**Download:** [https://nodejs.org](https://nodejs.org)

**npm** (comes with Node.js)
```bash
# Check version
npm --version

# Should output: 6.x.x or higher
```

### Optional Tools

**nodemon** (for auto-restart during development)
- Included in `devDependencies`
- Automatically installed with `npm install`

**Git** (for version control)
```bash
git --version
```

---

## Quick Start

### 5-Minute Setup

```bash
# 1. Clone or create project directory
mkdir adventure-game
cd adventure-game

# 2. Copy all project files to this directory
# (server.js, package.json, public/, generate_assets.js)

# 3. Install dependencies
npm install

# 4. Generate game assets
node generate_assets.js

# 5. Start the server
npm run dev

# 6. Open browser
# Navigate to: http://localhost:3000
```

**Expected Output:**
```
> adventure-game-concept@1.0.0 dev
> nodemon server.js

[nodemon] 3.0.0
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,json
[nodemon] starting `node server.js`
Server running at http://localhost:3000
```

---

## Detailed Installation

### Step 1: Project Structure Setup

Create the following directory structure:

```
adventure-game/
├── server.js
├── package.json
├── generate_assets.js
├── data/                    # Auto-created
│   └── sessions/            # Auto-created
└── public/
    ├── index.html
    ├── css/
    │   └── style.css
    ├── assets/              # Created by generate_assets.js
    │   ├── themes/
    │   └── characters/
    └── js/
        ├── main.js
        ├── api.js
        ├── map_renderer.js
        ├── ui_manager.js
        └── minigames/
            └── game_math_add.js
```

### Step 2: Create Files

**Option A: Manual Creation**
1. Create each file from [SOURCE_CODE.md](SOURCE_CODE.md)
2. Copy contents into respective files
3. Ensure proper directory structure

**Option B: Clone Repository** (if available)
```bash
git clone [repository-url]
cd adventure-game
```

### Step 3: Install Dependencies

```bash
npm install
```

**What Gets Installed:**

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Web server framework |
| cors | ^2.8.5 | Cross-origin resource sharing |
| uuid | ^9.0.0 | Generate unique session IDs |
| nodemon | ^3.0.0 | Auto-restart on file changes (dev) |

**Verify Installation:**
```bash
ls node_modules/
# Should show: cors, express, uuid, nodemon, etc.
```

### Step 4: Generate Assets

```bash
node generate_assets.js
```

**Expected Output:**
```
Generating Assets...
Created Theme: forest
Created Theme: space
Created Theme: candy
Created Theme: ocean
Created Theme: volcano
Created Theme: sky
Created Theme: desert
Created Theme: ice

Success! Generated 8 themes and 24 characters.
```

**Verify Assets Created:**
```bash
ls public/assets/themes/
# forest_bg.svg  space_bg.svg  candy_bg.svg  ocean_bg.svg
# volcano_bg.svg  sky_bg.svg  desert_bg.svg  ice_bg.svg

ls public/assets/characters/
# forest_knight.svg  forest_ranger.svg  forest_bear.svg
# space_astro.svg  space_alien.svg  space_robot.svg
# (etc... 24 total)
```

### Step 5: Start Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

### Step 6: Access Application

Open browser and navigate to:
```
http://localhost:3000
```

**What You Should See:**
- Setup panel with theme/character selection
- "Let's Go!" button
- Dropdown menus populated with options

---

## Configuration

### Change Server Port

**File:** `server.js`

```javascript
// Find this line (around line 8):
const PORT = 3000;

// Change to desired port:
const PORT = 8080;
```

**Restart server** after changing.

### Add Custom Themes

**File:** `generate_assets.js`

Add new theme to `themes` array:

```javascript
const themes = [
    // ... existing themes
    {
        id: 'dinosaur',
        bgColors: ['#8B7355', '#D2691E'],
        bgPattern: '<polygon points="50,20 70,80 30,80" fill="white"/>',
        chars: [
            { id: 'dino_trex', color: '#228B22', icon: '🦖' },
            { id: 'dino_ptero', color: '#87CEEB', icon: '🦅' },
            { id: 'dino_bronto', color: '#A0522D', icon: '🦕' }
        ]
    }
];
```

**Re-generate assets:**
```bash
node generate_assets.js
```

### Enable CORS for Specific Origins

**File:** `server.js`

```javascript
// Change from:
app.use(cors());

// To:
app.use(cors({
    origin: 'https://yourdomain.com',
    credentials: true
}));
```

### Configure Session Storage Location

**File:** `server.js`

```javascript
// Find these lines (around line 12):
const DATA_DIR = path.join(__dirname, 'data');
const SESSIONS_DIR = path.join(DATA_DIR, 'sessions');

// Change to custom path:
const DATA_DIR = '/path/to/custom/storage';
```

---

## Development Workflow

### File Watching

When running `npm run dev`, nodemon watches for changes to `.js` and `.json` files.

**Auto-reload triggers:**
- Any change to `server.js`
- Any change to `.js` files in project root
- Any change to `package.json`

**Manual restart:**
```bash
# In terminal where server is running, type:
rs
```

### Frontend Development

**CSS Changes:**
- Edit `public/css/style.css`
- Refresh browser (no server restart needed)

**JavaScript Changes:**
- Edit any file in `public/js/`
- Refresh browser (no server restart needed)

**HTML Changes:**
- Edit `public/index.html`
- Refresh browser (no server restart needed)

### Backend Development

**API Changes:**
- Edit `server.js`
- Server auto-restarts (if using nodemon)
- Refresh browser

### Testing Changes

**Browser Console:**
```javascript
// Test API
API.getManifest().then(console.log);

// Test session creation
API.startSession('Test', 'knight', 'forest').then(console.log);
```

**cURL Testing:**
```bash
# Test manifest endpoint
curl http://localhost:3000/api/manifest

# Test session creation
curl -X POST http://localhost:3000/api/session/start \
  -H "Content-Type: application/json" \
  -d '{"profileName":"Test","charId":"knight","themeId":"forest"}'
```

---

## Deployment

### Option 1: Local Hosting (LAN Access)

**Find Your Local IP:**
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
# or
hostname -I
```

**Update Server to Accept All IPs:**

File: `server.js`
```javascript
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
```

**Access from Other Devices:**
```
http://[your-ip-address]:3000
# Example: http://192.168.1.100:3000
```

### Option 2: Production Server (VPS/Cloud)

**Requirements:**
- Ubuntu/Debian server
- Root or sudo access
- Domain name (optional)

**Installation Steps:**

```bash
# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Upload project files
scp -r adventure-game/ user@server:/var/www/

# 3. SSH into server
ssh user@server

# 4. Navigate to project
cd /var/www/adventure-game

# 5. Install dependencies
npm install --production

# 6. Generate assets
node generate_assets.js

# 7. Install PM2 (process manager)
sudo npm install -g pm2

# 8. Start with PM2
pm2 start server.js --name adventure-game

# 9. Enable auto-start on reboot
pm2 startup
pm2 save
```

**Setup Nginx Reverse Proxy:**

```bash
# Install nginx
sudo apt install nginx

# Create config
sudo nano /etc/nginx/sites-available/adventure-game
```

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/adventure-game /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### Option 3: Platform as a Service (PaaS)

**Heroku Deployment:**

1. **Create `Procfile`:**
   ```
   web: node server.js
   ```

2. **Update `package.json`:**
   ```json
   "engines": {
     "node": "18.x"
   }
   ```

3. **Deploy:**
   ```bash
   heroku create adventure-game-app
   git push heroku main
   heroku open
   ```

**Render.com Deployment:**

1. Connect GitHub repository
2. Set build command: `npm install && node generate_assets.js`
3. Set start command: `npm start`
4. Deploy

**Railway.app Deployment:**

1. Connect GitHub repository
2. Auto-detects Node.js
3. Deploy automatically

---

## Environment Variables

### Create `.env` File

```bash
touch .env
```

**Example `.env`:**
```
PORT=3000
NODE_ENV=development
DATA_DIR=./data
```

### Install dotenv

```bash
npm install dotenv
```

### Update `server.js`

```javascript
// At the top of server.js
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
```

---

## Troubleshooting

### Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution 1:** Find and kill process
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 [PID]
```

**Solution 2:** Use different port
```javascript
// In server.js
const PORT = 3001; // or any available port
```

### Cannot Find Module

**Error:**
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
rm package-lock.json
npm install
```

### Assets Not Generating

**Error:**
```
Error: ENOENT: no such file or directory, open 'public/assets/themes/...'
```

**Solution:**
```bash
# Create directories manually
mkdir -p public/assets/themes
mkdir -p public/assets/characters

# Run generator
node generate_assets.js
```

### Session Not Found (404)

**Issue:** API returns "Session not found" error

**Causes:**
1. Data directory doesn't exist
2. Session file was deleted
3. Wrong session ID in request

**Solution:**
```bash
# Check data directory exists
ls data/sessions/

# Verify session file
cat data/sessions/[session-id].json

# Start new session if needed
```

### Canvas Not Rendering

**Issue:** Game screen is blank

**Solutions:**

1. **Check browser console:**
   - Open DevTools (F12)
   - Look for JavaScript errors

2. **Verify scripts loaded:**
   ```html
   <!-- In index.html, check all script tags are present -->
   <script src="js/api.js"></script>
   <script src="js/map_renderer.js"></script>
   <script src="js/ui_manager.js"></script>
   <script src="js/minigames/game_math_add.js"></script>
   <script src="js/main.js"></script>
   ```

3. **Check network tab:**
   - Ensure all files loaded (200 status)

### CORS Errors

**Error:**
```
Access to fetch at 'http://localhost:3000/api/manifest' from origin 'http://127.0.0.1:3000' has been blocked by CORS policy
```

**Solution:**
```javascript
// In server.js, ensure CORS is enabled
app.use(cors());
```

---

## Performance Optimization

### Production Build Steps

1. **Minify CSS:**
   ```bash
   npm install -g csso-cli
   csso public/css/style.css -o public/css/style.min.css
   ```

2. **Minify JavaScript:**
   ```bash
   npm install -g terser
   terser public/js/main.js -o public/js/main.min.js
   ```

3. **Update HTML References:**
   ```html
   <link rel="stylesheet" href="css/style.min.css">
   <script src="js/main.min.js"></script>
   ```

### Enable Compression

```bash
npm install compression
```

```javascript
// In server.js
const compression = require('compression');
app.use(compression());
```

### Cache Static Assets

```javascript
// In server.js
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d' // Cache for 1 day
}));
```

---

## Security Hardening

### Add Helmet (Security Headers)

```bash
npm install helmet
```

```javascript
// In server.js
const helmet = require('helmet');
app.use(helmet());
```

### Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### Input Validation

```bash
npm install express-validator
```

```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/session/start',
    body('profileName').isString().trim().isLength({ min: 1, max: 50 }),
    body('charId').isString().trim(),
    body('themeId').isString().trim(),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // ... rest of logic
    }
);
```

---

## Monitoring

### Enable Logging

```bash
npm install morgan
```

```javascript
const morgan = require('morgan');
app.use(morgan('combined'));
```

### PM2 Monitoring

```bash
# View logs
pm2 logs adventure-game

# Monitor resources
pm2 monit

# Generate startup script
pm2 startup
```

---

## Backup & Maintenance

### Backup Session Data

```bash
# Create backup
tar -czf sessions-backup-$(date +%Y%m%d).tar.gz data/sessions/

# Restore backup
tar -xzf sessions-backup-20240101.tar.gz
```

### Clear Old Sessions

```bash
# Remove sessions older than 30 days
find data/sessions/ -name "*.json" -mtime +30 -delete
```

---

## Next Steps

After successful installation:

1. **Customize Themes** - Add your own themes in `generate_assets.js`
2. **Create Mini-Games** - Build educational games in `public/js/minigames/`
3. **Add Audio** - Include sound effects and voiceovers
4. **Build Dashboard** - Create admin interface for analytics
5. **Deploy** - Put game online for users

**Further Documentation:**
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [GAME_DESIGN.md](GAME_DESIGN.md) - Game mechanics
- [API.md](API.md) - Backend API reference
