/**
 * Smoke tests: open the real map in headless Chromium and check it works.
 *
 *     npm test
 *
 * Runs in CI on every push and pull request.
 */

import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import { writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, devices } from 'playwright';
import { serve } from '../scripts/serve.mjs';

let browser, server, base;

before(async () => {
  ({ server, base } = await serve());
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  server?.close();
});

async function open(query = '', options = {}) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`${base}/index.html${query}`);
  await page.waitForSelector('#wm .land');
  await page.waitForTimeout(800);            // let the colour fade finish
  return { page, errors, context };
}

/** Count country fills on the main map, so we can spot black or missing colours */
const fills = page => page.evaluate(() => {
  const out = { black: 0, coloured: 0 };
  document.querySelectorAll('#wm .land').forEach(p => {
    const f = getComputedStyle(p).fill;
    if (f === 'rgb(0, 0, 0)') out.black++;
    else if (p.style.fill) out.coloured++;
  });
  return out;
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`renders cleanly at ${width}px`, async () => {
    const { page, errors, context } = await open('', { viewport: { width, height: 900 } });
    const r = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      countries: document.querySelectorAll('#wm .land[data-iso]').length,
      mapHeight: document.getElementById('mo').getBoundingClientRect().height,
    }));
    assert.deepEqual(errors, [], 'no JavaScript errors');
    assert.ok(r.overflow <= 0, `no sideways scrolling (page is ${r.overflow}px too wide)`);
    assert.ok(r.countries >= 170, `countries drawn (${r.countries})`);
    assert.ok(r.mapHeight >= 280 || width > 720, `map is tall enough on phones (${r.mapHeight}px)`);
    await context.close();
  });
}

for (const mode of ['density', 'gdppc', 'hdi', 'co2', 'lifeexp', 'internet']) {
  test(`the ${mode} layer colours the map (never black)`, async () => {
    const { page, context } = await open();
    await page.click(`.p[data-mode="${mode}"]`);
    await page.waitForTimeout(800);
    const f = await fills(page);
    assert.equal(f.black, 0, 'no country painted black');
    assert.ok(f.coloured > 100, `countries coloured (${f.coloured})`);
    await context.close();
  });
}

test('a shared link opens the right country and layer', async () => {
  const { page, context } = await open('?c=BRA&layer=hdi');
  assert.equal(await page.textContent('#i-name'), 'Brazil');
  assert.equal(await page.isVisible('#legend'), true);
  assert.equal((await fills(page)).black, 0);
  // The selected country keeps its own data colour rather than the plain highlight
  const brazil = await page.$eval('#wm .land[data-iso="BRA"]', el => [getComputedStyle(el).fill, el.style.fill]);
  assert.equal(brazil[0], brazil[1]);
  await context.close();
});

test('on phones the country panel sits below the map, not over it', async () => {
  const { page, context } = await open('?c=FRA', { ...devices['iPhone 13'] });
  const r = await page.evaluate(() => ({
    mapBottom: document.getElementById('mo').getBoundingClientRect().bottom,
    infoTop: document.getElementById('info').getBoundingClientRect().top,
  }));
  assert.ok(r.infoTop >= r.mapBottom - 1, 'panel starts below the map');
  await context.close();
});

test('legend ticks sit at their true positions', async () => {
  const { page, context } = await open('?layer=hdi');
  const left = await page.$$eval('.leg-tick', ts => ts.map(t => parseFloat(t.style.left)));
  // HDI runs 0.3 to 1.0, so 0.55 is 35.7% along and 0.75 is 64.3%
  assert.deepEqual(left.map(Math.round), [0, 36, 64, 100]);
  await context.close();
});

test('only the embedding page can send commands', async () => {
  const { page, context } = await open();
  const before = await page.getAttribute('html', 'data-theme');
  await page.evaluate(() => window.postMessage({ type: 'setTheme', theme: 'dark' }, '*'));
  await page.waitForTimeout(200);
  assert.equal(await page.getAttribute('html', 'data-theme'), before);
  await context.close();
});

test('importing a CSV colours the matching countries', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wm-'));
  const file = join(dir, 'my-data.csv');
  await writeFile(file, 'ISO3,Value\nGBR,10\nFRA,20\nDEU,30\n');
  const { page, errors, context } = await open();
  await page.setInputFiles('input[type="file"]', file);
  await page.waitForTimeout(900);
  assert.equal(await page.textContent('#leg-title'), 'my-data');
  assert.equal((await fills(page)).black, 0);
  assert.deepEqual(errors, []);
  await context.close();
});
