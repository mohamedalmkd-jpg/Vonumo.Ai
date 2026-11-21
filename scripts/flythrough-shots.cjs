const { chromium, devices } = require('playwright');
(async () => {
  // Usage: npm run build && npx next start -p 3100, then: node scripts/flythrough-shots.cjs <outDir> [desktop|iphone]
  const out = process.argv[2], only = process.argv[3];
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const cfgs = [['desktop',{viewport:{width:1440,height:900}}],['iphone',{...devices['iPhone 15'], deviceScaleFactor: 1}]].filter(c => !only || c[0]===only);
  for (const [name, opts] of cfgs) {
    const ctx = await b.newContext(opts); const p = await ctx.newPage();
    const errs = []; p.on('console', m => m.type()==='error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
    await p.goto('http://localhost:3100/', { waitUntil: 'load' });
    await p.waitForFunction(() => window.__vonumoLoaded, null, { timeout: 60000 });
    await p.waitForTimeout(4000);
    const go = async (prog, wait, tag) => {
      await p.evaluate((prog) => { const el = document.getElementById('top'); const max = el.offsetHeight - innerHeight; const y = el.offsetTop + prog*max; window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); }, prog);
      await p.waitForTimeout(wait);
      await p.screenshot({ path: `${out}/${name}-${tag}.png`, timeout: 240000 });
    };
    await p.screenshot({ path: `${out}/${name}-A.png`, timeout: 240000 });
    await go(0.18, 250, 'move1');
    await go(0.40, 3500, 'B');
    await go(0.66, 250, 'move2');
    await go(0.90, 3500, 'C');
    await go(1.0, 300, 'C-end');
    // fps sample
    const fps = await p.evaluate(() => new Promise(r => { let n=0; const t0=performance.now(); const f=()=>{ n++; if (performance.now()-t0<2000) requestAnimationFrame(f); else r(n/2); }; requestAnimationFrame(f); }));
    const ov = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    await ctx.close();
    console.log(name, { fps, overflow: ov, errors: errs.slice(0,6) });
  }
  await b.close();
})();
