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
let count = 0;

for (const fp of files) {
  if (fp.includes('_private')) continue;
  let c = fs.readFileSync(fp, 'utf8');
  const orig = c;

  // Fix any remaining header social bars that still have generic URLs
  if (c.includes('social-menu--header')) {
    const ulStart = c.indexOf('<ul class="social-menu social-menu--header">');
    const ulEnd = c.indexOf('</ul>', ulStart);
    if (ulStart !== -1 && ulEnd !== -1) {
      const block = c.substring(ulStart, ulEnd + '</ul>'.length);
      // Check if it still has generic URLs
      if (block.includes('twitch.tv/') && !block.includes('twitch.tv/lshadowedl') ||
          block.includes('href="#"') ||
          block.includes('youtube.com/') && !block.includes('youtube.com/channel/')) {
        
        const lineStart = c.lastIndexOf('\n', ulStart) + 1;
        const indent = c.substring(lineStart, ulStart).match(/^(\s*)/)[1];
        const li = indent + '\t';

        const newUl = '<ul class="social-menu social-menu--header">\n' +
          li + '<li><a href="https://www.youtube.com/channel/UC6cBaDPwZoDH5oTpnMd3CRw" target="_blank" rel="noopener"><span class="link-subtitle">YouTube</span>Videos</a></li>\n' +
          li + '<li><a href="https://www.twitch.tv/lshadowedl" target="_blank" rel="noopener"><span class="link-subtitle">Twitch</span>Live</a></li>\n' +
          li + '<li><a href="https://bsky.app/profile/ishadowedi.bsky.social" target="_blank" rel="noopener"><span class="link-subtitle">Bluesky</span>Updates</a></li>\n' +
          li + '<li><a href="https://github.com/IShadowedI" target="_blank" rel="noopener"><span class="link-subtitle">GitHub</span>Projects</a></li>\n' +
          indent + '</ul>';

        c = c.substring(0, ulStart) + newUl + c.substring(ulEnd + '</ul>'.length);
      }
    }
  }

  // Fix any remaining generic twitch.tv or youtube.com in header-social-toggle context
  // (not touching these globally since they may be in other valid contexts)

  if (c !== orig) {
    fs.writeFileSync(fp, c);
    count++;
  }
}

console.log('Fixed header social bars:', count);
