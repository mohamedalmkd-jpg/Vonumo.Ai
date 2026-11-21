// Visuelle Regressionstests: Screenshots fester Abschnitte (Desktop + iPhone) gegen gespeicherte Referenzen.
// Läuft mit „reduzierter Bewegung“ (keine Zufallsanimationen) und blendet WebGL-Flächen aus,
// weil Software-GL nicht pixelgleich rendert. Geprüft werden Layout, Typo, Farben, Abstände.
//   node scripts/visual-regression.mjs --update   → Referenzen neu schreiben (tests/visual/baseline)
//   node scripts/visual-regression.mjs            → vergleichen; Diffs in tests/visual/diff, Exit-Code 1 bei Abweichung
// Server muss laufen (npx next start -p 3100).
import { createRequire } from "node:module";
// Playwright ist global vorinstalliert (gleiche Version wie der Browser) → über NODE_PATH laden
const { chromium, devices } = createRequire(import.meta.url)("playwright");
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const update = process.argv.includes("--update");
const THRESHOLD = 0.002; // max. Anteil abweichender Pixel
const SECTIONS = ["preise", "termin", "faq", "kontakt"];
const DEVICES = { desktop: { viewport: { width: 1440, height: 900 } }, iphone: { ...devices["iPhone 15"], deviceScaleFactor: 1 } };
for (const d of ["baseline", "current", "diff"]) mkdirSync(`tests/visual/${d}`, { recursive: true });

const browser = await chromium.launch();
let failed = 0;
for (const [dev, opts] of Object.entries(DEVICES)) {
  const ctx = await browser.newContext({ ...opts, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForFunction(() => window.__vonumoLoaded, null, { timeout: 120000 });
  await page.addStyleTag({ content: "canvas{visibility:hidden!important} *{caret-color:transparent!important}" });
  for (const id of SECTIONS) {
    const el = page.locator(`#${id}`);
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const name = `${dev}-${id}.png`;
    const shot = await el.screenshot({ animations: "disabled" });
    if (update || !existsSync(`tests/visual/baseline/${name}`)) { writeFileSync(`tests/visual/baseline/${name}`, shot); console.log("baseline", name); continue; }
    writeFileSync(`tests/visual/current/${name}`, shot);
    const a = PNG.sync.read(readFileSync(`tests/visual/baseline/${name}`)), b = PNG.sync.read(shot);
    if (a.width !== b.width || a.height !== b.height) { console.log(`✗ ${name}: Größe ${a.width}×${a.height} → ${b.width}×${b.height}`); failed++; continue; }
    const diff = new PNG({ width: a.width, height: a.height });
    const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
    const ratio = n / (a.width * a.height);
    if (ratio > THRESHOLD) { writeFileSync(`tests/visual/diff/${name}`, PNG.sync.write(diff)); console.log(`✗ ${name}: ${(ratio * 100).toFixed(2)} % abweichend`); failed++; }
    else console.log(`✓ ${name}: ${(ratio * 100).toFixed(3)} %`);
  }
  await ctx.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
