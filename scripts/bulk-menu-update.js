const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) results.push(...walk(fp));
    else if (f.endsWith('.html')) results.push(fp);
  }
  return results;
}

const newBlock = `<!-- Widget: About Shadow -->
							<section class="widget widget-text">
								<h5 class="widget__title">About IShadowedI</h5>
								<div class="widget__content">
									<p>
										Creator, developer, and the mind behind Dragon\u2019s Den. Building tools, games, and communities for tabletop fans and creators alike.
									</p>
									<div class="info-box">
										<div class="info-box__label">Socials Hub</div>
										<div class="info-box__content"><a href="https://shadoweds.carrd.co/" target="_blank" rel="noopener">shadoweds.carrd.co</a></div>
									</div>
									<div class="info-box">
										<div class="info-box__label">Get in touch</div>
										<div class="info-box__content"><a href="mailto:inquiries@dragonsshadow.com">inquiries<span class="color-primary">@</span>dragonsshadow.com</a></div>
									</div>
								</div>
							</section>
							<!-- Widget: About Shadow / End -->
						</div>
						<div class="col-md-12 col-lg-6 col-xl-5 offset-xl-2 mt-5 mt-lg-0">
							<!-- Widget: Shadow's Links -->
							<section class="widget widget-contact-info">
								<h5 class="widget__title">Shadow\u2019s Links</h5>
								<div class="widget__content">
									<p>
										Follow IShadowedI across the web \u2014 subscribe, watch live, and check out the latest projects.
									</p>
									<ul class="social-menu social-menu--default">
										<li><a href="https://www.youtube.com/channel/UC6cBaDPwZoDH5oTpnMd3CRw" target="_blank" rel="noopener" data-social="youtube"></a></li>
										<li><a href="https://www.twitch.tv/lshadowedl" target="_blank" rel="noopener" data-social="twitch"></a></li>
										<li><a href="https://github.com/IShadowedI" target="_blank" rel="noopener" data-social="github"></a></li>
										<li><a href="https://bsky.app/profile/ishadowedi.bsky.social" target="_blank" rel="noopener" data-social="bluesky"></a></li>
										<li><a href="https://www.tiktok.com/@ishadowedi" target="_blank" rel="noopener" data-social="tiktok"></a></li>
										<li><a href="https://www.curseforge.com/members/lshadowedl/projects" target="_blank" rel="noopener" data-social="curseforge"></a></li>
									</ul>
								</div>
							</section>
							<!-- Widget: Shadow's Links / End -->`;

const files = walk(path.join(__dirname, '..', 'build'));
let count = 0;
let noMatch = [];

for (const fp of files) {
  let c = fs.readFileSync(fp, 'utf8');
  if (!c.includes('Join our team')) continue;

  // Find start: "<!-- Widget: Text -->" right before the Join our team section
  const startMarker = '<!-- Widget: Text -->';
  const joinIdx = c.indexOf('Join our team');
  // Search backwards from "Join our team" for the Widget: Text comment
  const searchBack = c.substring(Math.max(0, joinIdx - 200), joinIdx);
  const markerInBack = searchBack.lastIndexOf(startMarker);
  if (markerInBack === -1) { noMatch.push(path.basename(fp)); continue; }
  const startIdx = Math.max(0, joinIdx - 200) + markerInBack;

  // Find end: "<!-- Widget: Contact Info / End -->"
  const endMarker = '<!-- Widget: Contact Info / End -->';
  const endIdx = c.indexOf(endMarker, joinIdx);
  if (endIdx === -1) { noMatch.push(path.basename(fp)); continue; }
  const endPos = endIdx + endMarker.length;

  // Detect line ending
  const nl = c.includes('\r\n') ? '\r\n' : '\n';
  const replacement = nl === '\r\n' ? newBlock.replace(/\n/g, '\r\n') : newBlock;

  c = c.substring(0, startIdx) + replacement + c.substring(endPos);
  fs.writeFileSync(fp, c);
  count++;
}

console.log('Updated ' + count + ' files');
if (noMatch.length) console.log('No match (' + noMatch.length + '): ' + noMatch.join(', '));
