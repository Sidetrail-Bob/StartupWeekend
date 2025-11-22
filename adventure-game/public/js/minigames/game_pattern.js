// Pattern Matching Game
window.GameLibrary = window.GameLibrary || {};

window.GameLibrary['pattern'] = {
    config: {
        id: 'pattern',
        name: 'Pattern Match',
        type: 'logic'
    },

    start: function(container, difficulty, onComplete) {
        container.innerHTML = '';

        // Symbols for patterns
        const allSymbols = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];

        // Generate pattern based on difficulty
        let pattern = [];
        let patternLength;

        switch(difficulty) {
            case 1: // AB pattern
                patternLength = 4;
                pattern = ['🔴', '🔵', '🔴', '🔵'];
                break;
            case 2: // ABC pattern
                patternLength = 6;
                pattern = ['🔴', '🔵', '🟢', '🔴', '🔵', '🟢'];
                break;
            case 3: // AABB pattern
                patternLength = 6;
                pattern = ['🔴', '🔴', '🔵', '🔵', '🔴', '🔴'];
                break;
            case 4: // ABBA pattern
                patternLength = 6;
                pattern = ['🔴', '🔵', '🔵', '🔴', '🔴', '🔵'];
                break;
            default: // ABAC pattern
                patternLength = 6;
                pattern = ['🔴', '🔵', '🔴', '🟢', '🔴', '🔵'];
        }

        // Figure out the correct answer (next in sequence)
        const correctAnswer = pattern[pattern.length % (pattern.length / 2 + 1)] || pattern[0];

        // Create instruction
        const instruction = document.createElement('div');
        instruction.textContent = "What comes next?";
        instruction.style.cssText = 'font-size: 24px; font-weight: bold; color: #2c3e50; margin-bottom: 20px;';
        container.appendChild(instruction);

        // Show pattern (with last one as ?)
        const patternDisplay = document.createElement('div');
        patternDisplay.style.cssText = 'font-size: 40px; margin-bottom: 30px; letter-spacing: 10px;';

        // Show pattern minus last + question mark
        const visiblePattern = pattern.slice(0, -1).join(' ') + ' ❓';
        patternDisplay.textContent = visiblePattern;
        container.appendChild(patternDisplay);

        // Create answer buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;';

        // Get unique symbols from pattern for choices
        const uniqueSymbols = [...new Set(pattern)];
        // Add one wrong answer if needed
        if (uniqueSymbols.length < 3) {
            for (const sym of allSymbols) {
                if (!uniqueSymbols.includes(sym)) {
                    uniqueSymbols.push(sym);
                    if (uniqueSymbols.length >= 3) break;
                }
            }
        }

        // Shuffle choices
        const choices = uniqueSymbols.sort(() => Math.random() - 0.5).slice(0, 4);
        // Ensure correct answer is in choices
        if (!choices.includes(pattern[pattern.length - 1])) {
            choices[0] = pattern[pattern.length - 1];
            choices.sort(() => Math.random() - 0.5);
        }

        choices.forEach(symbol => {
            const btn = document.createElement('button');
            btn.textContent = symbol;
            btn.style.cssText = `
                font-size: 40px;
                padding: 15px 25px;
                border: none;
                border-radius: 15px;
                background: #3498db;
                cursor: pointer;
                transition: transform 0.2s, background 0.2s;
            `;

            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.1)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
            });

            btn.addEventListener('click', () => {
                const isCorrect = symbol === pattern[pattern.length - 1];

                if (isCorrect) {
                    btn.style.background = '#27ae60';
                    // Show complete pattern
                    patternDisplay.textContent = pattern.join(' ');
                } else {
                    btn.style.background = '#e74c3c';
                }

                // Disable all buttons
                buttonContainer.querySelectorAll('button').forEach(b => {
                    b.style.pointerEvents = 'none';
                });

                setTimeout(() => onComplete(isCorrect), 1000);
            });

            buttonContainer.appendChild(btn);
        });

        container.appendChild(buttonContainer);
    }
};
