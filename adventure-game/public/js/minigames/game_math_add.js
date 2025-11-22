// Standard Interface: window.GameLibrary["ID"]
window.GameLibrary = window.GameLibrary || {};

window.GameLibrary["math_add"] = {
    config: {
        id: 'math_add',
        name: 'Number Cruncher',
        type: 'math'
    },

    start: function(container, difficulty, onComplete) {
        container.innerHTML = ''; // Clear

        // 1. Generate Question based on difficulty
        // Diff 1: 1-5, Diff 5: 10-20
        const max = difficulty * 4 + 1;
        const n1 = Math.floor(Math.random() * max) + 1;
        const n2 = Math.floor(Math.random() * max) + 1;
        const answer = n1 + n2;

        // 2. Create UI
        const display = document.createElement('div');
        display.className = 'game-display';
        display.textContent = `${n1} + ${n2} = ?`;

        const optionsDiv = document.createElement('div');

        // Generate 3 options (1 correct, 2 wrong)
        const options = [answer, answer + 1, answer - 1].sort(() => Math.random() - 0.5);

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'game-btn';
            btn.textContent = opt;
            btn.onclick = () => {
                if (opt === answer) {
                    onComplete(true); // Success
                } else {
                    onComplete(false); // Fail
                }
            };
            optionsDiv.appendChild(btn);
        });

        container.appendChild(display);
        container.appendChild(optionsDiv);
    }
};
