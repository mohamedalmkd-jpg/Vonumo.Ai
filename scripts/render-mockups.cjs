// Rendert die Konzeptstudien (scripts/mockups/*.html) zu public/work/<name>-{desktop,mobile}.webp
// Nutzung: node scripts/render-mockups.cjs [name ...]
const { chromium } = require("playwright");
const { execFileSync } = require("child_process");
const path = require("path"), fs = require("fs");
const dir = path.join(__dirname, "mockups"), out = path.join(__dirname, "..", "public", "work");
const names = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(dir).filter((f) => f.endsWith(".html")).map((f) => f.slice(0, -5));
(async () => {
  const b = await chromium.launch();
  for (const n of names) {
    for (const [kind, vp, scale] of [["desktop", { width: 1600, height: 1000 }, 1.5], ["mobile", { width: 430, height: 932 }, 2]]) {
      const p = await b.newPage({ viewport: vp, deviceScaleFactor: scale });
      await p.goto("file://" + path.join(dir, n + ".html"));
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(300);
      const png = path.join(out, `${n}-${kind}.png`);
      await p.screenshot({ path: png });
      execFileSync("ffmpeg", ["-v", "error", "-y", "-i", png, "-c:v", "libwebp", "-quality", "82", path.join(out, `${n}-${kind}.webp`)]);
      fs.unlinkSync(png);
      await p.close();
    }
    console.log("rendered", n);
  }
  await b.close();
})();
