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

let count = 0;
for (const f of walk('build')) {
  const c = fs.readFileSync(f, 'utf8');
  if (c.includes('data-social="facebook"') && !f.includes('_private')) {
    const bn = path.relative('build', f);
    const lines = c.split('\n');
    lines.forEach((l, i) => {
      if (l.includes('data-social="facebook"')) {
        console.log(bn + ':' + (i + 1) + ': ' + l.trim());
      }
    });
    count++;
    if (count >= 5) return;
  }
}
