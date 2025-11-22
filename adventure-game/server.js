const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Data Directory Setup
const DATA_DIR = path.join(__dirname, 'data');
const SESSIONS_DIR = path.join(DATA_DIR, 'sessions');

// Ensure directories exist on start
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR);

// --- API ROUTES ---

// 1. Get Manifest (Available Themes/Games)
// Returns hardcoded lists that match the file structure.
app.get('/api/manifest', (req, res) => {
    res.json({
        themes: [
            { id: 'forest', name: 'Whispering Woods', type: 'winding', color: '#2d5a27' },
            { id: 'space', name: 'Galactic Route', type: 'circular', color: '#000022' }
        ],
        characters: [
            { id: 'bunny', name: 'Fluffy Bunny' },
            { id: 'bear', name: 'Friendly Bear' },
            { id: 'knight', name: 'Brave Knight' },
            { id: 'astronaut', name: 'Space Explorer' },
            { id: 'robot', name: 'Robot Buddy' },
            { id: 'alien', name: 'Alien Friend' }
        ],
        games: [
            { id: 'math_add', name: 'Number Cruncher', script: 'js/minigames/game_math_add.js' }
        ]
    });
});

// 2. Start/Resume Session
app.post('/api/session/start', (req, res) => {
    const { profileName, charId, themeId } = req.body;

    const sessionId = uuidv4();

    const newSession = {
        sessionId,
        profileName,
        characterId: charId,
        themeId: themeId,
        currentLevel: 1,
        currentNode: 0, // Index of node (0-9)
        totalStars: 0,
        mercyMode: false, // If true, next game is easier
        nodeHistory: [] // Track wins/losses
    };

    // Save to file system
    fs.writeFileSync(
        path.join(SESSIONS_DIR, `${sessionId}.json`),
        JSON.stringify(newSession, null, 2)
    );

    res.json(newSession);
});

// 3. Update Progress
app.post('/api/session/update', (req, res) => {
    const { sessionId, result } = req.body;
    // result structure: { success: boolean, stars: int, usedMercy: boolean }

    const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Session not found" });
    }

    const session = JSON.parse(fs.readFileSync(filePath));

    // Game Logic: Update State
    if (result.success) {
        session.currentNode++;
        session.totalStars += result.stars;
        session.mercyMode = false; // Reset mercy on win
    } else {
        // If they failed 3 times and triggered mercy rule
        if (result.usedMercy) {
            session.currentNode++; // Advance
            session.mercyMode = true; // Next game is easier
        }
    }

    fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
    res.json({ success: true, state: session });
});

// 4. Admin: Get All Sessions
app.get('/api/admin/sessions', (req, res) => {
    try {
        const files = fs.readdirSync(SESSIONS_DIR);
        const sessions = files
            .filter(f => f.endsWith('.json'))
            .map(f => {
                const content = fs.readFileSync(path.join(SESSIONS_DIR, f));
                return JSON.parse(content);
            });
        res.json(sessions);
    } catch (err) {
        res.json([]);
    }
});

// 5. Admin: Clear All Sessions
app.delete('/api/admin/sessions', (req, res) => {
    try {
        const files = fs.readdirSync(SESSIONS_DIR);
        files.forEach(f => {
            if (f.endsWith('.json')) {
                fs.unlinkSync(path.join(SESSIONS_DIR, f));
            }
        });
        res.json({ success: true, deleted: files.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
