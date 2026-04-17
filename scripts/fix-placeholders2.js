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
const stats = { headerSocial: 0, postSharing: 0, total: 0 };

for (const fp of files) {
  if (fp.includes('_private')) continue;
  let c = fs.readFileSync(fp, 'utf8');
  const orig = c;
  const bn = path.relative(path.join(__dirname, '..', 'build'), fp);
  const prefix = c.includes('src="../assets/') ? '../' : '';

  // ── 1. HEADER SOCIAL BAR (Necrochat, Necroplay, etc.) ──
  if (c.includes('social-menu--header') && (c.includes('Necrochat') || c.includes('Necroplay') || c.includes('Necrotwt') || c.includes('Necrogame'))) {
    const ulStart = c.indexOf('<ul class="social-menu social-menu--header">');
    const ulEnd = c.indexOf('</ul>', ulStart);
    if (ulStart !== -1 && ulEnd !== -1) {
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
      stats.headerSocial++;
    }
  }

  // ── 2. POST SHARING BUTTONS (make functional share links) ──
  // Replace placeholder facebook/twitter share links with real share-by-URL links
  if (c.includes('post__sharing-item') && c.includes('data-social="facebook"')) {
    // Replace Facebook share button
    c = c.replace(
      /<li class="post__sharing-item"><a href="#" data-social="facebook"><\/a><\/li>/g,
      '<li class="post__sharing-item"><a href="#" data-social="facebook" onclick="window.open(\'https://www.facebook.com/sharer/sharer.php?u=\'+encodeURIComponent(window.location.href),\'_blank\',\'width=600,height=400\');return false;"></a></li>'
    );
    // Replace Twitter share button
    c = c.replace(
      /<li class="post__sharing-item"><a href="#" data-social="twitter"><\/a><\/li>/g,
      '<li class="post__sharing-item"><a href="#" data-social="twitter" onclick="window.open(\'https://twitter.com/intent/tweet?url=\'+encodeURIComponent(window.location.href)+\'&text=\'+encodeURIComponent(document.title),\'_blank\',\'width=600,height=400\');return false;"></a></li>'
    );
    stats.postSharing++;
  }

  if (c !== orig) {
    fs.writeFileSync(fp, c);
    stats.total++;
  }
}

console.log('Updated:', stats.total);
console.log('  Header social bars:', stats.headerSocial);
console.log('  Post sharing buttons:', stats.postSharing);

// Verify
let fb = 0;
for (const f of files) {
  if (f.includes('_private')) continue;
  const c = fs.readFileSync(f, 'utf8');
  if (c.includes('Necrochat') || c.includes('Necroplay') || c.includes('Necrotwt') || c.includes('Necrogame')) {
    console.log('Still has Necro*:', path.relative(path.join(__dirname, '..', 'build'), f));
  }
}
