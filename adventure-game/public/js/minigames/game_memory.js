// Memory Flip Game
window.GameLibrary = window.GameLibrary || {};

window.GameLibrary['memory'] = {
    config: {
        id: 'memory',
        name: 'Memory Match',
        type: 'memory'
    },

    start: function(container, difficulty, onComplete) {
        container.innerHTML = '';

        // Difficulty determines number of pairs
        const pairCounts = { 1: 3, 2: 4, 3: 5, 4: 6, 5: 8 };
        const numPairs = pairCounts[difficulty] || 4;

        // Emoji symbols for cards
        const allSymbols = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑', '🌟', '🌙', '❤️', '💎'];
        const symbols = allSymbols.slice(0, numPairs);

        // Create pairs and shuffle
        let cards = [...symbols, ...symbols];
        cards = cards.sort(() => Math.random() - 0.5);

        // Game state
        let flipped = [];
        let matched = [];
        let canClick = true;

        // Create instruction
        const instruction = document.createElement('div');
        instruction.textContent = 'Match the pairs!';
        instruction.style.cssText = 'font-size: 24px; font-weight: bold; color: #2c3e50; margin-bottom: 20px;';
        container.appendChild(instruction);

        // Create grid
        const grid = document.createElement('div');
        const cols = numPairs <= 4 ? 4 : 4;
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(${cols}, 60px);
            gap: 10px;
            justify-content: center;
        `;
        container.appendChild(grid);

        // Create cards
        cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.dataset.symbol = symbol;
            card.style.cssText = `
                width: 60px;
                height: 60px;
                background: #3498db;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 30px;
                cursor: pointer;
                transition: transform 0.3s, background 0.3s;
                user-select: none;
            `;
            card.textContent = '?';

            card.addEventListener('click', () => {
                if (!canClick) return;
                if (flipped.includes(index)) return;
                if (matched.includes(index)) return;

                // Flip card
                card.textContent = symbol;
                card.style.background = '#ecf0f1';
                flipped.push(index);

                if (flipped.length === 2) {
                    canClick = false;
                    const [first, second] = flipped;
                    const firstCard = grid.children[first];
                    const secondCard = grid.children[second];

                    if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
                        // Match!
                        matched.push(first, second);
                        firstCard.style.background = '#27ae60';
                        secondCard.style.background = '#27ae60';
                        flipped = [];
                        canClick = true;

                        // Check win
                        if (matched.length === cards.length) {
                            setTimeout(() => onComplete(true), 500);
                        }
                    } else {
                        // No match - flip back
                        setTimeout(() => {
                            firstCard.textContent = '?';
                            firstCard.style.background = '#3498db';
                            secondCard.textContent = '?';
                            secondCard.style.background = '#3498db';
                            flipped = [];
                            canClick = true;
                        }, 1000);
                    }
                }
            });

            grid.appendChild(card);
        });
    }
};
