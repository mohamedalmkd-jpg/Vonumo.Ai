const { chromium, devices } = require('playwright');
// Hero journey verification: captures the 6 chapter rest poses, two mid-move frames and one reverse-scroll frame.
// Usage: npx next start -p 3100, then: node scripts/journey-shots.cjs <outDir> [desktop|iphone] [settleMs]
// Software GL (SwiftShader): frames take seconds, so each pose waits settleMs (default 30 s) for the camera damping.
const CH = [[0, 0.04], [0.15, 0.24], [0.35, 0.44], [0.6, 0.7], [0.8, 0.87], [0.95, 1]];
const REST = CH.map(([a, b], i) => (i === 0 ? 0 : a + (b - a) * 0.35));
(async () => {
  const out = process.argv[2], only = process.argv[3] || 'desktop', settle = Number(process.argv[4]) || 30000;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const opts = only === 'iphone' ? { ...devices['iPhone 15'], deviceScaleFactor: 1 } : { viewport: { width: 1440, height: 900 } };
  const ctx = await b.newContext(opts); const p = await ctx.newPage();
  const errs = []; p.on('console', (m) => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto('http://localhost:3100/', { waitUntil: 'load' });
  await p.waitForFunction(() => window.__vonumoLoaded, null, { timeout: 120000 });
  const go = async (prog) => p.evaluate((prog) => { const el = document.getElementById('top'); const y = el.offsetTop + prog * (el.offsetHeight - innerHeight); window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); }, prog);
  const shot = async (prog, tag, wait) => { await go(prog); await p.waitForTimeout(wait); await p.screenshot({ path: `${out}/${only}-${tag}.png`, timeout: 300000 }); };
  await p.waitForTimeout(settle * 2);
  for (let i = 0; i < 6; i++) await shot(REST[i], `ch${i + 1}`, i ? settle : 1000);
  await shot(0.53, 'move-glass', 4000);   // mid-move through the glass facade (motion blur expected)
  await shot(0.765, 'move-v', 4000);      // on the way to the V, wall screens booting
  await shot(REST[3], 'ch4-reverse', settle); // scroll back: screens must be in the same state as forward
  const ov = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  console.log(JSON.stringify({ only, overflow: ov, errors: errs.slice(0, 8) }));
  await ctx.close(); await b.close();
})();
