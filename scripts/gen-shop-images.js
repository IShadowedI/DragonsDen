// Generate SVG product placeholder images for the shop
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'build', 'assets', 'img', 'shop');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const products = [
  // Maps
  { id: 'dungeon-map-pack', label: 'Dungeon Map\nPack Vol. 1', icon: 'M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7.66 3.83L12 11.83 4.34 8.01 12 4.18zM4 9.04l7 3.5V20l-7-3.5V9.04zm9 10.96v-7.46l7-3.5V16.5l-7 3.5z', color: '#8B0000', bg: '#1a0505' },
  { id: 'wilderness-encounters', label: 'Wilderness\nEncounters', icon: 'M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z', color: '#2E7D32', bg: '#051a05' },
  { id: 'coastal-sea-maps', label: 'Coastal &\nSea Maps', icon: 'M2 16c1-1 2.5-2 4-2s3 1 4 2 2.5 2 4 2 3-1 4-2 2.5-2 4-2v4H2v-4zm0-4c1-1 2.5-2 4-2s3 1 4 2 2.5 2 4 2 3-1 4-2 2.5-2 4-2v4c-1.5 0-3 1-4 2s-2.5 2-4 2-3-1-4-2-2.5-2-4-2v-4zm0-4c1-1 2.5-2 4-2s3 1 4 2 2.5 2 4 2 3-1 4-2 2.5-2 4-2v4c-1.5 0-3 1-4 2s-2.5 2-4 2-3-1-4-2-2.5-2-4-2V8z', color: '#0288D1', bg: '#051520' },
  { id: 'tavern-inn-maps', label: 'Tavern &\nInn Maps', icon: 'M2 20h20v2H2v-2zm2-2h2v-3h4v3h2V8l-5-3-5 3v10zm14 0h2V10l-3-1.5V4h-2v3.5L12 9v9h2v-3h4v3z', color: '#FF8F00', bg: '#1a1005' },

  // Templates
  { id: 'character-sheet-bundle', label: 'Character\nSheet Bundle', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 7V3.5L18.5 9H13zM8 13h8v2H8v-2zm0 4h8v2H8v-2z', color: '#7B1FA2', bg: '#140520' },
  { id: 'session-planner', label: 'Session\nPlanner', icon: 'M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z', color: '#00897B', bg: '#051a18' },
  { id: 'resume-cv-pack', label: 'Resume &\nCV Pack', icon: 'M20 6H12L10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2zm-8 7h-2v2H8v-2H6v-2h2V9h2v2h2v2z', color: '#546E7A', bg: '#0a1015' },
  { id: 'npc-generator-cards', label: 'NPC Generator\nCards', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z', color: '#E65100', bg: '#1a0a00' },

  // Design Assets
  { id: 'fantasy-icon-set', label: 'Fantasy\nIcon Set', icon: 'M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6.4 4.8L8 14 2 9.2h7.6L12 2z', color: '#F9A825', bg: '#1a1505' },
  { id: 'token-maker-portraits', label: 'Token Maker\nPortraits', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2a7.2 7.2 0 01-6-3.22c.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08a7.2 7.2 0 01-6 3.22z', color: '#AB47BC', bg: '#150520' },
  { id: 'map-asset-pack', label: 'Map Asset\nPack', icon: 'M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2zM5 17l3.5-4.5 2.5 3 3.5-4.5L19 17H5z', color: '#1565C0', bg: '#050f1a' },

  // Plugins
  { id: 'dragon-dice-roller', label: 'Dragon\nDice Roller', icon: 'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM7.5 18a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0-9a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM12 13.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4.5 4.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0-9a1.5 1.5 0 110-3 1.5 1.5 0 010 3z', color: '#D32F2F', bg: '#1a0505' },
  { id: 'initiative-tracker', label: 'Initiative\nTracker Pro', icon: 'M13 3a9 9 0 00-9 9h3l-4 4-4-4h3a9 9 0 1018 0h-2a7 7 0 01-7 7 7 7 0 01-7-7 7 7 0 017-7V3zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z', color: '#FF6F00', bg: '#1a1000' },
  { id: 'ambience-soundboard', label: 'Ambience\nSoundboard', icon: 'M12 3v10.55A4 4 0 1014 17V7h4V3h-6zM10 19a2 2 0 110-4 2 2 0 010 4z', color: '#00BFA5', bg: '#001a15' },
  { id: 'loot-generator', label: 'Loot\nGenerator', icon: 'M20 6h-2.18c.11-.31.18-.65.18-1a3 3 0 00-3-3c-1.06 0-1.64.42-3 1.38C10.64 2.42 10.06 2 9 2a3 3 0 00-3 3c0 .35.07.69.18 1H4a2 2 0 00-2 2v3h20V8a2 2 0 00-2-2zm-5-2a1 1 0 011 1 1 1 0 01-1 1h-1.42L15 4.02V4zm-6 0c.01 0 .01-.01.01-.01A1 1 0 0110 5a1 1 0 01-1 1H7.58c.55-.68 1-1.2 1.42-2zM2 12v8a2 2 0 002 2h16a2 2 0 002-2v-8H13v8h-2v-8H2z', color: '#FDD835', bg: '#1a1800' },

  // Tools
  { id: 'budget-tracker', label: 'Budget\nTracker', icon: 'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z', color: '#43A047', bg: '#051a05' },
  { id: 'encounter-calculator', label: 'Encounter\nCalculator', icon: 'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-4 8h-2v2a1 1 0 01-2 0v-2H9a1 1 0 010-2h2V7a1 1 0 012 0v2h2a1 1 0 010 2z', color: '#E53935', bg: '#1a0505' },
  { id: 'campaign-wiki-template', label: 'Campaign\nWiki Template', icon: 'M18 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2zM6 4h5v8l-2.5-1.5L6 12V4z', color: '#5C6BC0', bg: '#0a0a20' },

  // Streaming
  { id: 'obs-overlay-pack', label: 'OBS Overlay\nPack', icon: 'M21 3H3a2 2 0 00-2 2v12a2 2 0 002 2h5v2h8v-2h5a2 2 0 002-2V5a2 2 0 00-2-2zm0 14H3V5h18v12z', color: '#8B0000', bg: '#1a0505' },
  { id: 'minimal-stream-alerts', label: 'Minimal\nStream Alerts', icon: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9zm-4.27 13a2 2 0 01-3.46 0z', color: '#FFB300', bg: '#1a1505' },
  { id: 'stinger-transitions', label: 'Animated\nTransitions', icon: 'M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15a1.49 1.49 0 000 2.12l5.5 5.5a1.49 1.49 0 002.12 0l5.5-5.5a1.49 1.49 0 000-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5a2 2 0 004 0c0-1.33-2-3.5-2-3.5z', color: '#E040FB', bg: '#1a0520' },
  { id: 'stream-info-panels', label: 'Stream Info\nPanels', icon: 'M4 6h18V4H4a2 2 0 00-2 2v11H0v3h14v-3H4V6zm19 2h-6a1 1 0 00-1 1v10a1 1 0 001 1h6a1 1 0 001-1V9a1 1 0 00-1-1zm-1 9h-4v-7h4v7z', color: '#26C6DA', bg: '#051a1a' },
  { id: 'webcam-frames', label: 'Webcam\nFrames', icon: 'M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z', color: '#66BB6A', bg: '#051a05' },
  { id: 'stream-starting-kit', label: 'Stream\nStarting Kit', icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-5h2V8h-2v7zm1-9a1 1 0 100 2 1 1 0 000-2z', color: '#EF5350', bg: '#1a0505' },
  { id: 'stream-schedule', label: 'Stream\nSchedule', icon: 'M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z', color: '#42A5F5', bg: '#050f1a' },
  { id: 'ultimate-streamer-bundle', label: 'Ultimate\nStreamer Bundle', icon: 'M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm-8 12.5a4.5 4.5 0 110-9 4.5 4.5 0 010 9zM12 9a3 3 0 100 6 3 3 0 000-6z', color: '#FF7043', bg: '#1a0a05' }
];

for (const p of products) {
  const lines = p.label.split('\n');
  const textY = lines.length === 1 ? 155 : 145;
  const textLines = lines.map((l, i) => 
    `<text x="200" y="${textY + i * 28}" text-anchor="middle" font-family="Rajdhani, sans-serif" font-size="22" font-weight="600" fill="#fff" opacity="0.95">${l}</text>`
  ).join('\n    ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.bg}"/>
      <stop offset="100%" stop-color="${p.color}" stop-opacity="0.25"/>
    </linearGradient>
  </defs>
  <rect width="400" height="200" fill="url(#g)"/>
  <rect x="0" y="196" width="400" height="4" fill="${p.color}" opacity="0.8"/>
  <g transform="translate(165, 20) scale(3)" fill="${p.color}" opacity="0.7">
    <path d="${p.icon}"/>
  </g>
  <rect width="400" height="200" fill="url(#g)" opacity="0.3"/>
  <rect x="0" y="120" width="400" height="80" fill="${p.bg}" opacity="0.6"/>
    ${textLines}
</svg>`;

  fs.writeFileSync(path.join(outDir, p.id + '.svg'), svg);
}

console.log(`Generated ${products.length} product images in ${outDir}`);
