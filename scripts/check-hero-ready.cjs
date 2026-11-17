// Regression check for the photographic hero's transition from poster to WebGL.
// Start a local server first: npm run build && npm run start -- -p 3100
// Then run: npm run qa:hero
const { chromium, devices } = require('playwright');

(async () => {
  const base = process.env.BASE_URL || 'http://localhost:3100';
  const browser = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
  });
  let failed = false;
  for (const [name, options] of [
    ['desktop', { viewport: { width: 1440, height: 900 } }],
    ['iphone', { ...devices['iPhone 15'], deviceScaleFactor: 1 }]
  ]) {
    const ctx = await browser.newContext(options);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => {
      window.__vonumoHeroEvents = [];
      for (const event of ['vonumo:hero-assets-ready', 'vonumo:loaded', 'vonumo:hero-ready']) {
        window.addEventListener(event, () => window.__vonumoHeroEvents.push(event));
      }
    });
    try {
      await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForFunction(() => window.__vonumoLoaded === true, { timeout: 60000 });
      await page.waitForFunction(() => window.__vonumoHeroReady === true, { timeout: 60000 });
      await page.waitForTimeout(1000);
      const state = await page.evaluate(() => ({
        events: window.__vonumoHeroEvents,
        posterOpacity: Number(getComputedStyle(document.querySelector('[data-hero-poster]')).opacity),
        textVisible: !!document.querySelector('h1'),
        overflow: document.documentElement.scrollWidth > innerWidth
      }));
      const ordered = ['vonumo:hero-assets-ready', 'vonumo:loaded', 'vonumo:hero-ready'];
      const correctOrder = ordered.every((event, i) => state.events.indexOf(event) !== -1 &&
        (i === 0 || state.events.indexOf(ordered[i-1]) < state.events.indexOf(event)));
      const pass = correctOrder && state.posterOpacity < 0.1 && state.textVisible && !state.overflow && errors.length === 0;
      console.log(name, pass ? 'PASS' : 'FAIL', { ...state, errors });
      if (!pass) failed = true;
    } catch (err) {
      console.error(name, 'FAIL', err.message, errors);
      failed = true;
    } finally {
      await ctx.close();
    }
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
})().catch((err) => { console.error(err); process.exit(1); });
