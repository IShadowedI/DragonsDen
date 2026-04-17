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

let cart = 0, james = 0, maxp = 0, fb = 0, disc = 0, fbPriv = 0;
for (const f of walk('build')) {
  const c = fs.readFileSync(f, 'utf8');
  const isPriv = f.includes('_private');
  if (c.includes('cart-panel__items-count">4')) cart++;
  if (c.includes('James Spiegel')) james++;
  if (c.includes('Max Parker')) maxp++;
  if (c.includes('data-social="facebook"')) { if (isPriv) fbPriv++; else fb++; }
  if (c.includes('discord.gg/xxxx')) disc++;
}
console.log(`cart4:${cart} james:${james} maxP:${maxp} fb_public:${fb} fb_private:${fbPriv} discord:${disc}`);
