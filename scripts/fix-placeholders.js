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
const stats = { cart: 0, james: 0, mobileSocial: 0, mobileContact: 0, discord: 0, landingSocial: 0, mailto: 0, total: 0 };

for (const fp of files) {
  let c = fs.readFileSync(fp, 'utf8');
  const orig = c;
  const bn = path.relative(path.join(__dirname, '..', 'build'), fp);

  // Detect prefix (posts use ../)
  const prefix = c.includes('src="../assets/') ? '../' : '';

  // ── 1. EMPTY THE CART ──
  if (c.includes('cart-panel__items-count">4')) {
    c = c.replace(/cart-panel__items-count">4/g, 'cart-panel__items-count">0');
    c = c.replace(/header-cart-toggle__items-count">4/g, 'header-cart-toggle__items-count">0');

    // Replace tbody content
    const tbStart = c.indexOf('<tbody>', c.indexOf('cart-panel'));
    const tbEnd = c.indexOf('</tbody>', tbStart);
    if (tbStart !== -1 && tbEnd !== -1) {
      const emptyCart = `<tbody>
							<tr>
								<td colspan="4" style="text-align: center; padding: 30px 0; color: #6c757d; border: none;">
									<p style="margin: 0 0 10px; font-size: 14px;">Your cart is empty.</p>
									<a href="${prefix}shop.html" class="btn btn-primary btn-sm">Browse the Shop</a>
								</td>
							</tr>
						`;
      c = c.substring(0, tbStart) + emptyCart + c.substring(tbEnd);
    }

    // Replace totals
    const tfStart = c.indexOf('<tfoot>', c.indexOf('cart-panel'));
    const tfEnd = c.indexOf('</tfoot>', tfStart);
    if (tfStart !== -1 && tfEnd !== -1) {
      const emptyTotals = `<tfoot>
								<tr class="cart-panel__subtotal">
									<th>Cart Subtotal</th>
									<td><span class="amount"><span class="amount-currency">$</span>0.00</span></td>
								</tr>
								<tr class="cart-panel__order-total">
									<th>Cart Total</th>
									<td><span class="amount"><span class="amount-currency">$</span>0.00</span></td>
								</tr>
							`;
      c = c.substring(0, tfStart) + emptyTotals + c.substring(tfEnd);
    }

    // Replace checkout link with shop link
    c = c.replace(
      /<a href="shop-checkout\.html" class="btn btn-primary">Go to checkout<\/a>/g,
      '<a href="' + prefix + 'shop.html" class="btn btn-primary">Browse the Shop</a>'
    );

    stats.cart++;
  }

  // ── 2. JAMES SPIEGEL → GUEST ──
  if (c.includes('James Spiegel')) {
    const startM = '<div class="header-account hide">';
    const si = c.indexOf(startM);
    if (si !== -1) {
      // Find end: look for header-menu-toggle which comes right after
      const nextSection = c.indexOf('header-menu-toggle', si);
      if (nextSection !== -1) {
        // Walk backwards from header-menu-toggle to find the last </div> before it
        let searchArea = c.substring(si, nextSection);
        // Count the structure: we need to find where header-account closes
        // The closing </div> for header-account is followed by whitespace and then header-menu-toggle's parent div
        let closeIdx = c.lastIndexOf('</div>', nextSection);
        if (closeIdx > si) {
          closeIdx += '</div>'.length;
          const replacement = `<div class="header-account hide">
				<div class="header-account__avatar">
					<svg role="img" class="df-icon df-icon--account" style="width: 32px; height: 32px; fill: currentColor;">
						<use xlink:href="${prefix}assets/img/necromancers.svg#account"/>
					</svg>
				</div>
				<div class="header-account__body">
					Welcome!
					<div class="header-account__name">Guest</div>
				</div>
				<div class="header-account__icon">
					<a href="${prefix}login-register.html" title="Sign In / Register">
						<svg role="img" class="df-icon df-icon--account">
							<use xlink:href="${prefix}assets/img/necromancers.svg#account"/>
						</svg>
					</a>
				</div>
			</div>`;
          c = c.substring(0, si) + replacement + c.substring(closeIdx);
          stats.james++;
        }
      }
    }
  }

  // ── 3. MOBILE BAR SOCIAL LINKS ──
  if (c.includes('social-menu--mobile-bar') && c.includes('data-social="facebook"')) {
    const mbIdx = c.indexOf('social-menu--mobile-bar');
    const ulStart = c.lastIndexOf('<ul', mbIdx);
    const ulEnd = c.indexOf('</ul>', mbIdx);
    if (ulStart !== -1 && ulEnd !== -1) {
      const lineStart = c.lastIndexOf('\n', ulStart) + 1;
      const baseIndent = c.substring(lineStart, ulStart);
      const indent = baseIndent.match(/^(\s*)/)[1];
      const liIndent = indent + '\t';

      const newUl = '<ul class="social-menu social-menu--mobile-bar">\n' +
        liIndent + '<li><a href="https://www.youtube.com/channel/UC6cBaDPwZoDH5oTpnMd3CRw" target="_blank" rel="noopener" data-social="youtube"><span>YouTube</span></a></li>\n' +
        liIndent + '<li><a href="https://www.twitch.tv/lshadowedl" target="_blank" rel="noopener" data-social="twitch"><span>Twitch</span></a></li>\n' +
        liIndent + '<li><a href="https://github.com/IShadowedI" target="_blank" rel="noopener" data-social="github"><span>GitHub</span></a></li>\n' +
        liIndent + '<li><a href="https://bsky.app/profile/ishadowedi.bsky.social" target="_blank" rel="noopener" data-social="bluesky"><span>Bluesky</span></a></li>\n' +
        liIndent + '<li><a href="https://www.tiktok.com/@ishadowedi" target="_blank" rel="noopener" data-social="tiktok"><span>TikTok</span></a></li>\n' +
        liIndent + '<li><a href="https://www.curseforge.com/members/lshadowedl/projects" target="_blank" rel="noopener" data-social="curseforge"><span>CurseForge</span></a></li>\n' +
        indent + '</ul>';

      c = c.substring(0, ulStart) + newUl + c.substring(ulEnd + '</ul>'.length);
      stats.mobileSocial++;
    }
  }

  // ── 4. MOBILE BAR CONTACT INFO (Max Parker) ──
  if (c.includes('Max Parker')) {
    const mpIdx = c.indexOf('Max Parker');
    const ulStart = c.lastIndexOf('<ul class="list-unstyled">', mpIdx);
    const ulEnd = c.indexOf('</ul>', mpIdx);
    if (ulStart !== -1 && ulEnd !== -1) {
      const lineStart = c.lastIndexOf('\n', ulStart) + 1;
      const indent = c.substring(lineStart, ulStart).match(/^(\s*)/)[1];
      const liIndent = indent + '\t';

      const newContact = '<ul class="list-unstyled">\n' +
        liIndent + '<li class="info-box">\n' +
        liIndent + '\t<div class="info-box__label">Socials Hub</div>\n' +
        liIndent + '\t<div class="info-box__content"><a href="https://shadoweds.carrd.co/" target="_blank" rel="noopener">shadoweds.carrd.co</a></div>\n' +
        liIndent + '</li>\n' +
        liIndent + '<li class="info-box">\n' +
        liIndent + '\t<div class="info-box__label">General inquiries</div>\n' +
        liIndent + '\t<div class="info-box__content"><a href="mailto:inquiries@dragonsshadow.com">inquiries<span class="color-primary">@</span>dragonsshadow.com</a></div>\n' +
        liIndent + '</li>\n' +
        indent + '</ul>';

      c = c.substring(0, ulStart) + newContact + c.substring(ulEnd + '</ul>'.length);
      stats.mobileContact++;
    }
  }

  // ── 5. DISCORD PLACEHOLDER ──
  if (c.includes('discord.gg/xxxx')) {
    c = c.replace(/https:\/\/discord\.gg\/xxxx/g, 'https://shadoweds.carrd.co/');
    stats.discord++;
  }

  // ── 6. FIX LANDING PAGE FOOTER SOCIALS ──
  if (c.includes('social-menu--landing')) {
    // Twitter → Bluesky
    c = c.replace(
      /<a href="#" data-social="twitter" target="_blank">([\s\S]*?)<i class="fab fa-twitter"><\/i>([\s\S]*?)<span class="link-subtitle">Twitter<\/span>Updates/,
      '<a href="https://bsky.app/profile/ishadowedi.bsky.social" target="_blank" rel="noopener">$1<i class="fab fa-cloud"></i>$2<span class="link-subtitle">Bluesky</span>Updates'
    );
    // Generic YouTube
    c = c.replace(
      /href="https:\/\/youtube\.com\/" target="_blank"/g,
      'href="https://www.youtube.com/channel/UC6cBaDPwZoDH5oTpnMd3CRw" target="_blank" rel="noopener"'
    );
    // Generic Twitch
    c = c.replace(
      /href="https:\/\/twitch\.tv\/" target="_blank"/g,
      'href="https://www.twitch.tv/lshadowedl" target="_blank" rel="noopener"'
    );
    stats.landingSocial++;
  }

  // ── 7. FIX REMAINING mailto:# ──
  if (c.includes('mailto:#')) {
    c = c.replace(/href="mailto:#"/g, 'href="mailto:inquiries@dragonsshadow.com"');
    stats.mailto++;
  }

  // Write if changed
  if (c !== orig) {
    fs.writeFileSync(fp, c);
    stats.total++;
  }
}

console.log('Updated files:', stats.total);
console.log('  Cart emptied:', stats.cart);
console.log('  James Spiegel -> Guest:', stats.james);
console.log('  Mobile socials:', stats.mobileSocial);
console.log('  Mobile contact:', stats.mobileContact);
console.log('  Discord fix:', stats.discord);
console.log('  Landing socials:', stats.landingSocial);
console.log('  Mailto fix:', stats.mailto);

// Verify
let remain = { james: 0, maxp: 0, fb: 0, disc: 0, cart4: 0, mailto: 0 };
for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  if (c.includes('James Spiegel')) remain.james++;
  if (c.includes('Max Parker')) remain.maxp++;
  if (c.includes('data-social="facebook"')) remain.fb++;
  if (c.includes('discord.gg/xxxx')) remain.disc++;
  if (c.includes('cart-panel__items-count">4')) remain.cart4++;
  if (c.includes('mailto:#')) remain.mailto++;
}
console.log('\nRemaining:');
Object.entries(remain).forEach(([k, v]) => console.log('  ' + k + ':', v));
