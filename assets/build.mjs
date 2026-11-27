/**
 * Build the README banner, the GitHub social preview and the README screenshots.
 *
 * Usage (from the repo root):
 *
 *     npm install
 *     npm run build:assets
 *
 * Writes:
 *   assets/banner.png          2560 x 800, shown at the top of the README
 *   assets/social-preview.png  1280 x 640, upload it in Settings > Social preview
 *   assets/screenshots/*.webp  light, dark and phone views of the live map
 *
 * The maps in the banner and preview are screenshots of index.html itself.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium, devices } from 'playwright';
import { serve, ROOT } from '../scripts/serve.mjs';

const OUT = join(ROOT, 'assets');

const FONT = `-apple-system, "Segoe UI", system-ui, Inter, sans-serif`;

const SHARED_CSS = `
html, body { margin: 0; padding: 0; }
body { font-family: ${FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.eyebrow { letter-spacing: 3.5px; text-transform: uppercase; font-weight: 700; margin: 0 0 16px; }
.title { font-weight: 800; letter-spacing: -2px; line-height: .95; margin: 0; }
.sub { margin: 18px 0 0; line-height: 1.4; }
.chips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 22px; }
.chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 11px; border-radius: 999px; font-size: 13px; font-weight: 600; }
.chip i { width: 10px; height: 10px; border-radius: 50%; display: block; }
.map { display: block; width: 100%; border-radius: 16px; }
`;

/* Layer colours, taken from the top of each layer's own colour scale */
const CHIPS = [
  ['Population', '#2171b5'], ['GDP', '#238b45'], ['HDI', '#1a9850'],
  ['CO₂', '#2c7fb8'], ['Life exp.', '#c51b8a'], ['Internet', '#d95f0e'],
];
const chips = (bg, border, text) => `<div class="chips">${CHIPS.map(([n, c]) =>
  `<span class="chip" style="background:${bg};border:1px solid ${border};color:${text}"><i style="background:${c}"></i>${n}</span>`).join('')}</div>`;

/* Re-encode a PNG as WebP inside the browser: much smaller, no extra dependency */
async function toWebp(page, png) {
  const b64 = await page.evaluate(async src => {
    const img = new Image();
    img.src = `data:image/png;base64,${src}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/webp', 0.9).split(',')[1];
  }, png.toString('base64'));
  return Buffer.from(b64, 'base64');
}

async function main() {
  const { server, base } = await serve();
  const browser = await chromium.launch();
  await mkdir(join(OUT, 'screenshots'), { recursive: true });

  /** Open the real map, optionally pick a theme and layer, and return a page */
  async function mapPage({ query = '', theme, layer, viewport = { width: 1440, height: 900 }, scale = 2, device }) {
    const ctx = await browser.newContext(device ? { ...device } : { viewport, deviceScaleFactor: scale });
    const p = await ctx.newPage();
    await p.goto(`${base}/index.html${query}`);
    await p.waitForSelector('#wm .land');
    if (theme) await p.click(`#tb-${theme}`);
    if (layer) await p.click(`.p[data-mode="${layer}"]`);
    await p.waitForTimeout(1200);
    return { p, ctx };
  }

  /* 1. Map pictures for the banner (light, HDI) and preview (dark, GDP per capita) */
  const hideChrome = p => p.addStyleTag({ content: '#mm, .dbl-hint { display: none !important; }' });
  const light = await mapPage({ theme: 'light', layer: 'hdi' });
  await hideChrome(light.p);
  const lightMap = (await light.p.locator('#wm').screenshot()).toString('base64');
  await light.ctx.close();
  const dark = await mapPage({ theme: 'dark', layer: 'gdppc' });
  await hideChrome(dark.p);
  const darkMap = (await dark.p.locator('#wm').screenshot()).toString('base64');
  await dark.ctx.close();

  async function render(viewport, scale, html, file) {
    const p = await browser.newPage({ viewport, deviceScaleFactor: scale });
    await p.setContent(html);
    await p.waitForTimeout(200);
    await p.screenshot({ path: join(OUT, file) });
    await p.close();
  }

  /* 2. Banner */
  await render({ width: 1280, height: 400 }, 2, `<!doctype html><html><head><meta charset="utf-8"><style>${SHARED_CSS}
    body { background: #f0f2f5; }
    .banner { width: 1280px; height: 400px; box-sizing: border-box; padding: 0 48px 0 64px;
      display: grid; grid-template-columns: 1fr 600px; gap: 32px; align-items: center; }
    .eyebrow { font-size: 13px; color: #3a7ca5; }
    .title { font-size: 84px; color: #111827; }
    .sub { font-size: 19px; color: #5c6370; }
    .map { box-shadow: 0 18px 44px rgba(20,40,70,.16), 0 0 0 1px rgba(0,0,0,.06); }
  </style></head><body><div class="banner">
    <div>
      <p class="eyebrow mono">Interactive · 172 countries · one HTML file</p>
      <h1 class="title">World Map</h1>
      <p class="sub">Six data layers, region and group filters, your own data and an embed API.</p>
      ${chips('#fff', 'rgba(0,0,0,.08)', '#253342')}
    </div>
    <img class="map" src="data:image/png;base64,${lightMap}" alt="">
  </div></body></html>`, 'banner.png');

  /* 3. Social preview */
  await render({ width: 1280, height: 640 }, 1, `<!doctype html><html><head><meta charset="utf-8"><style>${SHARED_CSS}
    body { background: #0d1b2a; }
    .preview { width: 1280px; height: 640px; box-sizing: border-box; padding: 56px 64px 0;
      display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto 1fr; column-gap: 40px; }
    .eyebrow { font-size: 15px; color: #6fb1d8; }
    .title { font-size: 96px; color: #f1f5f9; }
    .sub { font-size: 23px; color: #9fb0c3; }
    .side { align-self: end; padding-bottom: 8px; }
    .foot { font-size: 15px; color: #7d8ea3; letter-spacing: 1px; text-align: right; line-height: 1.6; }
    .mapwrap { grid-column: 1 / -1; margin-top: 30px; }
    .map { border-radius: 18px 18px 0 0; }
  </style></head><body><div class="preview">
    <div>
      <p class="eyebrow mono">Interactive · 172 countries</p>
      <h1 class="title">World Map</h1>
    </div>
    <div class="side">
      <p class="sub">Six data layers, filters, your own data and an embed API. One HTML file.</p>
      <p class="foot mono">github.com/ShazMoghaddam/world-map<br>Shaz Moghaddam · London</p>
    </div>
    <div class="mapwrap"><img class="map" src="data:image/png;base64,${darkMap}" alt=""></div>
  </div></body></html>`, 'social-preview.png');

  /* 4. README screenshots of the live map */
  const shots = [
    { name: 'desktop-light', query: '?c=BRA', theme: 'light', layer: 'hdi', scale: 1 },
    { name: 'desktop-dark', theme: 'dark', layer: 'co2', scale: 1 },
    { name: 'phone-light', query: '?c=JPN', theme: 'light', layer: 'lifeexp', device: devices['iPhone 13'] },
  ];
  for (const s of shots) {
    const { p, ctx } = await mapPage(s);
    const png = await p.screenshot({ fullPage: Boolean(s.device) });
    await writeFile(join(OUT, 'screenshots', `${s.name}.webp`), await toWebp(p, png));
    await ctx.close();
  }

  await browser.close();
  server.close();
  console.log('wrote assets/banner.png, assets/social-preview.png and assets/screenshots/');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
