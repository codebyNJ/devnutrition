/* Find what actually overflows at a phone width. Reports every element whose
 * scrollWidth exceeds the viewport, innermost first, so the true culprit is
 * at the top rather than every ancestor that inherits the problem. */
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:3000/";
const width = Number(process.argv[3] ?? 390);

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: "networkidle" });

/* measure the finished state, not the empty landing page — the label and the
 * streamed verdict are where overflow would actually bite */
const handle = process.argv[4] ?? "torvalds";
if (handle !== "none") {
  await page.getByRole("button", { name: `Inspect ${handle}` }).click();
  await page.waitForSelector("text=Nutrition Facts", { timeout: 20000 });
}
await page.waitForTimeout(2500);

const report = await page.evaluate((vw) => {
  const out = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    const overflows = Math.round(r.right) > vw + 1 || Math.round(r.left) < -1;
    if (!overflows || r.width === 0) continue;
    /* skip elements deliberately parked off-screen (the export twin) */
    if (el.closest("[aria-hidden='true']")) continue;
    /* skip anything inside a container that clips on purpose — a marquee is
     * meant to be wider than its parent, and is not a layout bug */
    let clipped = false;
    for (let a = el.parentElement; a; a = a.parentElement) {
      const ox = getComputedStyle(a).overflowX;
      if (ox === "hidden" || ox === "clip") { clipped = true; break; }
    }
    if (clipped) continue;
    out.push({
      tag: el.tagName.toLowerCase(),
      cls: (typeof el.className === "string" ? el.className : "").slice(0, 70),
      left: Math.round(r.left),
      right: Math.round(r.right),
      width: Math.round(r.width),
      text: (el.textContent ?? "").trim().slice(0, 40),
      depth: (function d(n, i = 0) { return n.parentElement ? d(n.parentElement, i + 1) : i; })(el),
    });
  }
  return {
    docScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    offenders: out.sort((a, b) => b.depth - a.depth).slice(0, 14),
  };
}, width);

console.log(`viewport ${width}px · document scrollWidth ${report.docScrollWidth} · body ${report.bodyScrollWidth}`);
console.log(report.offenders.length ? "\noverflowing elements (innermost first):" : "\nno overflow ✓");
if (report.offenders.length) process.exitCode = 1;
for (const o of report.offenders) {
  console.log(`  right=${String(o.right).padStart(5)} w=${String(o.width).padStart(4)}  ${o.tag}.${o.cls}`);
  if (o.text) console.log(`         “${o.text}”`);
}
await browser.close();
