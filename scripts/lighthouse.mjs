// Lighthouse-Audit (Performance, Barrierefreiheit, Best Practices, SEO) gegen den laufenden Server.
// Nutzung: npx next start -p 3100 & → node scripts/lighthouse.mjs [url] [--mobile]
// Ergebnis: docs/lighthouse/report-<desktop|mobile>.html + Zusammenfassung in der Konsole.
// Hinweis: In der Cloud-Umgebung ohne GPU sind Performance-Werte nicht repräsentativ –
// Barrierefreiheit, Best Practices und SEO sind es.
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";

const url = process.argv.find((a) => a.startsWith("http")) ?? "http://localhost:3100/";
const mobile = process.argv.includes("--mobile");
const chromePath = process.env.CHROME_PATH ?? ["/opt/pw-browsers/chromium-1243/chrome-linux64/chrome"].find(existsSync);
const chrome = await chromeLauncher.launch({ chromePath, chromeFlags: ["--headless=new", "--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
try {
  const res = await lighthouse(url, { port: chrome.port, output: "html", logLevel: "error" }, {
    extends: "lighthouse:default",
    settings: mobile ? { formFactor: "mobile", screenEmulation: { mobile: true, width: 393, height: 852, deviceScaleFactor: 3, disabled: false } }
      : { formFactor: "desktop", screenEmulation: { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false }, throttlingMethod: "provided" },
  });
  mkdirSync("docs/lighthouse", { recursive: true });
  const out = `docs/lighthouse/report-${mobile ? "mobile" : "desktop"}.html`;
  writeFileSync(out, res.report);
  const c = res.lhr.categories;
  console.log(Object.values(c).map((x) => `${x.title}: ${Math.round(x.score * 100)}`).join(" · "), "→", out);
  const fails = Object.values(res.lhr.audits).filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode === "binary").map((a) => `- ${a.title}`);
  if (fails.length) console.log("Auffälligkeiten:\n" + fails.slice(0, 15).join("\n"));
} finally {
  await chrome.kill();
}
