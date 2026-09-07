/* The reveal contract: the label must not appear while the agent run is still
 * on screen, and the run must be gone once it does. Samples the DOM every
 * 150ms through a whole audit and reports any frame where both are present. */
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
const errs = [];
page.on("pageerror", (e) => errs.push(e.message));
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

const t0 = Date.now();
await page.getByRole("button", { name: "Inspect torvalds" }).click();

const frames = [];
for (let i = 0; i < 60; i++) {
  frames.push({
    t: Date.now() - t0,
    ...(await page.evaluate(() => ({
      label: !!document.body.innerText.includes("Nutrition Facts"),
      run:
        !!document.body.innerText.match(/Auditing @|tool calls|Public activity parsed/),
    }))),
  });
  if (frames.at(-1).label && frames.length > 4) break;
  await page.waitForTimeout(150);
}

const overlap = frames.filter((f) => f.label && f.run);
const firstLabel = frames.find((f) => f.label);
const lastRun = [...frames].reverse().find((f) => f.run);

console.log(`run visible until : ${lastRun ? lastRun.t : "n/a"}ms`);
console.log(`label appears at  : ${firstLabel ? firstLabel.t : "NEVER"}ms`);
console.log(
  overlap.length
    ? `*** OVERLAP: ${overlap.length} frame(s) show the run AND the label together ***`
    : "no overlap — run clears before the label lands ✓",
);
console.log(errs.length ? "page errors: " + errs.join("; ") : "no page errors ✓");
if (overlap.length || !firstLabel) process.exitCode = 1;
await browser.close();
