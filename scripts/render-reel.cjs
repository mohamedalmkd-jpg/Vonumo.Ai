// Rendert den Showreel-Film offline aus der Echtzeit-Szene (deterministisch, 24 fps, 1,5× überabgetastet)
// und kodiert ihn mit FFmpeg als AV1 (WebM), VP9 (WebM) und H.264 (MP4) – plus Poster (AVIF/WebP).
// Voraussetzung: Produktionsserver auf :3100. Nutzung: node scripts/render-reel.cjs [--gpu] [--frames 0.0,0.5,...]
// --gpu: echte Grafikkarte statt SwiftShader (Software-GL braucht ~2 min/Bild, eine GPU Sekundenbruchteile).
const { chromium } = require("playwright");
const { execFileSync } = require("child_process");
const fs = require("fs"), path = require("path");
const FPS = 24, SECONDS = 10, N = FPS * SECONDS;
const tmp = process.env.REEL_TMP || path.join(require("os").tmpdir(), "vonumo-reel");
const out = path.join(__dirname, "..", "public", "film");
(async () => {
  const probe = process.argv.includes("--frames") ? process.argv[process.argv.indexOf("--frames") + 1].split(",").map(Number) : null;
  fs.mkdirSync(tmp, { recursive: true }); fs.mkdirSync(out, { recursive: true });
  const gpu = process.argv.includes("--gpu");
  const b = await chromium.launch(gpu ? { headless: false, args: ["--ignore-gpu-blocklist", "--enable-gpu-rasterization"] } : { args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, reducedMotion: "no-preference" })).newPage();
  await p.goto("http://localhost:3100/?capture=reel", { waitUntil: "load" });
  await p.waitForFunction(() => window.__vonumoLoaded, null, { timeout: 180000 });
  await p.evaluate(() => scrollTo(0, 0));
  await p.waitForTimeout(4000);
  const list = probe ?? Array.from({ length: N }, (_, i) => i / (N - 1));
  const t0 = Date.now();
  for (let i = 0; i < list.length; i++) {
    await p.evaluate((t) => new Promise((r) => { window.__reelT = t; requestAnimationFrame(() => requestAnimationFrame(r)); }), list[i]);
    const f = path.join(tmp, probe ? `probe-${list[i]}.png` : `f${String(i).padStart(4, "0")}.png`);
    await p.screenshot({ path: f, timeout: 300000 });
    if (i % 24 === 0) console.log(`frame ${i}/${list.length} · ${Math.round((Date.now() - t0) / 1000)} s`);
  }
  await b.close();
  if (probe) return console.log("probe frames in", tmp);
  const src = ["-framerate", String(FPS), "-i", path.join(tmp, "f%04d.png")];
  const run = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });
  for (const [h, tag] of [[1080, "1080"], [720, "720"]]) {
    const vf = ["-vf", `scale=-2:${h}:flags=lanczos,format=yuv420p`];
    run([...src, ...vf, "-c:v", "libsvtav1", "-crf", "34", "-preset", "6", "-g", "48", path.join(out, `reel-${tag}.av1.webm`)]);
    run([...src, ...vf, "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", path.join(out, `reel-${tag}.vp9.webm`)]);
    run([...src, ...vf, "-c:v", "libx264", "-crf", "22", "-preset", "slow", "-profile:v", "high", "-movflags", "+faststart", path.join(out, `reel-${tag}.mp4`)]);
  }
  const poster = path.join(tmp, `f${String(Math.round(N * 0.18)).padStart(4, "0")}.png`);
  run(["-i", poster, "-vf", "scale=1920:-2", "-c:v", "libaom-av1", "-still-picture", "1", "-crf", "30", path.join(out, "reel-poster.avif")]);
  run(["-i", poster, "-vf", "scale=1920:-2", "-c:v", "libwebp", "-quality", "80", path.join(out, "reel-poster.webp")]);
  console.log("encoded to", out);
})();
