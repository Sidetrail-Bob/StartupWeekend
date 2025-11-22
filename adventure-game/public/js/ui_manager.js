const UIManager = {
    showScreen: (id) => {
        document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        const target = document.getElementById(id);
        target.classList.remove('hidden');
        target.classList.add('active');
    },

    populateConfig: (manifest) => {
        const themeSelect = document.getElementById('config-theme');
        const charSelect = document.getElementById('config-char');

        manifest.themes.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.id; opt.textContent = t.name;
            themeSelect.appendChild(opt);
        });

        manifest.characters.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id; opt.textContent = c.name;
            charSelect.appendChild(opt);
        });
    },

    moveCharacter: (x, y, charId) => {
        const sprite = document.getElementById('character-sprite');
        sprite.style.display = 'block';
        // Use character SVG as background
        sprite.style.backgroundImage = `url('assets/characters/${charId}.svg')`;
        sprite.style.backgroundSize = 'cover';
        sprite.style.backgroundColor = 'transparent';
        // Center sprite on node (150px width)
        sprite.style.left = (x - 75) + 'px';
        sprite.style.top = (y - 75) + 'px';
    },

    openModal: (title) => {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('game-modal').classList.remove('hidden');
    },

    closeModal: () => {
        document.getElementById('game-modal').classList.add('hidden');
        document.getElementById('minigame-container').innerHTML = ''; // Cleanup
    },

    updateScore: (stars) => {
        document.getElementById('score-display').textContent = stars;
    },

    showFeedback: (msg, duration = 2000) => {
        const el = document.getElementById('feedback-msg');
        el.textContent = msg;
        el.classList.remove('hidden');
        setTimeout(() => el.classList.add('hidden'), duration);
    }
};
