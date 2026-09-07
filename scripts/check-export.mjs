/* End-to-end check of the share path: run a real audit, click Download, and
 * keep whatever the browser actually saved. Verifies html2canvas-pro can
 * rasterise foundation.css (it is authored in oklch) and that the export twin
 * renders at the locked 1080px. */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const out = process.argv[2] ?? "export.png";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Inspect torvalds", exact: true }).click();
await page.waitForSelector("text=Nutrition Facts", { timeout: 20000 });

const btn = page.getByRole("button", { name: "Download", exact: true });
await btn.waitFor();
/* the button stays disabled until the PNG is ready — that gate is the thing
 * that keeps navigator.share() inside the user gesture on iOS */
await page.waitForSelector('button:text-is("Download"):not([disabled])', { timeout: 20000 });

const [download] = await Promise.all([page.waitForEvent("download", { timeout: 20000 }), btn.click()]);
const stream = await download.createReadStream();
const chunks = [];
for await (const c of stream) chunks.push(c);
const buf = Buffer.concat(chunks);
writeFileSync(out, buf);

/* PNG header: width/height are big-endian uint32 at bytes 16 and 20 */
const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
console.log(`saved as: ${download.suggestedFilename()}`);
console.log(`bytes: ${buf.length}  dimensions: ${w}x${h}`);
console.log(w === 1080 ? "width locked to 1080 ✓" : `*** expected width 1080, got ${w} ***`);
console.log(errors.length ? `page errors: ${errors.join("; ")}` : "no page errors ✓");
await browser.close();
