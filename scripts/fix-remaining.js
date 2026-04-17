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

const files = walk(path.join(__dirname, '..', 'build'));
let fixed = 0;

for (const fp of files) {
  if (fp.includes('_private')) continue;
  let c = fs.readFileSync(fp, 'utf8');
  const orig = c;
  const bn = path.relative(path.join(__dirname, '..', 'build'), fp);

  // Fix generic youtube.com/ links (without real channel)
  if (c.includes('youtube.com/"') || c.includes("youtube.com/'")) {
    c = c.replace(/href="https?:\/\/youtube\.com\/"/g, 'href="https://www.youtube.com/channel/UC6cBaDPwZoDH5oTpnMd3CRw"');
    c = c.replace(/href='https?:\/\/youtube\.com\/'/g, "href='https://www.youtube.com/channel/UC6cBaDPwZoDH5oTpnMd3CRw'");
  }

  // Fix discordapp.com generic links
  if (c.includes('discordapp.com')) {
    c = c.replace(/href="https?:\/\/discordapp\.com"/g, 'href="https://shadoweds.carrd.co/"');
    c = c.replace(/href='https?:\/\/discordapp\.com'/g, "href='https://shadoweds.carrd.co/'");
  }

  if (c !== orig) {
    fs.writeFileSync(fp, c);
    console.log('Fixed:', bn);
    fixed++;
  }
}
console.log('Total fixed:', fixed);
