const fs = require('fs');
const path = require('path');
const glob = require('glob');

const buildDir = path.join(__dirname, '..', 'build');
const files = glob.sync('**/*.html', { cwd: buildDir, absolute: true });

const OLD_CSS_LINK = `\t<link rel="stylesheet" href="https://cdn.snipcart.com/themes/v3.7.1/default/snipcart.css" />\n`;
const OLD_CSS_LINK_CR = `\t<link rel="stylesheet" href="https://cdn.snipcart.com/themes/v3.7.1/default/snipcart.css" />\r\n`;

const OLD_BODY = `\t<div hidden id="snipcart" data-api-key="NTQ2YzQ4NzItYmZlOS00OWQyLWE3YWYtNTkyMmY2NzlhMzFhNjM5MTE2MzUwOTYzODMxMDQ4" data-config-modal-style="side" data-currency="usd"></div>
\t<script async src="https://cdn.snipcart.com/themes/v3.7.1/default/snipcart.js"></script>`;

const NEW_BODY = `\t<script>
\t  window.SnipcartSettings = {
\t    publicApiKey: "NTQ2YzQ4NzItYmZlOS00OWQyLWE3YWYtNTkyMmY2NzlhMzFhNjM5MTE2MzUwOTYzODMxMDQ4",
\t    loadStrategy: "on-user-interaction",
\t    modalStyle: "side",
\t    currency: "usd",
\t    version: "3.7.1"
\t  };
\t  (function(){var c,d;(d=(c=window.SnipcartSettings).version)!=null||(c.version="3.0");var s,S;(S=(s=window.SnipcartSettings).timeoutDuration)!=null||(s.timeoutDuration=2750);var l,p;(p=(l=window.SnipcartSettings).domain)!=null||(l.domain="cdn.snipcart.com");var w,u;(u=(w=window.SnipcartSettings).protocol)!=null||(w.protocol="https");var m,g;(g=(m=window.SnipcartSettings).loadCSS)!=null||(m.loadCSS=!0);var y=window.SnipcartSettings.version.includes("v3.0.0-ci")||window.SnipcartSettings.version!="3.0"&&window.SnipcartSettings.version.localeCompare("3.4.0",void 0,{numeric:!0,sensitivity:"base"})===-1,f=["focus","mouseover","touchmove","scroll","keydown"];window.LoadSnipcart=o;document.readyState==="loading"?document.addEventListener("DOMContentLoaded",r):r();function r(){window.SnipcartSettings.loadStrategy?window.SnipcartSettings.loadStrategy==="on-user-interaction"&&(f.forEach(function(t){return document.addEventListener(t,o)}),setTimeout(o,window.SnipcartSettings.timeoutDuration)):o()}var a=!1;function o(){if(a)return;a=!0;var t=document.getElementsByTagName("head")[0],n=document.createElement("script");n.src=window.SnipcartSettings.protocol+"://"+window.SnipcartSettings.domain+"/themes/v"+window.SnipcartSettings.version+"/default/snipcart.js";n.async=!0;t.appendChild(n);var i=document.createElement("link");i.rel="stylesheet";i.type="text/css";i.href=window.SnipcartSettings.protocol+"://"+window.SnipcartSettings.domain+"/themes/v"+window.SnipcartSettings.version+"/default/snipcart.css";t.appendChild(i)}})();
\t</script>`;

let count = 0;
for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('id="snipcart"')) continue;
  
  const orig = html;
  
  // Remove old CSS link from head
  html = html.replace(OLD_CSS_LINK_CR, '');
  html = html.replace(OLD_CSS_LINK, '');
  
  // Replace old div+script with new bootstrap (handle both \n and \r\n)
  const oldBodyCR = OLD_BODY.replace(/\n/g, '\r\n');
  html = html.replace(oldBodyCR, NEW_BODY);
  html = html.replace(OLD_BODY, NEW_BODY);
  
  if (html !== orig) {
    fs.writeFileSync(file, html);
    count++;
    console.log(`  Updated: ${path.relative(buildDir, file)}`);
  }
}

console.log(`\nDone: ${count} files updated`);
