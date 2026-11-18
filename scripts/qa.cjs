// QA for the static site: horizontal overflow, console errors, broken images, axe (WCAG 2.2 AA),
// at phone and desktop widths, in light and dark. Screenshots go to qa-shots/ (git-ignored).
// Usage: npm run qa            (starts its own static server on port 8799)
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8799;
const PAGES = ['index.html', 'studio.html', 'price-list.html', 'models/p9.html', 'models/ga30-2630.html'];
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.webm': 'video/webm' };

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(ROOT, url.endsWith('/') ? url + 'index.html' : url);
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(PORT, r));
  const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
  const outDir = path.join(ROOT, 'qa-shots'); fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  let failures = 0;
  for (const page of PAGES) {
    for (const [w, h] of [[390, 844], [1280, 900]]) {
      for (const scheme of ['light', 'dark']) {
        const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, reducedMotion: 'reduce' });
        const p = await ctx.newPage();
        const errors = [];
        p.on('pageerror', e => errors.push('pageerror: ' + e.message));
        p.on('console', m => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) errors.push('console: ' + m.text()); });
        p.on('requestfailed', r => { if (!/fonts\.g/.test(r.url())) errors.push('failed: ' + r.url()); });
        p.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()}: ${r.url()}`); });
        await p.goto(`http://localhost:${PORT}/${page}`, { waitUntil: 'networkidle' });
        // load every lazy image so broken ones are caught
        await p.evaluate(async () => { for (const im of document.images) im.loading = 'eager'; await new Promise(r => setTimeout(r, 400)); });
        const broken = await p.evaluate(() => [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute('src')));
        const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        await p.addScriptTag({ content: axeSrc });
        const axe = await p.evaluate(async () => {
          const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } });
          return r.violations.map(v => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes.slice(0, 2).map(n => n.target.join(' ')).join(' | ')}`);
        });
        const tag = `${page} ${w}px ${scheme}`;
        const problems = [...errors, ...broken.map(b => 'broken image: ' + b), ...(overflow > 0 ? [`horizontal overflow ${overflow}px`] : []), ...axe.map(a => 'axe: ' + a)];
        if (problems.length) { failures += problems.length; console.log(`✗ ${tag}\n   ` + problems.join('\n   ')); }
        else console.log(`✓ ${tag}`);
        if (scheme === 'light' || w === 390) await p.screenshot({ path: path.join(outDir, `${page.replace(/\W+/g, '_')}-${w}-${scheme}.png`), fullPage: true });
        await ctx.close();
      }
    }
  }
  await browser.close(); server.close();
  console.log(failures ? `\n${failures} problem(s)` : '\nall checks passed');
  process.exit(failures ? 1 : 0);
})();
