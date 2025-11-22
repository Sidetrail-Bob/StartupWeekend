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

        // Canvas start button - skip setup and go directly to game
        const canvasStartBtn = document.getElementById('canvas-start-btn');
        if (canvasStartBtn) {
            console.log('Found canvas-start-btn, adding listener');
            canvasStartBtn.addEventListener('click', Game.onCanvasStart);
        } else {
            console.error('canvas-start-btn not found!');
        }

        // Listen for Map clicks
        window.addEventListener('node-clicked', (e) => {
            Game.handleNodeClick(e.detail.nodeId);
        });

        // 2. Load Assets (with error handling)
        try {
            Game.manifest = await API.getManifest();
            UIManager.populateConfig(Game.manifest);
        } catch (err) {
            console.error('Failed to load manifest:', err);
        }

        console.log('Game.init complete');
    },

    onCanvasStart: async () => {
        console.log('START button clicked!');

        // Hide the canvas start button
        document.getElementById('canvas-start-btn').classList.add('hidden');

        // Use defaults if manifest failed to load
        const themeId = Game.manifest?.themes?.[0]?.id || 'forest';
        const charId = Game.manifest?.characters?.[0]?.id || 'hero_boy';
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
        // In real app: pick game from manifest based on config.
        // Demo: Always use "math_add"
        const gameId = 'math_add';
        const gameModule = window.GameLibrary[gameId];

        if (!gameModule) {
            console.error("Game module not loaded!");
            return;
        }

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
                UIManager.showFeedback("VICTORY!", 5000);
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
    }
};

// Start the Engine
window.onload = Game.init;
