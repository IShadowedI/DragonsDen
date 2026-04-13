const fs = require('fs');
const path = require('path');
const glob = require('glob');

const buildDir = path.join(__dirname, '..', 'build');
const files = glob.sync('**/*.html', { cwd: buildDir, absolute: true });

// ── New mobile nav content (with {P} prefix placeholder) ──
function mobileNav(P) {
  return `<li>
									<a href="${P}home.html">Home</a>
								</li>
								<li>
									<a href="${P}blog-classic.html">News</a>
								</li>
								<li>
									<a href="${P}shop.html">Shop</a>
								</li>
								<li>
									<a href="#">Project Pages</a>
									<ul class="mobile-nav__sub">
										<li><a href="${P}dragon.html">Dragon Social</a></li>
										<li><a href="#">Little Grotto</a></li>
										<li><a href="#">Shadow Coin</a></li>
									</ul>
								</li>
								<li>
									<a href="#">Tools and Utilities</a>
									<ul class="mobile-nav__sub">
										<li><a href="${P}tools.html">Tool Suite</a></li>
										<li><a href="#">Utilities</a></li>
										<li><a href="${P}plugins.html">Plugins</a></li>
										<li><a href="#">Mods</a></li>
									</ul>
								</li>
								<li>
									<a href="#">Community</a>
									<ul class="mobile-nav__sub">
										<li><a href="#">Browse Community Creations</a></li>
										<li><a href="${P}plugins-submit.html">Submit a Plugin</a></li>
										<li><a href="#">Submit a Mod</a></li>
										<li><a href="#">Creation Docs</a></li>
									</ul>
								</li>
								<li>
									<a href="#">Details</a>
									<ul class="mobile-nav__sub">
										<li><a href="${P}about.html">About</a></li>
										<li><a href="#">Apply</a></li>
										<li><a href="${P}contact.html">Contact</a></li>
										<li><a href="${P}login-register.html">Account</a></li>
									</ul>
								</li>`;
}

// ── New dl-megamenu content for index.html ──
function dlMegamenu(P) {
  return `<ul class="dl-submenu dl-megamenu">
									<div class="row">
										<ul class="col-md-6 col-lg-3">
											<li><strong>Project Pages</strong></li>
											<li><a href="${P}dragon.html">Dragon Social</a></li>
											<li><a href="#">Little Grotto</a></li>
											<li><a href="#">Shadow Coin</a></li>
										</ul>
										<ul class="col-md-6 col-lg-3">
											<li><strong>Tools and Utilities</strong></li>
											<li><a href="${P}tools.html">Tool Suite</a></li>
											<li><a href="#">Utilities</a></li>
											<li><a href="${P}plugins.html">Plugins</a></li>
											<li><a href="#">Mods</a></li>
										</ul>
										<ul class="col-md-6 col-lg-3">
											<li><strong>Community</strong></li>
											<li><a href="#">Browse Community Creations</a></li>
											<li><a href="${P}plugins-submit.html">Submit a Plugin</a></li>
											<li><a href="#">Submit a Mod</a></li>
											<li><a href="#">Creation Docs</a></li>
										</ul>
										<ul class="col-md-6 col-lg-3">
											<li><strong>Details</strong></li>
											<li><a href="${P}about.html">About</a></li>
											<li><a href="#">Apply</a></li>
											<li><a href="${P}contact.html">Contact</a></li>
											<li><a href="${P}login-register.html">Account</a></li>
										</ul>
									</div>
								</ul>`;
}

let mobileCount = 0;
let dlCount = 0;

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  let changed = false;
  const rel = path.relative(buildDir, file);
  const prefix = rel.includes(path.sep) ? '../' : '';

  // ── 1. Update mobile nav ──
  // Find the mobile-nav__list ul and replace its contents
  const mobileListStart = html.indexOf('<ul class="mobile-nav__list">');
  if (mobileListStart !== -1) {
    // Find the closing </ul> for mobile-nav__list — count depth
    let depth = 0;
    let mobileListEnd = -1;
    let i = mobileListStart;
    while (i < html.length) {
      if (html.substr(i, 3) === '<ul') {
        depth++;
      } else if (html.substr(i, 5) === '</ul>') {
        depth--;
        if (depth === 0) {
          mobileListEnd = i + 5;
          break;
        }
      }
      i++;
    }

    if (mobileListEnd !== -1) {
      // Detect indentation from original
      const before = html.substring(0, mobileListStart);
      const lineStart = before.lastIndexOf('\n') + 1;
      
      const newMobileList = `<ul class="mobile-nav__list">\n${mobileNav(prefix)}\n							</ul>`;
      html = html.substring(0, mobileListStart) + newMobileList + html.substring(mobileListEnd);
      changed = true;
      mobileCount++;
    }
  }

  // ── 2. Update dl-megamenu (index.html style nav) ──
  const dlStart = html.indexOf('<ul class="dl-submenu dl-megamenu">');
  if (dlStart !== -1) {
    let depth = 0;
    let dlEnd = -1;
    let i = dlStart;
    while (i < html.length) {
      if (html.substr(i, 3) === '<ul') {
        depth++;
      } else if (html.substr(i, 5) === '</ul>') {
        depth--;
        if (depth === 0) {
          dlEnd = i + 5;
          break;
        }
      }
      i++;
    }

    if (dlEnd !== -1) {
      html = html.substring(0, dlStart) + dlMegamenu(prefix) + html.substring(dlEnd);
      changed = true;
      dlCount++;
    }
  }

  if (changed) {
    fs.writeFileSync(file, html);
  }
}

console.log(`Updated mobile nav in ${mobileCount} files`);
console.log(`Updated dl-megamenu in ${dlCount} files`);
