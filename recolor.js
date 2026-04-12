const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMG_DIR = path.join(__dirname, 'build', 'assets', 'img');

// Recursively find all PNG and JPG files
function findImages(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findImages(full));
    } else if (/\.(png|jpg|jpeg)$/i.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

// Convert RGB to HSL
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s, l];
}

// Convert HSL to RGB
function hslToRgb(h, s, l) {
  h /= 360;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

async function recolorImage(filePath) {
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    // Get raw pixel data
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const channels = info.channels;
    const pixels = data;
    let changed = false;
    
    for (let i = 0; i < pixels.length; i += channels) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = channels === 4 ? pixels[i + 3] : 255;
      
      // Skip fully transparent pixels
      if (a === 0) continue;
      
      const [h, s, l] = rgbToHsl(r, g, b);
      
      // Target green/yellow-green hues (60-160 degrees) with decent saturation
      if (h >= 50 && h <= 170 && s > 0.15) {
        // Shift hue from green range to red range
        // Green is ~120, we want ~0/360 (red)
        // Shift by rotating hue: subtract ~120 degrees
        let newH = h - 120;
        if (newH < 0) newH += 360;
        
        // Boost saturation slightly for vibrant red
        const newS = Math.min(s * 1.1, 1.0);
        
        const [nr, ng, nb] = hslToRgb(newH, newS, l);
        pixels[i] = nr;
        pixels[i + 1] = ng;
        pixels[i + 2] = nb;
        changed = true;
      }
    }
    
    if (changed) {
      await sharp(pixels, {
        raw: {
          width: info.width,
          height: info.height,
          channels: info.channels
        }
      })
      .toFormat(filePath.toLowerCase().endsWith('.png') ? 'png' : 'jpeg', { quality: 90 })
      .toFile(filePath + '.tmp');
      
      // Replace original
      fs.renameSync(filePath + '.tmp', filePath);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`  Error processing ${path.basename(filePath)}: ${err.message}`);
    return false;
  }
}

async function main() {
  const images = findImages(IMG_DIR);
  console.log(`Found ${images.length} image files`);
  
  let processed = 0;
  let changed = 0;
  
  for (const file of images) {
    const rel = path.relative(IMG_DIR, file);
    const wasChanged = await recolorImage(file);
    processed++;
    if (wasChanged) {
      changed++;
      console.log(`  [${processed}/${images.length}] Recolored: ${rel}`);
    }
    if (processed % 20 === 0) {
      console.log(`  Progress: ${processed}/${images.length}`);
    }
  }
  
  console.log(`\nDone! Processed ${processed} files, recolored ${changed} images.`);
}

main().catch(console.error);
