const fs = require('fs');
const path = require('path');

// Ensure directories exist
const baseDir = path.join(__dirname, 'public', 'assets');
const themeDir = path.join(baseDir, 'themes');
const charDir = path.join(baseDir, 'characters');

[themeDir, charDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// --- SVG TEMPLATES ---

const createBgSVG = (color1, color2, shapeElement) => `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
    <pattern id="pat" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      ${shapeElement}
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)" />
  <rect width="100%" height="100%" fill="url(#pat)" fill-opacity="0.1" />
</svg>`;

const createCharSVG = (color, emoji) => `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45" fill="${color}" stroke="white" stroke-width="5"/>
  <text x="50" y="65" font-size="50" text-anchor="middle" font-family="Arial">${emoji}</text>
</svg>`;

// --- DATA DEFINITIONS ---

const themes = [
    {
        id: 'forest',
        bgColors: ['#2d5a27', '#1e3c1b'],
        bgPattern: '<circle cx="50" cy="50" r="20" fill="white"/>', // Trees (abstract)
        chars: [
            { id: 'forest_knight', color: '#e74c3c', icon: 'K' },
            { id: 'forest_ranger', color: '#2ecc71', icon: 'R' },
            { id: 'forest_bear', color: '#8e44ad', icon: 'B' }
        ]
    },
    {
        id: 'space',
        bgColors: ['#0f0c29', '#302b63'],
        bgPattern: '<circle cx="20" cy="20" r="2" fill="white"/><circle cx="80" cy="80" r="3" fill="white"/>', // Stars
        chars: [
            { id: 'space_astro', color: '#3498db', icon: 'A' },
            { id: 'space_alien', color: '#2ecc71', icon: 'X' },
            { id: 'space_robot', color: '#95a5a6', icon: 'R' }
        ]
    },
    {
        id: 'candy',
        bgColors: ['#ff9a9e', '#fad0c4'],
        bgPattern: '<rect x="25" y="25" width="50" height="50" rx="10" fill="white"/>', // Squares/Sugar
        chars: [
            { id: 'candy_ginger', color: '#d35400', icon: 'G' },
            { id: 'candy_queen', color: '#e91e63', icon: 'Q' },
            { id: 'candy_gummy', color: '#f1c40f', icon: 'Y' }
        ]
    },
    {
        id: 'ocean',
        bgColors: ['#2193b0', '#6dd5ed'],
        bgPattern: '<path d="M0 50 Q 25 25 50 50 T 100 50" fill="none" stroke="white" stroke-width="5"/>', // Waves
        chars: [
            { id: 'ocean_diver', color: '#e67e22', icon: 'D' },
            { id: 'ocean_mermaid', color: '#9b59b6', icon: 'M' },
            { id: 'ocean_crab', color: '#e74c3c', icon: 'C' }
        ]
    },
    {
        id: 'volcano',
        bgColors: ['#4a0000', '#800000'],
        bgPattern: '<polygon points="50,10 90,90 10,90" fill="white"/>', // Triangles
        chars: [
            { id: 'volcano_dragon', color: '#c0392b', icon: 'D' },
            { id: 'volcano_wiz', color: '#8e44ad', icon: 'W' },
            { id: 'volcano_golem', color: '#7f8c8d', icon: 'G' }
        ]
    },
    {
        id: 'sky',
        bgColors: ['#83a4d4', '#b6fbff'],
        bgPattern: '<circle cx="30" cy="30" r="15" fill="white"/><circle cx="50" cy="40" r="20" fill="white"/>', // Clouds
        chars: [
            { id: 'sky_pilot', color: '#2980b9', icon: 'P' },
            { id: 'sky_angel', color: '#f1c40f', icon: 'A' },
            { id: 'sky_bird', color: '#e74c3c', icon: 'B' }
        ]
    },
    {
        id: 'desert',
        bgColors: ['#fceabb', '#f8b500'],
        bgPattern: '<path d="M0 100 Q 50 50 100 100" fill="none" stroke="white" stroke-width="2"/>', // Dunes
        chars: [
            { id: 'desert_explorer', color: '#d35400', icon: 'E' },
            { id: 'desert_mummy', color: '#bdc3c7', icon: 'M' },
            { id: 'desert_camel', color: '#f39c12', icon: 'C' }
        ]
    },
    {
        id: 'ice',
        bgColors: ['#E0EAFC', '#CFDEF3'],
        bgPattern: '<rect x="40" y="0" width="20" height="100" fill="white"/>', // Icicles (vertical lines)
        chars: [
            { id: 'ice_yeti', color: '#ecf0f1', icon: 'Y' },
            { id: 'ice_penguin', color: '#2c3e50', icon: 'P' },
            { id: 'ice_queen', color: '#3498db', icon: 'Q' }
        ]
    }
];

// --- EXECUTION ---

console.log("Generating Assets...");

themes.forEach(theme => {
    // 1. Write Background SVG
    const bgSvg = createBgSVG(theme.bgColors[0], theme.bgColors[1], theme.bgPattern);
    fs.writeFileSync(path.join(themeDir, `${theme.id}_bg.svg`), bgSvg);
    console.log(`Created Theme: ${theme.id}`);

    // 2. Write Character SVGs
    theme.chars.forEach(char => {
        const charSvg = createCharSVG(char.color, char.icon);
        fs.writeFileSync(path.join(charDir, `${char.id}.svg`), charSvg);
    });
});

console.log(`\nSuccess! Generated ${themes.length} themes and ${themes.length * 3} characters.`);

/*
================================================================================
INSTRUCTIONS FOR RUNNING THE ADVENTURE GAME
================================================================================

Step 1: Initialize
1. Create a folder named `adventure-game`.
2. Ensure all project files (server.js, public/, etc.) are in place.

Step 2: Install Libraries
Open your terminal in the `adventure-game` folder and run:
> npm install

Step 3: Generate the Kid Themes
This script creates the actual image files for the themes defined above.
> node generate_assets.js

*Note: If you want to change the "Kid Themes" (e.g., change Space to Dinosaurs),
simply edit the `themes` array in this file before running the command.*

Step 4: Play!
Start the server:
> npm run dev

Open your browser to:
http://localhost:3000

================================================================================
*/
