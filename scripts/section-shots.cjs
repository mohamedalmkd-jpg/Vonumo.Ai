// Screenshots gepinnter Abschnitte an festen Fortschrittswerten.
// Nutzung (Server auf :3100): node scripts/section-shots.cjs <outDir> <desktop|iphone> <id:p1,p2,...> [<id:...> ...]
const { chromium, devices } = require("playwright");
(async () => {
  const [out, dev, ...specs] = process.argv.slice(2);
  const opts = dev === "iphone" ? { ...devices["iPhone 15"], deviceScaleFactor: 1 } : { viewport: { width: 1440, height: 900 } };
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const ctx = await b.newContext(opts); const p = await ctx.newPage();
  const errs = []; p.on("pageerror", (e) => errs.push(String(e))); p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await p.goto("http://localhost:3100/", { waitUntil: "load" });
  await p.waitForFunction(() => window.__vonumoLoaded, null, { timeout: 90000 });
  await p.waitForTimeout(Number(process.env.WARMUP || 3000));
  for (const spec of specs) {
    const [id, list] = spec.split(":");
    for (const prog of list.split(",").map(Number)) {
      await p.evaluate(([id, prog]) => { const el = document.getElementById(id); const y = el.offsetTop + prog * Math.max(0, el.offsetHeight - innerHeight); window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); }, [id, prog]);
      await p.waitForTimeout(Number(process.env.SETTLE || 2600));
      await p.screenshot({ path: `${out}/${dev}-${id}-${String(prog).replace(".", "_")}.png`, timeout: 120000 });
    }
  }
  const ov = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  console.log(dev, { overflow: ov, errors: errs.slice(0, 6) });
  await ctx.close(); await b.close();
})();
