const { chromium, devices } = require('playwright');
// Usage: npx next start -p 3100, then: node scripts/fidelity-audit.cjs <outDir> [desktop|iphone] [query] [iphoneDSF]
// e.g. node scripts/fidelity-audit.cjs out iphone '?dpr=1.5' 3  → real iPhone pixel grid, WebGL forced to the 1.5 cap
// Captures hero rest shots (exterior B-pose, interior C-pose) and reports real render resolution,
// DPR, GL limits and frame time. Software GL (SwiftShader): fps is not real-device performance.
(async () => {
  const out = process.argv[2], only = process.argv[3], query = process.argv[4] || '', dsf = Number(process.argv[5]) || 1;
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const cfgs = [['desktop',{viewport:{width:1440,height:900}}],['iphone',{...devices['iPhone 15'], deviceScaleFactor: dsf}]].filter(c => !only || c[0]===only);
  for (const [name, opts] of cfgs) {
    const ctx = await b.newContext(opts); const p = await ctx.newPage();
    const errs = []; p.on('console', m => m.type()==='error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
    await p.goto('http://localhost:3100/' + query, { waitUntil: 'load' });
    await p.waitForFunction(() => window.__vonumoLoaded, null, { timeout: 90000 });
    await p.waitForTimeout(9000);
    const go = async (prog, wait, tag) => {
      await p.evaluate((prog) => { const el = document.getElementById('top'); const max = el.offsetHeight - innerHeight; const y = el.offsetTop + prog*max; window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); }, prog);
      await p.waitForTimeout(wait);
      await p.screenshot({ path: `${out}/${name}-${tag}.png`, timeout: 300000 });
    };
    await p.screenshot({ path: `${out}/${name}-A.png`, timeout: 300000 });
    await go(0.40, 14000, 'B');
    await go(0.90, 14000, 'C');
    const info = await p.evaluate(() => {
      const c = document.querySelector('canvas'); const gl = c.getContext('webgl2');
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      const r = window.__vonumoAudit ? window.__vonumoAudit() : null;
      return { css: [c.clientWidth, c.clientHeight], buffer: [gl.drawingBufferWidth, gl.drawingBufferHeight], dpr: +(gl.drawingBufferWidth / c.clientWidth).toFixed(2),
        deviceDpr: devicePixelRatio, maxTex: gl.getParameter(gl.MAX_TEXTURE_SIZE), samples: gl.getParameter(gl.SAMPLES), aa: gl.getContextAttributes().antialias,
        renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '?', app: r };
    });
    const ft = await p.evaluate(() => new Promise(r => { const ts=[]; let last=performance.now(); const f=(t)=>{ ts.push(t-last); last=t; if (ts.length<12) requestAnimationFrame(f); else { ts.sort((a,b)=>a-b); r({ medianMs: +ts[6].toFixed(1), fps: +(1000/ts[6]).toFixed(2) }); } }; requestAnimationFrame(f); }));
    const ov = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    await ctx.close();
    console.log(JSON.stringify({ name, info, frame: ft, overflow: ov, errors: errs.slice(0,6) }));
  }
  await b.close();
})();
