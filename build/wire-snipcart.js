/**
 * Wire up Snipcart e-commerce across the site.
 * Run: node wire-snipcart.js
 * 
 * What this does:
 * 1. Adds Snipcart CSS + JS includes to every HTML page's <head>
 * 2. Converts shop.html product buttons into Snipcart buy buttons
 * 3. Adds a cart widget trigger to the header across all pages
 */
const fs = require('fs');
const path = require('path');

const BUILD = __dirname;
const SITE_URL = 'https://dragonsshadow.com';

// Snipcart snippet to inject into <head> (right before </head>)
// Uses the test/public API key placeholder — user replaces with their own
const snipcartHead = `
\t<!-- Snipcart E-Commerce -->
\t<link rel="stylesheet" href="https://cdn.snipcart.com/themes/v3.7.1/default/snipcart.css" />
\t<style>
\t\t/* Dark theme overrides for Snipcart modal */
\t\t.snipcart-modal__container { z-index: 99999 !important; }
\t\t.snipcart { --color-default: #fff; --color-alt: rgba(255,255,255,0.7); --borderColor-default: rgba(255,255,255,0.1); --bgColor-default: #13151e; --bgColor-alt: #1a1c28; --bgColor-input: #0e1019; --color-input: #fff; --color-inputLabel: rgba(255,255,255,0.6); --borderColor-input: rgba(255,255,255,0.15); --color-badge: #fff; --bgColor-badge: #8B0000; --color-link: #FF4D4D; --color-link-hover: #ff6b6b; --color-icon: #FF4D4D; --bgColor-buttonPrimary: #8B0000; --bgColor-buttonPrimary-hover: #a00000; --color-buttonPrimary: #fff; --bgColor-buttonSecondary: transparent; --color-buttonSecondary: #FF4D4D; --borderColor-buttonSecondary: #8B0000; --borderColor-buttonSecondary-hover: #FF4D4D; }
\t\t.snipcart-cart-header { background: #0e1019 !important; }
\t\t.snipcart-item-line { border-color: rgba(255,255,255,0.06) !important; }
\t</style>`;

const snipcartBodyEnd = `
\t<!-- Snipcart Container (must be before </body>) -->
\t<div hidden id="snipcart" data-api-key="YOUR_SNIPCART_PUBLIC_API_KEY" data-config-modal-style="side" data-currency="usd"></div>
\t<script async src="https://cdn.snipcart.com/themes/v3.7.1/default/snipcart.js"></script>`;

// ──────────────────────────────────────────────
// STEP 1: Add Snipcart includes to ALL HTML pages
// ──────────────────────────────────────────────
const htmlFiles = fs.readdirSync(BUILD).filter(f => f.endsWith('.html'));
let headCount = 0;
let bodyCount = 0;

for (const file of htmlFiles) {
  const filePath = path.join(BUILD, file);
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Add CSS to <head> if not already present
  if (!html.includes('snipcart.css')) {
    html = html.replace('</head>', snipcartHead + '\n</head>');
    changed = true;
    headCount++;
  }

  // Add JS container before </body> if not already present
  if (!html.includes('id="snipcart"')) {
    html = html.replace('</body>', snipcartBodyEnd + '\n</body>');
    changed = true;
    bodyCount++;
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf8');
  }
}

console.log(`Added Snipcart <head> to ${headCount} files`);
console.log(`Added Snipcart <body> container to ${bodyCount} files`);

// Also do _private pages
const privatePath = path.join(BUILD, '_private');
if (fs.existsSync(privatePath)) {
  const privateFiles = fs.readdirSync(privatePath).filter(f => f.endsWith('.html'));
  let pCount = 0;
  for (const file of privateFiles) {
    const filePath = path.join(privatePath, file);
    let html = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    if (!html.includes('snipcart.css')) {
      html = html.replace('</head>', snipcartHead + '\n</head>');
      changed = true;
    }
    if (!html.includes('id="snipcart"')) {
      html = html.replace('</body>', snipcartBodyEnd + '\n</body>');
      changed = true;
    }
    if (changed) { fs.writeFileSync(filePath, html, 'utf8'); pCount++; }
  }
  console.log(`Updated ${pCount} _private pages`);
}

// ──────────────────────────────────────────────
// STEP 2: Convert shop.html buttons to Snipcart buy buttons
// ──────────────────────────────────────────────
const shopPath = path.join(BUILD, 'shop.html');
let shop = fs.readFileSync(shopPath, 'utf8');

// Parse each shop-card and add Snipcart data attributes to buy buttons
// Match pattern: data-category="X" data-price="Y" data-name="Z" ...then find <button class="btn btn-primary btn-sm">
const cardRegex = /<div class="shop-card"[^>]*data-category="([^"]*)"[^>]*data-price="([^"]*)"[^>]*data-name="([^"]*)"[^]*?<p class="shop-card__desc">([^<]*)<\/p>[^]*?<button class="btn btn-primary btn-sm">(Add to Cart|Download)<\/button>/g;

let productId = 0;
shop = shop.replace(cardRegex, (match, category, price, name, desc, btnText) => {
  productId++;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const priceNum = parseFloat(price) || 0;
  const itemUrl = `${SITE_URL}/shop.html`;
  
  // Build Snipcart attributes
  const snipcartAttrs = [
    `class="btn btn-primary btn-sm snipcart-add-item"`,
    `data-item-id="${slug}"`,
    `data-item-name="${name.replace(/"/g, '&quot;')}"`,
    `data-item-price="${priceNum.toFixed(2)}"`,
    `data-item-url="${itemUrl}"`,
    `data-item-description="${desc.replace(/"/g, '&quot;').substring(0, 200)}"`,
    `data-item-categories="${category}"`,
    `data-item-file-guid=""`,
  ].join('\n\t\t\t\t\t\t\t\t\t\t\t\t\t');

  // For free items, keep them as external links (no cart needed)
  if (priceNum === 0) {
    return match; // Leave free items as-is (they'd need a download link, not cart)
  }

  // Replace the plain button with a Snipcart button
  const oldBtn = `<button class="btn btn-primary btn-sm">${btnText}</button>`;
  const newBtn = `<button ${snipcartAttrs}>${btnText}</button>`;
  return match.replace(oldBtn, newBtn);
});

// Also add a floating cart button to the shop page
const cartWidget = `
\t\t\t\t\t<!-- Snipcart Cart Widget -->
\t\t\t\t\t<div style="position:fixed;bottom:24px;right:24px;z-index:9999;">
\t\t\t\t\t\t<button class="snipcart-checkout btn btn-primary" style="border-radius:50%;width:58px;height:58px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(139,0,0,0.4);font-size:22px;" title="View Cart">
\t\t\t\t\t\t\t&#x1F6D2;
\t\t\t\t\t\t\t<span class="snipcart-items-count" style="position:absolute;top:-4px;right:-4px;background:#ff4d4d;color:#fff;border-radius:50%;width:20px;height:20px;font-size:11px;display:flex;align-items:center;justify-content:center;font-weight:700;"></span>
\t\t\t\t\t\t</button>
\t\t\t\t\t</div>\n`;

if (!shop.includes('snipcart-checkout')) {
  // Insert before closing </main>
  shop = shop.replace('</main>', cartWidget + '\t\t</main>');
}

fs.writeFileSync(shopPath, shop, 'utf8');
console.log(`Converted ${productId} products to Snipcart buy buttons`);

// ──────────────────────────────────────────────
// STEP 3: Add cart icon to header across all pages
// ──────────────────────────────────────────────
// Add a small cart link next to the search icon in the header
const cartHeaderSnippet = `\t\t\t\t<!-- Snipcart Cart Trigger -->
\t\t\t\t<div class="header-cart-toggle snipcart-checkout" style="cursor:pointer;position:relative;margin-left:12px;display:inline-flex;align-items:center;" title="Shopping Cart">
\t\t\t\t\t<svg role="img" class="df-icon df-icon--cart" style="width:20px;height:20px;fill:currentColor;">
\t\t\t\t\t\t<use xlink:href="assets/img/necromancers.svg#cart"/>
\t\t\t\t\t</svg>
\t\t\t\t\t<span class="snipcart-items-count" style="position:absolute;top:-6px;right:-10px;background:#8B0000;color:#fff;border-radius:50%;width:16px;height:16px;font-size:9px;display:flex;align-items:center;justify-content:center;font-weight:700;"></span>
\t\t\t\t</div>\n`;

let navCount = 0;
const allHtmlFiles = [...htmlFiles];
// Add _private files too
if (fs.existsSync(privatePath)) {
  const pFiles = fs.readdirSync(privatePath).filter(f => f.endsWith('.html'));
  pFiles.forEach(f => allHtmlFiles.push(path.join('_private', f)));
}

for (const file of allHtmlFiles) {
  const filePath = path.join(BUILD, file);
  if (!fs.existsSync(filePath)) continue;
  let html = fs.readFileSync(filePath, 'utf8');
  
  if (html.includes('snipcart-checkout') && !file.endsWith('shop.html')) continue;
  if (html.includes('header-cart-toggle')) continue;
  
  // Insert cart trigger before the header-search-toggle div
  if (html.includes('header-search-toggle')) {
    html = html.replace(
      /(\t*<div class="header-search-toggle")/,
      cartHeaderSnippet + '$1'
    );
    fs.writeFileSync(filePath, html, 'utf8');
    navCount++;
  }
}

console.log(`Added cart header icon to ${navCount} pages`);
console.log('\n✅ Snipcart wired up! Replace YOUR_SNIPCART_PUBLIC_API_KEY with your real key.');
console.log('   Sign up at https://app.snipcart.com/register (free under $500/mo revenue).');
