const fs = require('fs');
const path = require('path');

function walk(dir) {
  let r = [];
  for (const f of fs.readdirSync(dir)) {
    const x = path.join(dir, f);
    if (fs.statSync(x).isDirectory()) r.push(...walk(x));
    else if (f.endsWith('.html')) r.push(x);
  }
  return r;
}

const checks = {
  'James Spiegel': 0,
  'Max Parker': 0,
  'Necrochat': 0,
  'Necroplay': 0,
  'Necrotwt': 0,
  'Necrogame': 0,
  'discord.gg/xxxx': 0,
  'mailto:#': 0,
  'cart-panel__items-count">4': 0,
  'twitch.tv/"': 0,  // generic twitch without channel  
  'youtube.com/"': 0, // generic youtube without channel
  'discordapp.com': 0,
  'mp-recruit': 0,
  'partners@': 0,
};

const files = walk(path.join(__dirname, '..', 'build'));
for (const f of files) {
  if (f.includes('_private')) continue;
  const c = fs.readFileSync(f, 'utf8');
  for (const [key] of Object.entries(checks)) {
    if (c.includes(key)) checks[key]++;
  }
}

console.log('=== PLACEHOLDER AUDIT (excluding _private/) ===');
for (const [key, val] of Object.entries(checks)) {
  const status = val === 0 ? 'CLEAN' : 'FOUND: ' + val + ' files';
  console.log(`  ${key}: ${status}`);
}
