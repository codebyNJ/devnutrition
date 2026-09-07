/* Screenshot the real flow at a real viewport: type a handle, wait for the
 * label, capture. Beats poking the app with curl. */
import { chromium } from "playwright";

const [url, w, out, handle] = [
  process.argv[2] ?? "http://localhost:3000/",
  Number(process.argv[3] ?? 390),
  process.argv[4] ?? "shot.png",
  process.argv[5],
];

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text().slice(0, 160)}`));

await page.goto(url, { waitUntil: "networkidle" });

if (handle) {
  await page.getByRole("button", { name: `Inspect ${handle}` }).click();
  await page.waitForSelector("text=Nutrition Facts", { timeout: 20000 });
  await page.waitForTimeout(3500); // let the streamed verdict finish
}

await page.screenshot({ path: out, fullPage: true });
const m = await page.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
}));
console.log(`${out} · viewport ${w} · scrollWidth ${m.scrollW} (client ${m.clientW}) ${m.scrollW > m.clientW ? "*** H-SCROLL ***" : "no h-scroll ✓"}`);
if (errors.length) console.log("page errors:\n  " + errors.slice(0, 8).join("\n  "));
else console.log("no page errors ✓");
await browser.close();
