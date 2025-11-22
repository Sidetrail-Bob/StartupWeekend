const Game = {
    manifest: null,
    session: null,
    currentNodeFailures: 0,

    init: async () => {
        console.log('Game.init starting...');

        // 1. Setup Event Listeners FIRST (before any async operations)
        const btnStart = document.getElementById('btn-start');
        if (btnStart) {
            btnStart.addEventListener('click', Game.startGame);
        }

        // Canvas start button
        const canvasStartBtn = document.getElementById('canvas-start-btn');
        if (canvasStartBtn) {
            console.log('Found canvas-start-btn, adding listener');
            canvasStartBtn.addEventListener('click', Game.onCanvasStart);
        } else {
            console.error('canvas-start-btn not found!');
        }

        // Play again button
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', Game.playAgain);
        }

        // Listen for Map clicks
        window.addEventListener('node-clicked', (e) => {
            Game.handleNodeClick(e.detail.nodeId);
        });

        // 2. Load Assets (with error handling)
        try {
            Game.manifest = await API.getManifest();
            UIManager.populateConfig(Game.manifest);
            Game.populateCanvasSelects(Game.manifest);
        } catch (err) {
            console.error('Failed to load manifest:', err);
            // Use defaults if server fails
            Game.populateCanvasSelects(null);
        }

        console.log('Game.init complete');
    },

    populateCanvasSelects: (manifest) => {
        const themeSelect = document.getElementById('canvas-theme-select');
        const charSelect = document.getElementById('canvas-char-select');

        if (manifest) {
            manifest.themes.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = t.name;
                themeSelect.appendChild(opt);
            });

            manifest.characters.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.name;
                charSelect.appendChild(opt);
            });
        } else {
            // Fallback defaults
            themeSelect.innerHTML = '<option value="forest">Whispering Woods</option><option value="space">Galactic Route</option>';
            charSelect.innerHTML = '<option value="bunny">Fluffy Bunny</option><option value="bear">Friendly Bear</option>';
        }
    },

    onCanvasStart: async () => {
        console.log('START button clicked!');

        // Hide the canvas start menu
        document.getElementById('canvas-start-menu').classList.add('hidden');

        // Get selected values from dropdowns
        const themeId = document.getElementById('canvas-theme-select').value || 'forest';
        const charId = document.getElementById('canvas-char-select').value || 'bunny';
        console.log('Using theme:', themeId, 'char:', charId);

        try {
            // Create Session on Server
            Game.session = await API.startSession('Player', charId, themeId);
            console.log('Session created:', Game.session);
        } catch (err) {
            console.error('Failed to start session:', err);
            // Create a local session if server is down
            Game.session = {
                sessionId: 'local-' + Date.now(),
                currentNode: 0,
                currentLevel: 1,
                totalStars: 0,
                characterId: charId,
                mercyMode: false
            };
            console.log('Using local session:', Game.session);
        }

        // Apply theme background
        const gameContainer = document.getElementById('game-container');
        gameContainer.style.backgroundImage = `url('assets/themes/${themeId}_bg.svg')`;
        gameContainer.style.backgroundSize = 'cover';
        gameContainer.style.backgroundPosition = 'center';

        // Initialize and render map
        console.log('Initializing map...');
        MapRenderer.init('map-canvas');
        const themeType = Game.manifest?.themes?.find(t => t.id === themeId)?.type || 'winding';
        MapRenderer.generateNodes(themeType);

        // Place Character at Start
        const startNode = MapRenderer.getNodePos(0);
        console.log('Start node:', startNode);
        UIManager.moveCharacter(startNode.x, startNode.y, charId);

        // Intro Message
        UIManager.showFeedback("Let's Go!");
        console.log('Game started!');
    },

    startGame: async () => {
        const themeId = document.getElementById('config-theme').value;
        const charId = document.getElementById('config-char').value;

        // Create Session on Server
        Game.session = await API.startSession('Player', charId, themeId);

        // Switch Screen
        UIManager.showScreen('game-container');

        // Render Map
        const theme = Game.manifest.themes.find(t => t.id === themeId);

        // Apply theme background
        const gameContainer = document.getElementById('game-container');
        gameContainer.style.backgroundImage = `url('assets/themes/${themeId}_bg.svg')`;
        gameContainer.style.backgroundSize = 'cover';
        gameContainer.style.backgroundPosition = 'center';
        MapRenderer.init('map-canvas');
        MapRenderer.generateNodes(theme.type);

        // Place Character at Start
        const startNode = MapRenderer.getNodePos(0);
        UIManager.moveCharacter(startNode.x, startNode.y, charId);

        // Intro Message
        UIManager.showFeedback("Let's Go!");
    },

    handleNodeClick: (nodeId) => {
        console.log('handleNodeClick called with nodeId:', nodeId, 'currentNode:', Game.session?.currentNode);
        // Rule: Can only click the CURRENT node (the active challenge)
        if (nodeId !== Game.session.currentNode) {
            console.log('Node not current, ignoring');
            return;
        }

        console.log('Launching challenge!');
        Game.launchChallenge();
    },

    launchChallenge: () => {
        // Randomly pick from available games
        const availableGames = ['math_add', 'memory', 'pattern'];
        const gameId = availableGames[Math.floor(Math.random() * availableGames.length)];
        const gameModule = window.GameLibrary[gameId];

        if (!gameModule) {
            console.error("Game module not loaded:", gameId);
            return;
        }

        console.log('Launching game:', gameId);
        UIManager.openModal(gameModule.config.name);

        // DIFFICULTY LOGIC
        // Base difficulty = Level (1).
        // If Mercy Mode is on, reduce difficulty by 1 (min 1).
        let difficulty = Game.session.currentLevel;
        if (Game.session.mercyMode) difficulty = Math.max(1, difficulty - 1);

        const container = document.getElementById('minigame-container');

        // Start the Minigame
        gameModule.start(container, difficulty, (success) => {
            Game.handleChallengeResult(success);
        });
    },

    handleChallengeResult: async (success) => {
        UIManager.closeModal();

        if (success) {
            // SUCCESS LOGIC
            UIManager.showFeedback("Awesome! ***");

            // Calculate Stars (Simplified: always 3 for win)
            const stars = 3;

            // Update Server
            const res = await API.updateProgress(Game.session.sessionId, {
                success: true, stars: stars
            });
            Game.session = res.state;
            Game.currentNodeFailures = 0; // Reset fails

            // Update Map
            MapRenderer.updateNodeStatus(Game.session.currentNode - 1, 'completed');
            if (Game.session.currentNode < 9) {
                MapRenderer.updateNodeStatus(Game.session.currentNode, 'current');

                // Move Character
                const nextPos = MapRenderer.getNodePos(Game.session.currentNode);
                UIManager.moveCharacter(nextPos.x, nextPos.y, Game.session.characterId);
                UIManager.updateScore(Game.session.totalStars);
            } else {
                // VICTORY!
                Game.showVictory();
            }

        } else {
            // FAILURE LOGIC
            Game.currentNodeFailures++;

            if (Game.currentNodeFailures >= 3) {
                // MERCY RULE TRIGGER
                UIManager.showFeedback("Good Try! Let's move on.");

                // Tell server we used mercy
                const res = await API.updateProgress(Game.session.sessionId, {
                    success: false, stars: 0, usedMercy: true
                });
                Game.session = res.state;
                Game.currentNodeFailures = 0;

                // Move Character (same as win, but no stars)
                MapRenderer.updateNodeStatus(Game.session.currentNode - 1, 'completed');
                MapRenderer.updateNodeStatus(Game.session.currentNode, 'current');

                const nextPos = MapRenderer.getNodePos(Game.session.currentNode);
                UIManager.moveCharacter(nextPos.x, nextPos.y, Game.session.characterId);
            } else {
                // Simple Fail
                UIManager.showFeedback("Try Again!");
            }
        }
    },

    showVictory: () => {
        // Update star count display
        document.getElementById('victory-star-count').textContent = Game.session.totalStars;
        // Show victory screen
        document.getElementById('victory-screen').classList.remove('hidden');
        // Stop the map animation
        if (MapRenderer.animationId) {
            cancelAnimationFrame(MapRenderer.animationId);
        }
    },

    playAgain: () => {
        // Hide victory screen
        document.getElementById('victory-screen').classList.add('hidden');
        // Show start menu
        document.getElementById('canvas-start-menu').classList.remove('hidden');
        // Hide character
        document.getElementById('character-sprite').style.display = 'none';
        // Reset score display
        document.getElementById('score-display').textContent = '0';
        // Clear the canvas
        const canvas = document.getElementById('map-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Reset game state
        Game.session = null;
        Game.currentNodeFailures = 0;
    }
};

// Start the Engine
window.onload = Game.init;
