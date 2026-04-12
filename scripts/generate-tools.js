#!/usr/bin/env node
/**
 * Tool Page Generator
 * Reads tools-qr-generator.html as template, extracts header/footer,
 * and generates all tool pages with ad placements.
 */
const fs = require('fs');
const path = require('path');

const BUILD = path.join(__dirname, '..', 'build');
const TEMPLATE_FILE = path.join(BUILD, 'tools-qr-generator.html');

// Read template and split into parts
const tpl = fs.readFileSync(TEMPLATE_FILE, 'utf8');

// Extract everything before <main ...>
const mainStart = tpl.indexOf('<main class="site-content');
const beforeMain = tpl.substring(0, mainStart);

// Extract everything after </main> but before the QR-specific scripts
const mainEnd = tpl.indexOf('</main>');
const mainCloseTag = '</main>';
const afterMainRaw = tpl.substring(mainEnd + mainCloseTag.length);

// Strip the QR-specific <script> tags (qrious lib + inline script) 
// We need to find where the generic site stuff starts (<!-- Overlay -->)
const overlayPos = afterMainRaw.indexOf('<!-- Overlay -->');
const afterMain = afterMainRaw.substring(overlayPos);

// Ad slot HTML helpers
const AD_TOP = `
				<!-- Ad: Top Leaderboard -->
				<div class="ad-slot ad-slot--leaderboard ad-slot--placeholder" id="ad-top">
					<span>Ad — 728×90</span>
				</div>`;

const AD_SIDEBAR = `
							<!-- Ad: Sidebar Rectangle -->
							<div class="ad-slot ad-slot--sidebar ad-slot--placeholder" id="ad-sidebar-1">
								<span>Ad — 300×250</span>
							</div>
							<div class="ad-slot ad-slot--sidebar ad-slot--placeholder" id="ad-sidebar-2" style="margin-top:20px;">
								<span>Ad — 300×250</span>
							</div>`;

const AD_BOTTOM = `
				<!-- Ad: Bottom Leaderboard -->
				<div class="ad-slot ad-slot--footer ad-slot--placeholder" id="ad-bottom">
					<span>Ad — 728×90</span>
				</div>`;

/**
 * Build a complete tool page
 */
function buildToolPage(tool) {
  // Custom <head> section - replace title and meta
  let head = beforeMain
    .replace(/<title>.*?<\/title>/, `<title>${tool.title} - Free Online Tool | Necromancers</title>`)
    .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${tool.description}">`)
    .replace(/<meta name="keywords" content=".*?">/, `<meta name="keywords" content="${tool.keywords}">`);

  // Build main content
  const main = `		<main class="site-content site-content--center page" id="wrapper">
			<div class="container container--large">
				<div class="page-heading page-heading--default text-center w-100">
					<div class="page-heading__subtitle h5">
						<span class="color-primary">Free Online Tool</span>
					</div>
					<h1 class="page-heading__title h2">${tool.title}</h1>
					<p class="text-muted" style="max-width:560px;margin:10px auto 0;">${tool.subtitle}</p>
				</div>
${AD_TOP}
				<div class="row mt-sm-auto mb-sm-auto" style="justify-content:center;">
					<div class="col-lg-8">
						<div class="card card--has-table" style="padding:30px;">
${tool.html}
						</div>
						<!-- Back link -->
						<div style="text-align:center;margin-top:20px;">
							<a href="features-tool-suite.html" class="btn btn-outline btn-xs">&larr; Back to Tool Suite</a>
						</div>
					</div>
					<div class="col-lg-4 d-none d-lg-block">
${AD_SIDEBAR}
					</div>
				</div>
${AD_BOTTOM}
			</div>
		</main>

${tool.scripts || ''}
		`;

  return head + main + afterMain;
}

// ===================================================================
// TOOL DEFINITIONS
// ===================================================================

const tools = [];

// ---------------------------------------------------------------
// 1. PASSWORD GENERATOR
// ---------------------------------------------------------------
tools.push({
  file: 'tools-password-generator.html',
  title: 'Password Generator',
  subtitle: 'Generate strong, secure passwords instantly. Customize length, character types, and copy with one click.',
  description: 'Free password generator — create strong, random passwords with custom length and character sets. No data sent to any server.',
  keywords: 'password generator, strong password, random password, secure password generator, free password tool',
  html: `
							<div class="tool-row">
								<label class="tool-label">Password Length</label>
								<div class="tool-range-row">
									<input type="range" id="pw-length" min="4" max="128" value="20">
									<span class="tool-range-value" id="pw-length-val">20</span>
								</div>
							</div>
							<div class="tool-row">
								<label class="tool-label">Character Types</label>
								<div class="tool-checkbox-row">
									<label><input type="checkbox" id="pw-upper" checked> Uppercase (A-Z)</label>
									<label><input type="checkbox" id="pw-lower" checked> Lowercase (a-z)</label>
									<label><input type="checkbox" id="pw-digits" checked> Numbers (0-9)</label>
									<label><input type="checkbox" id="pw-symbols" checked> Symbols (!@#$...)</label>
									<label><input type="checkbox" id="pw-ambiguous"> Exclude Ambiguous (0O1lI)</label>
								</div>
							</div>
							<div class="tool-row">
								<label class="tool-label">How Many?</label>
								<select id="pw-count" class="tool-select" style="max-width:120px;">
									<option value="1" selected>1</option>
									<option value="3">3</option>
									<option value="5">5</option>
									<option value="10">10</option>
								</select>
							</div>
							<div class="tool-actions">
								<button id="pw-generate" class="btn btn-primary">Generate Password</button>
								<button id="pw-copy" class="btn btn-secondary">Copy All</button>
							</div>
							<div class="tool-row">
								<label class="tool-label">Generated Passwords</label>
								<div id="pw-output" class="tool-output" style="white-space:pre-wrap;min-height:50px;"></div>
							</div>
							<div class="tool-row">
								<label class="tool-label">Strength</label>
								<div style="height:8px;background:#1e2024;border-radius:4px;overflow:hidden;">
									<div id="pw-strength-bar" style="height:100%;width:0;border-radius:4px;transition:width .3s, background .3s;"></div>
								</div>
								<p id="pw-strength-text" class="tool-status text-muted"></p>
							</div>`,
  scripts: `
		<script>
		(function(){
			var lenEl=document.getElementById('pw-length'),valEl=document.getElementById('pw-length-val'),
				upperEl=document.getElementById('pw-upper'),lowerEl=document.getElementById('pw-lower'),
				digitsEl=document.getElementById('pw-digits'),symbolsEl=document.getElementById('pw-symbols'),
				ambigEl=document.getElementById('pw-ambiguous'),countEl=document.getElementById('pw-count'),
				genBtn=document.getElementById('pw-generate'),copyBtn=document.getElementById('pw-copy'),
				outEl=document.getElementById('pw-output'),barEl=document.getElementById('pw-strength-bar'),
				strEl=document.getElementById('pw-strength-text');
			var UPPER='ABCDEFGHIJKLMNOPQRSTUVWXYZ',LOWER='abcdefghijklmnopqrstuvwxyz',
				DIGITS='0123456789',SYMBOLS='!@#$%^&*()_+-=[]{}|;:,.<>?/~';
			var AMBIG='0O1lI';
			lenEl.oninput=function(){valEl.textContent=this.value;};
			function generate(){
				var chars='';
				if(upperEl.checked)chars+=UPPER;if(lowerEl.checked)chars+=LOWER;
				if(digitsEl.checked)chars+=DIGITS;if(symbolsEl.checked)chars+=SYMBOLS;
				if(!chars){outEl.textContent='Select at least one character type.';return;}
				if(ambigEl.checked){for(var i=0;i<AMBIG.length;i++)chars=chars.split(AMBIG[i]).join('');}
				var len=parseInt(lenEl.value,10),count=parseInt(countEl.value,10),results=[];
				for(var c=0;c<count;c++){
					var arr=new Uint32Array(len);crypto.getRandomValues(arr);
					var pw='';for(var i=0;i<len;i++)pw+=chars[arr[i]%chars.length];
					results.push(pw);
				}
				outEl.textContent=results.join('\\n');
				// strength calc
				var pool=0;
				if(upperEl.checked)pool+=26;if(lowerEl.checked)pool+=26;
				if(digitsEl.checked)pool+=10;if(symbolsEl.checked)pool+=28;
				var entropy=Math.log2(Math.pow(pool,len));
				var pct=Math.min(100,entropy/128*100);
				barEl.style.width=pct+'%';
				if(entropy<28){barEl.style.background='#f44336';strEl.textContent='Very Weak ('+Math.round(entropy)+' bits)';}
				else if(entropy<36){barEl.style.background='#ff9800';strEl.textContent='Weak ('+Math.round(entropy)+' bits)';}
				else if(entropy<60){barEl.style.background='#ffc107';strEl.textContent='Fair ('+Math.round(entropy)+' bits)';}
				else if(entropy<80){barEl.style.background='#8bc34a';strEl.textContent='Strong ('+Math.round(entropy)+' bits)';}
				else{barEl.style.background='#4caf50';strEl.textContent='Very Strong ('+Math.round(entropy)+' bits)';}
			}
			genBtn.addEventListener('click',generate);
			copyBtn.addEventListener('click',function(){
				navigator.clipboard.writeText(outEl.textContent).then(function(){strEl.textContent='Copied!';});
			});
			generate();
		})();
		</script>`
});

// ---------------------------------------------------------------
// 2. TEXT CASE CONVERTER
// ---------------------------------------------------------------
tools.push({
  file: 'tools-case-converter.html',
  title: 'Text Case Converter',
  subtitle: 'Convert text between UPPERCASE, lowercase, Title Case, Sentence case, and more. Paste and click.',
  description: 'Free text case converter — instantly change text to uppercase, lowercase, title case, sentence case, and more.',
  keywords: 'text case converter, uppercase converter, lowercase converter, title case, sentence case, text transform',
  html: `
							<div class="tool-row">
								<label class="tool-label" for="case-input">Paste Your Text</label>
								<textarea id="case-input" class="tool-input" rows="6" placeholder="Type or paste your text here..."></textarea>
							</div>
							<div class="tool-actions" style="flex-wrap:wrap;">
								<button class="btn btn-primary btn-xs" data-case="upper">UPPERCASE</button>
								<button class="btn btn-primary btn-xs" data-case="lower">lowercase</button>
								<button class="btn btn-primary btn-xs" data-case="title">Title Case</button>
								<button class="btn btn-primary btn-xs" data-case="sentence">Sentence case</button>
								<button class="btn btn-primary btn-xs" data-case="toggle">tOGGLE cASE</button>
								<button class="btn btn-primary btn-xs" data-case="alternating">aLtErNaTiNg</button>
								<button class="btn btn-primary btn-xs" data-case="slug">slug-case</button>
								<button class="btn btn-primary btn-xs" data-case="camel">camelCase</button>
								<button class="btn btn-primary btn-xs" data-case="snake">snake_case</button>
								<button class="btn btn-primary btn-xs" data-case="kebab">kebab-case</button>
							</div>
							<div class="tool-row">
								<label class="tool-label">Result</label>
								<textarea id="case-output" class="tool-input" rows="6" readonly></textarea>
							</div>
							<div class="tool-actions">
								<button id="case-copy" class="btn btn-secondary">Copy Result</button>
								<button id="case-clear" class="btn btn-secondary">Clear</button>
							</div>
							<p id="case-status" class="tool-status text-muted"></p>`,
  scripts: `
		<script>
		(function(){
			var inp=document.getElementById('case-input'),out=document.getElementById('case-output'),
				stat=document.getElementById('case-status');
			function toTitle(s){return s.replace(/\\b\\w/g,function(c){return c.toUpperCase();});}
			function toSentence(s){return s.toLowerCase().replace(/(^\\s*|[.!?]\\s+)(\\w)/g,function(m,p,c){return p+c.toUpperCase();});}
			var handlers={
				upper:function(s){return s.toUpperCase();},
				lower:function(s){return s.toLowerCase();},
				title:toTitle,
				sentence:toSentence,
				toggle:function(s){return s.split('').map(function(c){return c===c.toUpperCase()?c.toLowerCase():c.toUpperCase();}).join('');},
				alternating:function(s){var i=0;return s.split('').map(function(c){if(/[a-z]/i.test(c)){return(i++%2===0)?c.toLowerCase():c.toUpperCase();}return c;}).join('');},
				slug:function(s){return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');},
				camel:function(s){return s.toLowerCase().replace(/[^a-z0-9]+(.)/g,function(m,c){return c.toUpperCase();});},
				snake:function(s){return s.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');},
				kebab:function(s){return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
			};
			document.querySelectorAll('[data-case]').forEach(function(btn){
				btn.addEventListener('click',function(){
					var t=inp.value;if(!t){stat.textContent='Enter some text first.';return;}
					out.value=handlers[this.dataset.case](t);stat.textContent='Converted!';
				});
			});
			document.getElementById('case-copy').addEventListener('click',function(){
				navigator.clipboard.writeText(out.value).then(function(){stat.textContent='Copied!';});
			});
			document.getElementById('case-clear').addEventListener('click',function(){inp.value='';out.value='';stat.textContent='';});
		})();
		</script>`
});

// ---------------------------------------------------------------
// 3. WORD & CHARACTER COUNTER
// ---------------------------------------------------------------
tools.push({
  file: 'tools-word-counter.html',
  title: 'Word & Character Counter',
  subtitle: 'Count words, characters, sentences, paragraphs, and estimated reading time in real time.',
  description: 'Free word counter tool — count words, characters, sentences, paragraphs, and reading time instantly.',
  keywords: 'word counter, character counter, letter count, reading time, word count tool, text analyzer',
  html: `
							<div class="tool-row">
								<label class="tool-label" for="wc-input">Paste or Type Your Text</label>
								<textarea id="wc-input" class="tool-input" rows="10" placeholder="Start typing or paste text here..."></textarea>
							</div>
							<div class="row" style="text-align:center;margin-bottom:16px;">
								<div class="col-4 col-sm">
									<div style="padding:12px;background:#1e2024;border-radius:6px;">
										<div id="wc-words" style="font-size:28px;font-weight:700;color:#e20e17;">0</div>
										<div style="font-size:11px;text-transform:uppercase;color:#888;">Words</div>
									</div>
								</div>
								<div class="col-4 col-sm">
									<div style="padding:12px;background:#1e2024;border-radius:6px;">
										<div id="wc-chars" style="font-size:28px;font-weight:700;color:#e20e17;">0</div>
										<div style="font-size:11px;text-transform:uppercase;color:#888;">Characters</div>
									</div>
								</div>
								<div class="col-4 col-sm">
									<div style="padding:12px;background:#1e2024;border-radius:6px;">
										<div id="wc-nospace" style="font-size:28px;font-weight:700;color:#e20e17;">0</div>
										<div style="font-size:11px;text-transform:uppercase;color:#888;">No Spaces</div>
									</div>
								</div>
								<div class="col-4 col-sm" style="margin-top:10px;">
									<div style="padding:12px;background:#1e2024;border-radius:6px;">
										<div id="wc-sentences" style="font-size:28px;font-weight:700;color:#e20e17;">0</div>
										<div style="font-size:11px;text-transform:uppercase;color:#888;">Sentences</div>
									</div>
								</div>
								<div class="col-4 col-sm" style="margin-top:10px;">
									<div style="padding:12px;background:#1e2024;border-radius:6px;">
										<div id="wc-paragraphs" style="font-size:28px;font-weight:700;color:#e20e17;">0</div>
										<div style="font-size:11px;text-transform:uppercase;color:#888;">Paragraphs</div>
									</div>
								</div>
								<div class="col-4 col-sm" style="margin-top:10px;">
									<div style="padding:12px;background:#1e2024;border-radius:6px;">
										<div id="wc-readtime" style="font-size:28px;font-weight:700;color:#e20e17;">0s</div>
										<div style="font-size:11px;text-transform:uppercase;color:#888;">Read Time</div>
									</div>
								</div>
							</div>
							<div class="tool-actions">
								<button id="wc-copy" class="btn btn-secondary">Copy Stats</button>
								<button id="wc-clear" class="btn btn-secondary">Clear</button>
							</div>`,
  scripts: `
		<script>
		(function(){
			var inp=document.getElementById('wc-input');
			var els={words:'wc-words',chars:'wc-chars',nospace:'wc-nospace',sentences:'wc-sentences',paragraphs:'wc-paragraphs',read:'wc-readtime'};
			for(var k in els)els[k]=document.getElementById(els[k]);
			function update(){
				var t=inp.value;
				var words=t.trim()?t.trim().split(/\\s+/).length:0;
				var chars=t.length;
				var nospace=t.replace(/\\s/g,'').length;
				var sentences=t.trim()?t.split(/[.!?]+/).filter(function(s){return s.trim();}).length:0;
				var paragraphs=t.trim()?t.split(/\\n\\s*\\n/).filter(function(s){return s.trim();}).length:0;
				var mins=Math.floor(words/225),secs=Math.round((words%225)/225*60);
				var readStr=mins>0?mins+'m '+secs+'s':secs+'s';
				els.words.textContent=words;els.chars.textContent=chars;els.nospace.textContent=nospace;
				els.sentences.textContent=sentences;els.paragraphs.textContent=paragraphs;els.read.textContent=readStr;
			}
			inp.addEventListener('input',update);
			document.getElementById('wc-copy').addEventListener('click',function(){
				var s='Words: '+els.words.textContent+'\\nCharacters: '+els.chars.textContent+'\\nWithout Spaces: '+els.nospace.textContent+'\\nSentences: '+els.sentences.textContent+'\\nParagraphs: '+els.paragraphs.textContent+'\\nReading Time: '+els.read.textContent;
				navigator.clipboard.writeText(s);
			});
			document.getElementById('wc-clear').addEventListener('click',function(){inp.value='';update();});
		})();
		</script>`
});

// ---------------------------------------------------------------
// 4. JSON FORMATTER
// ---------------------------------------------------------------
tools.push({
  file: 'tools-json-formatter.html',
  title: 'JSON Formatter & Validator',
  subtitle: 'Beautify, minify, and validate JSON data. Syntax highlighting and error detection.',
  description: 'Free JSON formatter and validator — beautify, minify, and validate JSON with syntax highlighting. Works offline.',
  keywords: 'json formatter, json validator, json beautifier, json minifier, format json, pretty print json',
  html: `
							<div class="tool-row">
								<label class="tool-label" for="json-input">Paste JSON</label>
								<textarea id="json-input" class="tool-input" rows="8" placeholder='{"key": "value", "items": [1, 2, 3]}'></textarea>
							</div>
							<div class="tool-row">
								<label class="tool-label">Indent Spaces</label>
								<select id="json-indent" class="tool-select" style="max-width:100px;">
									<option value="2" selected>2</option>
									<option value="4">4</option>
									<option value="\\t">Tab</option>
								</select>
							</div>
							<div class="tool-actions">
								<button id="json-format" class="btn btn-primary">Beautify</button>
								<button id="json-minify" class="btn btn-primary">Minify</button>
								<button id="json-validate" class="btn btn-secondary">Validate Only</button>
								<button id="json-copy" class="btn btn-secondary">Copy Output</button>
							</div>
							<div class="tool-row">
								<label class="tool-label">Output</label>
								<div id="json-output" class="tool-output" style="min-height:150px;"></div>
							</div>
							<p id="json-status" class="tool-status text-muted"></p>`,
  scripts: `
		<script>
		(function(){
			var inp=document.getElementById('json-input'),outEl=document.getElementById('json-output'),
				stat=document.getElementById('json-status'),indEl=document.getElementById('json-indent');
			function parse(){
				try{return{data:JSON.parse(inp.value),err:null};}
				catch(e){return{data:null,err:e.message};}
			}
			document.getElementById('json-format').addEventListener('click',function(){
				var r=parse();if(r.err){outEl.textContent='';stat.textContent='Error: '+r.err;stat.style.color='#f44336';return;}
				var indent=indEl.value==='\\t'?'\\t':parseInt(indEl.value,10);
				outEl.textContent=JSON.stringify(r.data,null,indent);stat.textContent='Formatted!';stat.style.color='#4caf50';
			});
			document.getElementById('json-minify').addEventListener('click',function(){
				var r=parse();if(r.err){outEl.textContent='';stat.textContent='Error: '+r.err;stat.style.color='#f44336';return;}
				outEl.textContent=JSON.stringify(r.data);stat.textContent='Minified! ('+outEl.textContent.length+' chars)';stat.style.color='#4caf50';
			});
			document.getElementById('json-validate').addEventListener('click',function(){
				var r=parse();
				if(r.err){stat.textContent='Invalid JSON: '+r.err;stat.style.color='#f44336';outEl.textContent='';}
				else{stat.textContent='Valid JSON!';stat.style.color='#4caf50';outEl.textContent='';}
			});
			document.getElementById('json-copy').addEventListener('click',function(){
				navigator.clipboard.writeText(outEl.textContent).then(function(){stat.textContent='Copied!';stat.style.color='#4caf50';});
			});
		})();
		</script>`
});

// ---------------------------------------------------------------
// 5. BASE64 ENCODE/DECODE
// ---------------------------------------------------------------
tools.push({
  file: 'tools-base64.html',
  title: 'Base64 Encode / Decode',
  subtitle: 'Encode text to Base64 or decode Base64 strings back to readable text. Supports UTF-8.',
  description: 'Free Base64 encoder and decoder — convert text to Base64 and vice versa. Handles UTF-8 characters.',
  keywords: 'base64 encode, base64 decode, base64 converter, text to base64, base64 to text',
  html: `
							<div class="tool-row">
								<label class="tool-label" for="b64-input">Input</label>
								<textarea id="b64-input" class="tool-input" rows="6" placeholder="Enter text or Base64 string..."></textarea>
							</div>
							<div class="tool-actions">
								<button id="b64-encode" class="btn btn-primary">Encode to Base64</button>
								<button id="b64-decode" class="btn btn-primary">Decode from Base64</button>
								<button id="b64-copy" class="btn btn-secondary">Copy Output</button>
								<button id="b64-swap" class="btn btn-secondary">↕ Swap</button>
							</div>
							<div class="tool-row">
								<label class="tool-label">Output</label>
								<textarea id="b64-output" class="tool-input" rows="6" readonly></textarea>
							</div>
							<p id="b64-status" class="tool-status text-muted"></p>`,
  scripts: `
		<script>
		(function(){
			var inp=document.getElementById('b64-input'),out=document.getElementById('b64-output'),stat=document.getElementById('b64-status');
			function utf8ToB64(s){return btoa(unescape(encodeURIComponent(s)));}
			function b64ToUtf8(s){return decodeURIComponent(escape(atob(s)));}
			document.getElementById('b64-encode').addEventListener('click',function(){
				try{out.value=utf8ToB64(inp.value);stat.textContent='Encoded! ('+out.value.length+' chars)';stat.style.color='#4caf50';}
				catch(e){stat.textContent='Error: '+e.message;stat.style.color='#f44336';}
			});
			document.getElementById('b64-decode').addEventListener('click',function(){
				try{out.value=b64ToUtf8(inp.value.trim());stat.textContent='Decoded!';stat.style.color='#4caf50';}
				catch(e){stat.textContent='Invalid Base64 input.';stat.style.color='#f44336';}
			});
			document.getElementById('b64-copy').addEventListener('click',function(){
				navigator.clipboard.writeText(out.value).then(function(){stat.textContent='Copied!';stat.style.color='#4caf50';});
			});
			document.getElementById('b64-swap').addEventListener('click',function(){
				var tmp=inp.value;inp.value=out.value;out.value=tmp;stat.textContent='Swapped!';
			});
		})();
		</script>`
});

// ---------------------------------------------------------------
// 6. URL ENCODE/DECODE
// ---------------------------------------------------------------
tools.push({
  file: 'tools-url-encoder.html',
  title: 'URL Encode / Decode',
  subtitle: 'Percent-encode URLs and query parameters, or decode encoded strings back to readable text.',
  description: 'Free URL encoder and decoder — percent-encode/decode URLs, query strings, and special characters.',
  keywords: 'url encode, url decode, percent encoding, urlencode online, url encoder decoder',
  html: `
							<div class="tool-row">
								<label class="tool-label" for="url-input">Input</label>
								<textarea id="url-input" class="tool-input" rows="4" placeholder="https://example.com/path?q=hello world&lang=en"></textarea>
							</div>
							<div class="tool-actions">
								<button id="url-encode" class="btn btn-primary">Encode</button>
								<button id="url-encode-comp" class="btn btn-primary">Encode Component</button>
								<button id="url-decode" class="btn btn-primary">Decode</button>
								<button id="url-copy" class="btn btn-secondary">Copy</button>
								<button id="url-swap" class="btn btn-secondary">↕ Swap</button>
							</div>
							<div class="tool-row">
								<label class="tool-label">Output</label>
								<textarea id="url-output" class="tool-input" rows="4" readonly></textarea>
							</div>
							<p id="url-status" class="tool-status text-muted"></p>`,
  scripts: `
		<script>
		(function(){
			var inp=document.getElementById('url-input'),out=document.getElementById('url-output'),stat=document.getElementById('url-status');
			document.getElementById('url-encode').addEventListener('click',function(){
				try{out.value=encodeURI(inp.value);stat.textContent='Encoded!';}catch(e){stat.textContent='Error: '+e.message;}
			});
			document.getElementById('url-encode-comp').addEventListener('click',function(){
				try{out.value=encodeURIComponent(inp.value);stat.textContent='Component encoded!';}catch(e){stat.textContent='Error: '+e.message;}
			});
			document.getElementById('url-decode').addEventListener('click',function(){
				try{out.value=decodeURIComponent(inp.value);stat.textContent='Decoded!';}catch(e){stat.textContent='Error: '+e.message;}
			});
			document.getElementById('url-copy').addEventListener('click',function(){navigator.clipboard.writeText(out.value);stat.textContent='Copied!';});
			document.getElementById('url-swap').addEventListener('click',function(){var t=inp.value;inp.value=out.value;out.value=t;});
		})();
		</script>`
});

// ---------------------------------------------------------------
// 7. HASH GENERATOR
// ---------------------------------------------------------------
tools.push({
  file: 'tools-hash-generator.html',
  title: 'Hash Generator',
  subtitle: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from any text. Uses Web Crypto API.',
  description: 'Free hash generator — compute MD5, SHA-1, SHA-256, and SHA-512 hashes from text. 100% client-side.',
  keywords: 'hash generator, sha256, sha512, sha1, md5, hash calculator, text to hash',
  html: `
							<div class="tool-row">
								<label class="tool-label" for="hash-input">Text to Hash</label>
								<textarea id="hash-input" class="tool-input" rows="4" placeholder="Enter text to hash..."></textarea>
							</div>
							<div class="tool-actions">
								<button id="hash-generate" class="btn btn-primary">Generate Hashes</button>
								<button id="hash-clear" class="btn btn-secondary">Clear</button>
							</div>
							<div class="tool-row">
								<label class="tool-label">SHA-256</label>
								<div class="tool-output" id="hash-sha256" style="min-height:auto;padding:10px;cursor:pointer;" title="Click to copy"></div>
							</div>
							<div class="tool-row">
								<label class="tool-label">SHA-512</label>
								<div class="tool-output" id="hash-sha512" style="min-height:auto;padding:10px;cursor:pointer;" title="Click to copy"></div>
							</div>
							<div class="tool-row">
								<label class="tool-label">SHA-1</label>
								<div class="tool-output" id="hash-sha1" style="min-height:auto;padding:10px;cursor:pointer;" title="Click to copy"></div>
							</div>
							<p id="hash-status" class="tool-status text-muted">Click any hash to copy it.</p>`,
  scripts: `
		<script>
		(function(){
			var inp=document.getElementById('hash-input'),stat=document.getElementById('hash-status');
			var algos=['SHA-256','SHA-512','SHA-1'];
			var outEls={};algos.forEach(function(a){outEls[a]=document.getElementById('hash-'+a.toLowerCase().replace('-',''));});
			async function hashText(algo,text){
				var enc=new TextEncoder().encode(text);
				var buf=await crypto.subtle.digest(algo,enc);
				return Array.from(new Uint8Array(buf)).map(function(b){return b.toString(16).padStart(2,'0');}).join('');
			}
			document.getElementById('hash-generate').addEventListener('click',async function(){
				var t=inp.value;if(!t){stat.textContent='Enter text first.';return;}
				for(var i=0;i<algos.length;i++){
					var h=await hashText(algos[i],t);outEls[algos[i]].textContent=h;
				}
				stat.textContent='Hashes generated! Click any to copy.';
			});
			algos.forEach(function(a){
				outEls[a].addEventListener('click',function(){
					if(this.textContent)navigator.clipboard.writeText(this.textContent).then(function(){stat.textContent=a+' hash copied!';});
				});
			});
			document.getElementById('hash-clear').addEventListener('click',function(){
				inp.value='';algos.forEach(function(a){outEls[a].textContent='';});stat.textContent='';
			});
		})();
		</script>`
});

// ---------------------------------------------------------------
// 8. COLOR PICKER / PALETTE
// ---------------------------------------------------------------
tools.push({
  file: 'tools-color-palette.html',
  title: 'Color Picker & Palette Generator',
  subtitle: 'Pick colors, generate harmonious palettes, and copy HEX, RGB, and HSL values.',
  description: 'Free color picker and palette generator — pick colors, create complementary/analogous palettes, copy HEX RGB HSL.',
  keywords: 'color picker, color palette generator, hex to rgb, color converter, color scheme generator',
  html: `
							<div class="tool-row">
								<label class="tool-label">Pick a Color</label>
								<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
									<input type="color" id="cp-picker" value="#e20e17" style="width:80px;height:60px;border:2px solid #3c3d42;border-radius:6px;cursor:pointer;padding:2px;">
									<input type="text" id="cp-hex" class="tool-input" value="#e20e17" style="width:120px;text-align:center;font-weight:700;font-size:18px;">
								</div>
							</div>
							<div class="row" style="margin-bottom:16px;">
								<div class="col-sm-4 tool-row"><label class="tool-label">RGB</label><input id="cp-rgb" class="tool-input" readonly style="cursor:pointer;" title="Click to copy"></div>
								<div class="col-sm-4 tool-row"><label class="tool-label">HSL</label><input id="cp-hsl" class="tool-input" readonly style="cursor:pointer;" title="Click to copy"></div>
								<div class="col-sm-4 tool-row"><label class="tool-label">CSS</label><input id="cp-css" class="tool-input" readonly style="cursor:pointer;" title="Click to copy"></div>
							</div>
							<div class="tool-row">
								<label class="tool-label">Palette Type</label>
								<div class="tool-actions">
									<button class="btn btn-primary btn-xs" data-palette="complement">Complementary</button>
									<button class="btn btn-primary btn-xs" data-palette="analogous">Analogous</button>
									<button class="btn btn-primary btn-xs" data-palette="triadic">Triadic</button>
									<button class="btn btn-primary btn-xs" data-palette="split">Split-Complement</button>
									<button class="btn btn-primary btn-xs" data-palette="shades">Shades</button>
								</div>
							</div>
							<div class="tool-row">
								<label class="tool-label">Generated Palette</label>
								<div id="cp-palette" class="color-palette-row"></div>
								<div id="cp-palette-codes" class="tool-output" style="min-height:auto;padding:10px;"></div>
							</div>
							<p id="cp-status" class="tool-status text-muted">Click any swatch or value to copy.</p>`,
  scripts: `
		<script>
		(function(){
			var picker=document.getElementById('cp-picker'),hexIn=document.getElementById('cp-hex'),
				rgbEl=document.getElementById('cp-rgb'),hslEl=document.getElementById('cp-hsl'),cssEl=document.getElementById('cp-css'),
				palEl=document.getElementById('cp-palette'),codesEl=document.getElementById('cp-palette-codes'),stat=document.getElementById('cp-status');
			function hexToRgb(h){h=h.replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
				return{r:parseInt(h.substr(0,2),16),g:parseInt(h.substr(2,2),16),b:parseInt(h.substr(4,2),16}};}
			function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;var mx=Math.max(r,g,b),mn=Math.min(r,g,b),h,s,l=(mx+mn)/2;
				if(mx===mn){h=s=0;}else{var d=mx-mn;s=l>0.5?d/(2-mx-mn):d/(mx+mn);
				if(mx===r)h=((g-b)/d+(g<b?6:0))/6;else if(mx===g)h=((b-r)/d+2)/6;else h=((r-g)/d+4)/6;}
				return{h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};}
			function hslToHex(h,s,l){s/=100;l/=100;var a=s*Math.min(l,1-l);
				function f(n){var k=(n+h/30)%12;var c=l-a*Math.max(Math.min(k-3,9-k,1),-1);return Math.round(255*c).toString(16).padStart(2,'0');}
				return'#'+f(0)+f(8)+f(4);}
			function update(){
				var hex=picker.value;hexIn.value=hex;
				var rgb=hexToRgb(hex),hsl=rgbToHsl(rgb.r,rgb.g,rgb.b);
				rgbEl.value='rgb('+rgb.r+', '+rgb.g+', '+rgb.b+')';
				hslEl.value='hsl('+hsl.h+', '+hsl.s+'%, '+hsl.l+'%)';
				cssEl.value=hex;
			}
			picker.addEventListener('input',update);
			hexIn.addEventListener('input',function(){if(/^#[0-9a-f]{6}$/i.test(this.value)){picker.value=this.value;update();}});
			[rgbEl,hslEl,cssEl].forEach(function(el){el.addEventListener('click',function(){navigator.clipboard.writeText(this.value);stat.textContent='Copied: '+this.value;});});
			update();
			function genPalette(type){
				var hex=picker.value,rgb=hexToRgb(hex),hsl=rgbToHsl(rgb.r,rgb.g,rgb.b),colors=[];
				if(type==='complement'){colors=[hex,hslToHex((hsl.h+180)%360,hsl.s,hsl.l)];}
				else if(type==='analogous'){for(var i=-2;i<=2;i++)colors.push(hslToHex((hsl.h+i*30+360)%360,hsl.s,hsl.l));}
				else if(type==='triadic'){colors=[hex,hslToHex((hsl.h+120)%360,hsl.s,hsl.l),hslToHex((hsl.h+240)%360,hsl.s,hsl.l)];}
				else if(type==='split'){colors=[hex,hslToHex((hsl.h+150)%360,hsl.s,hsl.l),hslToHex((hsl.h+210)%360,hsl.s,hsl.l)];}
				else if(type==='shades'){for(var i=0;i<6;i++)colors.push(hslToHex(hsl.h,hsl.s,Math.max(0,hsl.l-i*12)));}
				palEl.innerHTML='';codesEl.textContent=colors.join('  ');
				colors.forEach(function(c){
					var d=document.createElement('div');d.className='color-swatch';d.style.background=c;d.title=c;
					d.addEventListener('click',function(){navigator.clipboard.writeText(c);stat.textContent='Copied: '+c;});
					palEl.appendChild(d);
				});
			}
			document.querySelectorAll('[data-palette]').forEach(function(b){
				b.addEventListener('click',function(){genPalette(this.dataset.palette);});
			});
		})();
		</script>`
});

// ---------------------------------------------------------------
// 9. LOREM IPSUM GENERATOR
// ---------------------------------------------------------------
tools.push({
  file: 'tools-lorem-ipsum.html',
  title: 'Lorem Ipsum Generator',
  subtitle: 'Generate placeholder text by paragraphs, sentences, or words for mockups and design.',
  description: 'Free Lorem Ipsum generator — create placeholder text by paragraphs, sentences, or words for design and development.',
  keywords: 'lorem ipsum generator, placeholder text, dummy text, lipsum, filler text generator',
  html: `
							<div class="row tool-row">
								<div class="col-sm-4" style="margin-bottom:10px;">
									<label class="tool-label">Type</label>
									<select id="li-type" class="tool-select">
										<option value="paragraphs" selected>Paragraphs</option>
										<option value="sentences">Sentences</option>
										<option value="words">Words</option>
									</select>
								</div>
								<div class="col-sm-4" style="margin-bottom:10px;">
									<label class="tool-label">Count</label>
									<input type="number" id="li-count" class="tool-input" value="3" min="1" max="100">
								</div>
								<div class="col-sm-4" style="margin-bottom:10px;">
									<label class="tool-label">Start with "Lorem ipsum..."</label>
									<label style="display:flex;align-items:center;gap:6px;padding-top:4px;"><input type="checkbox" id="li-classic" checked style="accent-color:#e20e17;width:16px;height:16px;"> Yes</label>
								</div>
							</div>
							<div class="tool-actions">
								<button id="li-generate" class="btn btn-primary">Generate</button>
								<button id="li-copy" class="btn btn-secondary">Copy Text</button>
								<button id="li-html" class="btn btn-secondary">Copy as HTML</button>
							</div>
							<div class="tool-row">
								<label class="tool-label">Output <span id="li-stat" class="text-muted" style="font-weight:400;"></span></label>
								<div id="li-output" class="tool-output" style="min-height:200px;white-space:pre-wrap;color:#ccc;"></div>
							</div>`,
  scripts: `
		<script>
		(function(){
			var WORDS='lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');
			var CLASSIC='Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
			function randWord(){return WORDS[Math.floor(Math.random()*WORDS.length)];}
			function randSentence(wc){wc=wc||Math.floor(Math.random()*12)+5;var s=[];for(var i=0;i<wc;i++)s.push(randWord());s[0]=s[0][0].toUpperCase()+s[0].slice(1);return s.join(' ')+'.';}
			function randParagraph(sc){sc=sc||Math.floor(Math.random()*4)+3;var s=[];for(var i=0;i<sc;i++)s.push(randSentence());return s.join(' ');}
			var outEl=document.getElementById('li-output'),statEl=document.getElementById('li-stat'),
				typeEl=document.getElementById('li-type'),countEl=document.getElementById('li-count'),classicEl=document.getElementById('li-classic');
			var lastText='';
			function generate(){
				var type=typeEl.value,count=Math.min(100,Math.max(1,parseInt(countEl.value,10)||1)),parts=[];
				if(type==='paragraphs'){for(var i=0;i<count;i++)parts.push(randParagraph());}
				else if(type==='sentences'){for(var i=0;i<count;i++)parts.push(randSentence());}
				else{var w=[];for(var i=0;i<count;i++)w.push(randWord());parts=[w.join(' ')];}
				lastText=parts.join(type==='paragraphs'?'\\n\\n':' ');
				if(classicEl.checked&&lastText.length>0)lastText=CLASSIC+' '+lastText;
				outEl.textContent=lastText;
				var wc=lastText.trim().split(/\\s+/).length;
				statEl.textContent='('+wc+' words, '+lastText.length+' chars)';
			}
			document.getElementById('li-generate').addEventListener('click',generate);
			document.getElementById('li-copy').addEventListener('click',function(){navigator.clipboard.writeText(lastText);});
			document.getElementById('li-html').addEventListener('click',function(){
				var html=lastText.split('\\n\\n').map(function(p){return'<p>'+p+'</p>';}).join('\\n');
				navigator.clipboard.writeText(html);
			});
			generate();
		})();
		</script>`
});

// ---------------------------------------------------------------
// 10. MARKDOWN PREVIEW
// ---------------------------------------------------------------
tools.push({
  file: 'tools-markdown-preview.html',
  title: 'Markdown Preview',
  subtitle: 'Write Markdown on the left, see live HTML preview on the right. Supports headings, lists, code, and more.',
  description: 'Free Markdown live preview — write Markdown and see rendered HTML in real time. Supports full GFM syntax.',
  keywords: 'markdown preview, markdown editor, markdown to html, live markdown, markdown viewer',
  html: `
							<div class="row">
								<div class="col-md-6 tool-row">
									<label class="tool-label">Markdown</label>
									<textarea id="md-input" class="tool-input" rows="16" placeholder="# Hello World\n\nWrite **Markdown** here...">
# Welcome to Markdown Preview

This is a **live preview** tool. Edit the text on the left.

## Features
- **Bold** and *italic* text
- [Links](https://example.com)
- Inline \`code\`

### Code Block
\`\`\`
function hello() {
  console.log('Hello!');
}
\`\`\`

> Blockquotes look like this.

1. Ordered list
2. Items here

---

That's it! Start editing above.</textarea>
								</div>
								<div class="col-md-6 tool-row">
									<label class="tool-label">Preview</label>
									<div id="md-preview" style="padding:15px;background:#1e2024;border:1px solid #3c3d42;border-radius:4px;min-height:360px;overflow:auto;color:#ccc;line-height:1.6;"></div>
								</div>
							</div>
							<div class="tool-actions">
								<button id="md-copy-html" class="btn btn-secondary">Copy HTML</button>
								<button id="md-clear" class="btn btn-secondary">Clear</button>
							</div>
							<p id="md-status" class="tool-status text-muted"></p>`,
  scripts: `
		<script src="https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.1/marked.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
		<script>
		(function(){
			var inp=document.getElementById('md-input'),prev=document.getElementById('md-preview'),stat=document.getElementById('md-status');
			var renderer=new marked.Renderer();
			// Sanitize link targets to prevent XSS
			renderer.link=function(token){
				var href=token.href||'';var text=token.text||'';
				if(href.startsWith('javascript:'))href='';
				return '<a href="'+href+'" target="_blank" rel="noopener noreferrer">'+text+'</a>';
			};
			marked.setOptions({renderer:renderer,breaks:true,gfm:true});
			function render(){
				try{prev.innerHTML=marked.parse(inp.value);}catch(e){prev.textContent='Parse error: '+e.message;}
			}
			inp.addEventListener('input',render);
			render();
			document.getElementById('md-copy-html').addEventListener('click',function(){
				navigator.clipboard.writeText(prev.innerHTML).then(function(){stat.textContent='HTML copied!';});
			});
			document.getElementById('md-clear').addEventListener('click',function(){inp.value='';prev.innerHTML='';stat.textContent='';});
		})();
		</script>`
});

// ---------------------------------------------------------------
// 11. IMAGE RESIZER & COMPRESSOR
// ---------------------------------------------------------------
tools.push({
  file: 'tools-image-resizer.html',
  title: 'Image Resizer & Compressor',
  subtitle: 'Resize, compress, and convert images right in your browser. Supports JPG, PNG, and WebP output.',
  description: 'Free image resizer and compressor — resize, compress, and convert images to JPG, PNG, or WebP. 100% client-side.',
  keywords: 'image resizer, image compressor, resize image online, compress jpg, png to webp, image converter',
  html: `
							<div class="tool-row">
								<label class="tool-label">Drop or Select an Image</label>
								<div id="img-drop" class="image-preview-area">
									<span class="text-muted">Click or drag image here</span>
									<input type="file" id="img-file" accept="image/*" style="position:absolute;inset:0;opacity:0;cursor:pointer;">
								</div>
							</div>
							<div id="img-settings" style="display:none;">
								<div class="row tool-row">
									<div class="col-sm-3" style="margin-bottom:10px;">
										<label class="tool-label">Width</label>
										<input type="number" id="img-width" class="tool-input" min="1" max="8000">
									</div>
									<div class="col-sm-3" style="margin-bottom:10px;">
										<label class="tool-label">Height</label>
										<input type="number" id="img-height" class="tool-input" min="1" max="8000">
									</div>
									<div class="col-sm-3" style="margin-bottom:10px;">
										<label class="tool-label">Format</label>
										<select id="img-format" class="tool-select">
											<option value="image/jpeg">JPEG</option>
											<option value="image/png">PNG</option>
											<option value="image/webp">WebP</option>
										</select>
									</div>
									<div class="col-sm-3" style="margin-bottom:10px;">
										<label class="tool-label">Quality</label>
										<div style="display:flex;gap:8px;align-items:center;">
											<input type="range" id="img-quality" min="10" max="100" value="85" style="flex:1;accent-color:#e20e17;">
											<span id="img-quality-val" style="font-weight:600;">85%</span>
										</div>
									</div>
								</div>
								<div class="tool-checkbox-row">
									<label><input type="checkbox" id="img-lock" checked> Lock aspect ratio</label>
								</div>
								<div class="tool-actions">
									<button id="img-resize" class="btn btn-primary">Resize & Compress</button>
									<button id="img-download" class="btn btn-secondary" style="display:none;">Download Result</button>
								</div>
								<div class="tool-row" id="img-results" style="display:none;">
									<label class="tool-label">Result</label>
									<div style="display:flex;gap:20px;flex-wrap:wrap;">
										<div style="text-align:center;">
											<p class="text-muted" style="font-size:12px;margin-bottom:4px;">Original</p>
											<canvas id="img-canvas-orig" style="max-width:100%;max-height:200px;background:#13151a;border-radius:4px;"></canvas>
											<p id="img-orig-info" class="text-muted" style="font-size:11px;margin-top:4px;"></p>
										</div>
										<div style="text-align:center;">
											<p class="text-muted" style="font-size:12px;margin-bottom:4px;">Resized</p>
											<canvas id="img-canvas-new" style="max-width:100%;max-height:200px;background:#13151a;border-radius:4px;"></canvas>
											<p id="img-new-info" class="text-muted" style="font-size:11px;margin-top:4px;"></p>
										</div>
									</div>
								</div>
							</div>`,
  scripts: `
		<script>
		(function(){
			var fileEl=document.getElementById('img-file'),dropEl=document.getElementById('img-drop'),
				settingsEl=document.getElementById('img-settings'),widthEl=document.getElementById('img-width'),
				heightEl=document.getElementById('img-height'),lockEl=document.getElementById('img-lock'),
				fmtEl=document.getElementById('img-format'),qualEl=document.getElementById('img-quality'),
				qualValEl=document.getElementById('img-quality-val'),resizeBtn=document.getElementById('img-resize'),
				dlBtn=document.getElementById('img-download'),resultsEl=document.getElementById('img-results'),
				origCanvas=document.getElementById('img-canvas-orig'),newCanvas=document.getElementById('img-canvas-new'),
				origInfo=document.getElementById('img-orig-info'),newInfo=document.getElementById('img-new-info');
			var origImg=null,ratio=1,resultBlob=null;
			qualEl.oninput=function(){qualValEl.textContent=this.value+'%';};
			dropEl.addEventListener('dragover',function(e){e.preventDefault();this.classList.add('dragging');});
			dropEl.addEventListener('dragleave',function(){this.classList.remove('dragging');});
			dropEl.addEventListener('drop',function(e){e.preventDefault();this.classList.remove('dragging');if(e.dataTransfer.files[0])loadFile(e.dataTransfer.files[0]);});
			fileEl.addEventListener('change',function(){if(this.files[0])loadFile(this.files[0]);});
			function loadFile(file){
				if(!file.type.startsWith('image/')){alert('Please select an image file.');return;}
				var reader=new FileReader();
				reader.onload=function(e){
					origImg=new Image();origImg.onload=function(){
						widthEl.value=origImg.width;heightEl.value=origImg.height;ratio=origImg.width/origImg.height;
						settingsEl.style.display='block';dlBtn.style.display='none';resultsEl.style.display='none';
						var oc=origCanvas.getContext('2d');origCanvas.width=origImg.width;origCanvas.height=origImg.height;
						oc.drawImage(origImg,0,0);
						origInfo.textContent=origImg.width+'×'+origImg.height+' | '+(file.size/1024).toFixed(1)+' KB';
						dropEl.querySelector('span').textContent=file.name;
					};origImg.src=e.target.result;
				};reader.readAsDataURL(file);
			}
			widthEl.addEventListener('input',function(){if(lockEl.checked&&origImg)heightEl.value=Math.round(this.value/ratio);});
			heightEl.addEventListener('input',function(){if(lockEl.checked&&origImg)widthEl.value=Math.round(this.value*ratio);});
			resizeBtn.addEventListener('click',function(){
				if(!origImg)return;
				var w=parseInt(widthEl.value,10)||origImg.width,h=parseInt(heightEl.value,10)||origImg.height;
				newCanvas.width=w;newCanvas.height=h;
				var ctx=newCanvas.getContext('2d');ctx.drawImage(origImg,0,0,w,h);
				var fmt=fmtEl.value,q=parseInt(qualEl.value,10)/100;
				newCanvas.toBlob(function(blob){
					resultBlob=blob;
					newInfo.textContent=w+'×'+h+' | '+(blob.size/1024).toFixed(1)+' KB';
					resultsEl.style.display='block';dlBtn.style.display='inline-block';
				},fmt,q);
			});
			dlBtn.addEventListener('click',function(){
				if(!resultBlob)return;
				var ext=fmtEl.value.split('/')[1];
				var a=document.createElement('a');a.download='resized.'+ext;a.href=URL.createObjectURL(resultBlob);a.click();
			});
		})();
		</script>`
});

// ---------------------------------------------------------------
// 12. CSV TO JSON CONVERTER
// ---------------------------------------------------------------
tools.push({
  file: 'tools-csv-json.html',
  title: 'CSV ↔ JSON Converter',
  subtitle: 'Convert CSV data to JSON and JSON arrays back to CSV. Handle any delimiter.',
  description: 'Free CSV to JSON converter — paste CSV and get JSON output, or convert JSON arrays to CSV. Handles custom delimiters.',
  keywords: 'csv to json, json to csv, csv converter, convert csv json, data converter',
  html: `
							<div class="tool-row">
								<label class="tool-label" for="csv-input">Input (CSV or JSON)</label>
								<textarea id="csv-input" class="tool-input" rows="8" placeholder='name,age,city\nAlice,30,NYC\nBob,25,LA'></textarea>
							</div>
							<div class="row tool-row">
								<div class="col-sm-4" style="margin-bottom:10px;">
									<label class="tool-label">Delimiter</label>
									<select id="csv-delim" class="tool-select">
										<option value="," selected>Comma (,)</option>
										<option value="\\t">Tab</option>
										<option value=";">Semicolon (;)</option>
										<option value="|">Pipe (|)</option>
									</select>
								</div>
								<div class="col-sm-4" style="margin-bottom:10px;">
									<label class="tool-label">First Row is Header</label>
									<label style="display:flex;align-items:center;gap:6px;padding-top:4px;"><input type="checkbox" id="csv-header" checked style="accent-color:#e20e17;width:16px;height:16px;"> Yes</label>
								</div>
							</div>
							<div class="tool-actions">
								<button id="csv-to-json" class="btn btn-primary">CSV → JSON</button>
								<button id="json-to-csv" class="btn btn-primary">JSON → CSV</button>
								<button id="csv-copy" class="btn btn-secondary">Copy Output</button>
							</div>
							<div class="tool-row">
								<label class="tool-label">Output</label>
								<div id="csv-output" class="tool-output" style="min-height:150px;"></div>
							</div>
							<p id="csv-status" class="tool-status text-muted"></p>`,
  scripts: `
		<script>
		(function(){
			var inp=document.getElementById('csv-input'),outEl=document.getElementById('csv-output'),
				stat=document.getElementById('csv-status'),delimEl=document.getElementById('csv-delim'),headerEl=document.getElementById('csv-header');
			document.getElementById('csv-to-json').addEventListener('click',function(){
				try{
					var delim=delimEl.value==='\\\\t'?'\\t':delimEl.value;
					var lines=inp.value.trim().split('\\n').map(function(l){return l.split(delim);});
					if(!lines.length){stat.textContent='No data.';return;}
					var result;
					if(headerEl.checked&&lines.length>1){
						var headers=lines[0].map(function(h){return h.trim();});
						result=lines.slice(1).map(function(row){
							var obj={};headers.forEach(function(h,i){obj[h]=row[i]?row[i].trim():'';});return obj;
						});
					}else{result=lines;}
					outEl.textContent=JSON.stringify(result,null,2);
					stat.textContent='Converted '+result.length+' rows to JSON.';stat.style.color='#4caf50';
				}catch(e){stat.textContent='Error: '+e.message;stat.style.color='#f44336';}
			});
			document.getElementById('json-to-csv').addEventListener('click',function(){
				try{
					var data=JSON.parse(inp.value);
					if(!Array.isArray(data)){stat.textContent='JSON must be an array of objects.';stat.style.color='#f44336';return;}
					var delim=delimEl.value==='\\\\t'?'\\t':delimEl.value;
					var keys=Object.keys(data[0]||{});
					var csv=keys.join(delim)+'\\n'+data.map(function(row){return keys.map(function(k){
						var v=String(row[k]||'');return v.indexOf(delim)>=0||v.indexOf('"')>=0?'"'+v.replace(/"/g,'""')+'"':v;
					}).join(delim);}).join('\\n');
					outEl.textContent=csv;stat.textContent='Converted '+data.length+' objects to CSV.';stat.style.color='#4caf50';
				}catch(e){stat.textContent='Error: '+e.message;stat.style.color='#f44336';}
			});
			document.getElementById('csv-copy').addEventListener('click',function(){navigator.clipboard.writeText(outEl.textContent);stat.textContent='Copied!';stat.style.color='#4caf50';});
		})();
		</script>`
});

// ---------------------------------------------------------------
// 13. DIFF CHECKER / TEXT COMPARE
// ---------------------------------------------------------------
tools.push({
  file: 'tools-diff-checker.html',
  title: 'Diff Checker — Text Compare',
  subtitle: 'Compare two blocks of text and see differences highlighted line by line.',
  description: 'Free diff checker — compare two texts side-by-side with highlighted additions and deletions.',
  keywords: 'diff checker, text compare, text diff, compare text online, find differences',
  html: `
							<div class="row">
								<div class="col-md-6 tool-row">
									<label class="tool-label" for="diff-a">Original Text</label>
									<textarea id="diff-a" class="tool-input" rows="10" placeholder="Paste original text..."></textarea>
								</div>
								<div class="col-md-6 tool-row">
									<label class="tool-label" for="diff-b">Changed Text</label>
									<textarea id="diff-b" class="tool-input" rows="10" placeholder="Paste modified text..."></textarea>
								</div>
							</div>
							<div class="tool-actions">
								<button id="diff-compare" class="btn btn-primary">Compare</button>
								<button id="diff-clear" class="btn btn-secondary">Clear All</button>
								<button id="diff-swap" class="btn btn-secondary">↔ Swap</button>
							</div>
							<div class="tool-row">
								<label class="tool-label">Diff Output</label>
								<div id="diff-output" style="padding:12px;background:#13151a;border:1px solid #3c3d42;border-radius:4px;min-height:150px;overflow:auto;font-family:monospace;font-size:13px;line-height:1.6;"></div>
							</div>
							<p id="diff-status" class="tool-status text-muted"></p>`,
  scripts: `
		<script>
		(function(){
			var aEl=document.getElementById('diff-a'),bEl=document.getElementById('diff-b'),
				outEl=document.getElementById('diff-output'),stat=document.getElementById('diff-status');
			document.getElementById('diff-compare').addEventListener('click',function(){
				var a=aEl.value.split('\\n'),b=bEl.value.split('\\n'),html='',adds=0,dels=0,same=0;
				var maxLen=Math.max(a.length,b.length);
				for(var i=0;i<maxLen;i++){
					var la=i<a.length?a[i]:'',lb=i<b.length?b[i]:'';
					var num=(i+1)+' ';
					if(la===lb){html+='<div class="diff-line" style="color:#888;">'+num+escHtml(la)+'</div>';same++;}
					else{
						if(i<a.length){html+='<div class="diff-line diff-remove">- '+num+escHtml(la)+'</div>';dels++;}
						if(i<b.length){html+='<div class="diff-line diff-add">+ '+num+escHtml(lb)+'</div>';adds++;}
					}
				}
				outEl.innerHTML=html||'<span class="text-muted">Texts are identical.</span>';
				stat.textContent=adds+' addition(s), '+dels+' deletion(s), '+same+' unchanged line(s).';
			});
			function escHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
			document.getElementById('diff-clear').addEventListener('click',function(){aEl.value='';bEl.value='';outEl.innerHTML='';stat.textContent='';});
			document.getElementById('diff-swap').addEventListener('click',function(){var t=aEl.value;aEl.value=bEl.value;bEl.value=t;});
		})();
		</script>`
});

// ---------------------------------------------------------------
// 14. UUID GENERATOR
// ---------------------------------------------------------------
tools.push({
  file: 'tools-uuid-generator.html',
  title: 'UUID Generator',
  subtitle: 'Generate universally unique identifiers (UUID v4) for databases, APIs, and dev workflows.',
  description: 'Free UUID v4 generator — bulk generate cryptographically random UUIDs. Copy individual or batch.',
  keywords: 'uuid generator, guid generator, uuid v4, random uuid, unique id generator',
  html: `
							<div class="row tool-row">
								<div class="col-sm-4" style="margin-bottom:10px;">
									<label class="tool-label">How Many?</label>
									<select id="uuid-count" class="tool-select">
										<option value="1" selected>1</option>
										<option value="5">5</option>
										<option value="10">10</option>
										<option value="25">25</option>
										<option value="50">50</option>
										<option value="100">100</option>
									</select>
								</div>
								<div class="col-sm-4" style="margin-bottom:10px;">
									<label class="tool-label">Format</label>
									<select id="uuid-format" class="tool-select">
										<option value="lower" selected>lowercase</option>
										<option value="upper">UPPERCASE</option>
										<option value="braces">{braces}</option>
										<option value="no-dash">No dashes</option>
									</select>
								</div>
							</div>
							<div class="tool-actions">
								<button id="uuid-generate" class="btn btn-primary">Generate UUIDs</button>
								<button id="uuid-copy" class="btn btn-secondary">Copy All</button>
							</div>
							<div class="tool-row">
								<label class="tool-label">Generated UUIDs</label>
								<div id="uuid-output" class="tool-output" style="min-height:50px;"></div>
							</div>
							<p id="uuid-status" class="tool-status text-muted"></p>`,
  scripts: `
		<script>
		(function(){
			var countEl=document.getElementById('uuid-count'),fmtEl=document.getElementById('uuid-format'),
				outEl=document.getElementById('uuid-output'),stat=document.getElementById('uuid-status');
			function uuid4(){
				var a=new Uint8Array(16);crypto.getRandomValues(a);
				a[6]=(a[6]&0x0f)|0x40;a[8]=(a[8]&0x3f)|0x80;
				var h=Array.from(a).map(function(b){return b.toString(16).padStart(2,'0');}).join('');
				return h.substr(0,8)+'-'+h.substr(8,4)+'-'+h.substr(12,4)+'-'+h.substr(16,4)+'-'+h.substr(20,12);
			}
			function generate(){
				var n=parseInt(countEl.value,10),uuids=[];
				for(var i=0;i<n;i++){
					var u=uuid4(),f=fmtEl.value;
					if(f==='upper')u=u.toUpperCase();
					else if(f==='braces')u='{'+u+'}';
					else if(f==='no-dash')u=u.replace(/-/g,'');
					uuids.push(u);
				}
				outEl.textContent=uuids.join('\\n');
				stat.textContent=n+' UUID(s) generated.';
			}
			document.getElementById('uuid-generate').addEventListener('click',generate);
			document.getElementById('uuid-copy').addEventListener('click',function(){
				navigator.clipboard.writeText(outEl.textContent).then(function(){stat.textContent='Copied!';});
			});
			generate();
		})();
		</script>`
});

// ---------------------------------------------------------------
// 15. TIMESTAMP / DATE CONVERTER
// ---------------------------------------------------------------
tools.push({
  file: 'tools-timestamp.html',
  title: 'Unix Timestamp Converter',
  subtitle: 'Convert between Unix timestamps and human-readable dates. Get the current timestamp live.',
  description: 'Free Unix timestamp converter — convert epoch timestamps to dates and vice versa. Live current timestamp.',
  keywords: 'unix timestamp converter, epoch converter, timestamp to date, date to timestamp, epoch time',
  html: `
							<div class="tool-row" style="text-align:center;padding:20px;background:#1e2024;border-radius:6px;margin-bottom:20px;">
								<div style="font-size:13px;text-transform:uppercase;color:#888;margin-bottom:4px;">Current Unix Timestamp</div>
								<div id="ts-live" style="font-size:36px;font-weight:700;color:#e20e17;font-family:monospace;cursor:pointer;" title="Click to copy"></div>
								<div id="ts-live-date" style="font-size:14px;color:#aaa;margin-top:4px;"></div>
							</div>
							<div class="row">
								<div class="col-md-6 tool-row">
									<label class="tool-label">Timestamp → Date</label>
									<input type="text" id="ts-input" class="tool-input" placeholder="e.g. 1712793600">
									<button id="ts-to-date" class="btn btn-primary btn-xs" style="margin-top:8px;">Convert to Date</button>
									<div id="ts-date-result" class="tool-output" style="margin-top:8px;min-height:auto;padding:10px;display:none;"></div>
								</div>
								<div class="col-md-6 tool-row">
									<label class="tool-label">Date → Timestamp</label>
									<input type="datetime-local" id="ts-date-input" class="tool-input">
									<button id="ts-to-stamp" class="btn btn-primary btn-xs" style="margin-top:8px;">Convert to Timestamp</button>
									<div id="ts-stamp-result" class="tool-output" style="margin-top:8px;min-height:auto;padding:10px;display:none;"></div>
								</div>
							</div>
							<p id="ts-status" class="tool-status text-muted">Click any result to copy.</p>`,
  scripts: `
		<script>
		(function(){
			var liveEl=document.getElementById('ts-live'),liveDateEl=document.getElementById('ts-live-date'),
				tsIn=document.getElementById('ts-input'),dateIn=document.getElementById('ts-date-input'),
				dateRes=document.getElementById('ts-date-result'),stampRes=document.getElementById('ts-stamp-result'),
				stat=document.getElementById('ts-status');
			function tick(){
				var now=Math.floor(Date.now()/1000);
				liveEl.textContent=now;
				liveDateEl.textContent=new Date(now*1000).toUTCString();
			}
			setInterval(tick,1000);tick();
			liveEl.addEventListener('click',function(){navigator.clipboard.writeText(this.textContent);stat.textContent='Timestamp copied!';});
			document.getElementById('ts-to-date').addEventListener('click',function(){
				var ts=parseInt(tsIn.value.trim(),10);
				if(isNaN(ts)){stat.textContent='Enter a valid timestamp.';return;}
				if(ts<1e11)ts*=1000; // auto-detect seconds vs ms
				var d=new Date(ts);
				dateRes.style.display='block';
				dateRes.innerHTML='<strong>UTC:</strong> '+d.toUTCString()+'<br><strong>Local:</strong> '+d.toLocaleString()+'<br><strong>ISO:</strong> '+d.toISOString();
			});
			document.getElementById('ts-to-stamp').addEventListener('click',function(){
				var d=new Date(dateIn.value);
				if(isNaN(d.getTime())){stat.textContent='Pick a valid date.';return;}
				var ts=Math.floor(d.getTime()/1000);
				stampRes.style.display='block';
				stampRes.innerHTML='<strong>Seconds:</strong> '+ts+'<br><strong>Milliseconds:</strong> '+d.getTime();
			});
			[dateRes,stampRes].forEach(function(el){el.addEventListener('click',function(){navigator.clipboard.writeText(this.textContent);stat.textContent='Copied!';});});
			// Pre-fill date input with now
			var now=new Date();dateIn.value=now.toISOString().slice(0,16);
		})();
		</script>`
});

// ---------------------------------------------------------------
// 16. NUMBER BASE CONVERTER
// ---------------------------------------------------------------
tools.push({
  file: 'tools-number-base.html',
  title: 'Number Base Converter',
  subtitle: 'Convert between Binary, Octal, Decimal, and Hexadecimal number systems.',
  description: 'Free number base converter — convert between binary, octal, decimal, and hexadecimal instantly.',
  keywords: 'number base converter, binary to decimal, hex converter, octal converter, binary calculator',
  html: `
							<div class="tool-row">
								<label class="tool-label">Input Number</label>
								<input type="text" id="nb-input" class="tool-input" placeholder="Enter a number..." value="255" style="font-size:20px;font-weight:700;">
							</div>
							<div class="tool-row">
								<label class="tool-label">Input Base</label>
								<div class="tool-actions">
									<button class="btn btn-primary btn-xs nb-base" data-base="2">Binary (2)</button>
									<button class="btn btn-primary btn-xs nb-base" data-base="8">Octal (8)</button>
									<button class="btn btn-primary btn-xs nb-base active" data-base="10" style="background:#fff;color:#000;">Decimal (10)</button>
									<button class="btn btn-primary btn-xs nb-base" data-base="16">Hex (16)</button>
								</div>
							</div>
							<div class="row tool-row" style="text-align:center;">
								<div class="col-sm-3" style="margin-bottom:10px;">
									<div style="padding:12px;background:#1e2024;border-radius:6px;">
										<div style="font-size:11px;text-transform:uppercase;color:#888;margin-bottom:4px;">Binary</div>
										<div id="nb-bin" style="font-size:16px;font-weight:700;color:#8f8;font-family:monospace;word-break:break-all;cursor:pointer;min-height:24px;"></div>
									</div>
								</div>
								<div class="col-sm-3" style="margin-bottom:10px;">
									<div style="padding:12px;background:#1e2024;border-radius:6px;">
										<div style="font-size:11px;text-transform:uppercase;color:#888;margin-bottom:4px;">Octal</div>
										<div id="nb-oct" style="font-size:16px;font-weight:700;color:#8f8;font-family:monospace;cursor:pointer;min-height:24px;"></div>
									</div>
								</div>
								<div class="col-sm-3" style="margin-bottom:10px;">
									<div style="padding:12px;background:#1e2024;border-radius:6px;">
										<div style="font-size:11px;text-transform:uppercase;color:#888;margin-bottom:4px;">Decimal</div>
										<div id="nb-dec" style="font-size:16px;font-weight:700;color:#8f8;font-family:monospace;cursor:pointer;min-height:24px;"></div>
									</div>
								</div>
								<div class="col-sm-3" style="margin-bottom:10px;">
									<div style="padding:12px;background:#1e2024;border-radius:6px;">
										<div style="font-size:11px;text-transform:uppercase;color:#888;margin-bottom:4px;">Hexadecimal</div>
										<div id="nb-hex" style="font-size:16px;font-weight:700;color:#8f8;font-family:monospace;cursor:pointer;min-height:24px;"></div>
									</div>
								</div>
							</div>
							<p id="nb-status" class="tool-status text-muted">Click any result to copy.</p>`,
  scripts: `
		<script>
		(function(){
			var inp=document.getElementById('nb-input'),stat=document.getElementById('nb-status'),
				outEls={bin:document.getElementById('nb-bin'),oct:document.getElementById('nb-oct'),dec:document.getElementById('nb-dec'),hex:document.getElementById('nb-hex')};
			var currentBase=10;
			var baseBtns=document.querySelectorAll('.nb-base');
			baseBtns.forEach(function(b){
				b.addEventListener('click',function(){
					currentBase=parseInt(this.dataset.base,10);
					baseBtns.forEach(function(x){x.style.background='';x.style.color='';});
					this.style.background='#fff';this.style.color='#000';
					convert();
				});
			});
			function convert(){
				var val=inp.value.trim();if(!val){for(var k in outEls)outEls[k].textContent='';return;}
				try{
					var num=parseInt(val,currentBase);
					if(isNaN(num)){stat.textContent='Invalid number for base '+currentBase;return;}
					outEls.bin.textContent=num.toString(2);outEls.oct.textContent=num.toString(8);
					outEls.dec.textContent=num.toString(10);outEls.hex.textContent=num.toString(16).toUpperCase();
					stat.textContent='Click any result to copy.';
				}catch(e){stat.textContent='Error: '+e.message;}
			}
			inp.addEventListener('input',convert);
			for(var k in outEls)(function(el){
				el.addEventListener('click',function(){if(this.textContent)navigator.clipboard.writeText(this.textContent).then(function(){stat.textContent='Copied!';});});
			})(outEls[k]);
			convert();
		})();
		</script>`
});

// ---------------------------------------------------------------
// 17. UNIT CONVERTER
// ---------------------------------------------------------------
tools.push({
  file: 'tools-unit-converter.html',
  title: 'Unit Converter',
  subtitle: 'Convert between common units of length, weight, temperature, speed, area, and volume.',
  description: 'Free unit converter — convert length, weight, temperature, speed, area, and volume units instantly.',
  keywords: 'unit converter, length converter, weight converter, temperature converter, metric imperial converter',
  html: `
							<div class="row tool-row">
								<div class="col-sm-4" style="margin-bottom:10px;">
									<label class="tool-label">Category</label>
									<select id="uc-cat" class="tool-select"></select>
								</div>
								<div class="col-sm-4" style="margin-bottom:10px;">
									<label class="tool-label">From</label>
									<select id="uc-from" class="tool-select"></select>
								</div>
								<div class="col-sm-4" style="margin-bottom:10px;">
									<label class="tool-label">To</label>
									<select id="uc-to" class="tool-select"></select>
								</div>
							</div>
							<div class="row tool-row">
								<div class="col-sm-5">
									<label class="tool-label">Input Value</label>
									<input type="number" id="uc-input" class="tool-input" value="1" style="font-size:20px;font-weight:700;">
								</div>
								<div class="col-sm-2" style="display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px;">
									<button id="uc-swap" class="btn btn-secondary btn-xs">↔ Swap</button>
								</div>
								<div class="col-sm-5">
									<label class="tool-label">Result</label>
									<div id="uc-result" class="tool-output" style="font-size:20px;font-weight:700;min-height:auto;padding:12px;text-align:center;cursor:pointer;" title="Click to copy"></div>
								</div>
							</div>
							<p id="uc-status" class="tool-status text-muted">Click result to copy.</p>`,
  scripts: `
		<script>
		(function(){
			var cats={
				'Length':{m:1,km:1000,cm:0.01,mm:0.001,mi:1609.344,yd:0.9144,ft:0.3048,'in':0.0254,nm:1852},
				'Weight':{kg:1,g:0.001,mg:0.000001,lb:0.453592,oz:0.0283495,st:6.35029,t:1000},
				'Temperature':null,
				'Speed':{'m/s':1,'km/h':0.277778,'mph':0.44704,knots:0.514444,'ft/s':0.3048},
				'Area':{'m²':1,'km²':1e6,'cm²':1e-4,hectare:1e4,acre:4046.86,'ft²':0.092903,'mi²':2.59e6},
				'Volume':{L:1,mL:0.001,gal:3.78541,qt:0.946353,pt:0.473176,cup:0.236588,'fl oz':0.0295735,'m³':1000}
			};
			var catEl=document.getElementById('uc-cat'),fromEl=document.getElementById('uc-from'),
				toEl=document.getElementById('uc-to'),inpEl=document.getElementById('uc-input'),
				resEl=document.getElementById('uc-result'),stat=document.getElementById('uc-status');
			Object.keys(cats).forEach(function(c){var o=document.createElement('option');o.value=c;o.textContent=c;catEl.appendChild(o);});
			function populateUnits(){
				var c=catEl.value,units=c==='Temperature'?['Celsius','Fahrenheit','Kelvin']:Object.keys(cats[c]);
				fromEl.innerHTML='';toEl.innerHTML='';
				units.forEach(function(u,i){
					var o1=document.createElement('option');o1.value=u;o1.textContent=u;fromEl.appendChild(o1);
					var o2=document.createElement('option');o2.value=u;o2.textContent=u;toEl.appendChild(o2);
					if(i===1)o2.selected=true;
				});
				convert();
			}
			function convert(){
				var v=parseFloat(inpEl.value),c=catEl.value,f=fromEl.value,t=toEl.value;
				if(isNaN(v)){resEl.textContent='—';return;}
				var result;
				if(c==='Temperature'){
					var celsius;
					if(f==='Celsius')celsius=v;else if(f==='Fahrenheit')celsius=(v-32)*5/9;else celsius=v-273.15;
					if(t==='Celsius')result=celsius;else if(t==='Fahrenheit')result=celsius*9/5+32;else result=celsius+273.15;
				}else{
					var base=v*cats[c][f];result=base/cats[c][t];
				}
				resEl.textContent=parseFloat(result.toPrecision(10));
			}
			catEl.addEventListener('change',populateUnits);
			[fromEl,toEl,inpEl].forEach(function(e){e.addEventListener('input',convert);e.addEventListener('change',convert);});
			document.getElementById('uc-swap').addEventListener('click',function(){var t=fromEl.value;fromEl.value=toEl.value;toEl.value=t;convert();});
			resEl.addEventListener('click',function(){navigator.clipboard.writeText(this.textContent).then(function(){stat.textContent='Copied!';});});
			populateUnits();
		})();
		</script>`
});

// ===================================================================
// GENERATE ALL FILES
// ===================================================================
let count = 0;
for (const tool of tools) {
  const html = buildToolPage(tool);
  const outPath = path.join(BUILD, tool.file);
  fs.writeFileSync(outPath, html, 'utf8');
  count++;
  console.log(`  ✓ ${tool.file}`);
}
console.log(`\nGenerated ${count} tool pages.`);
