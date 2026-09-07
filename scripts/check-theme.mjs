/* The toggle must flip the <html> class, repaint the page, survive a reload,
 * and leave the label as black-on-white paper in both themes. */
import { chromium } from "playwright";
import os from "node:os";

/* default to a temp dir — a check should not leave files in the repo */
const SP = process.argv[2] ?? os.tmpdir();
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
const errs = [];
page.on("pageerror", (e) => errs.push(e.message));
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

const read = () =>
  page.evaluate(() => ({
    cls: document.documentElement.className.includes("dark") ? "dark" : "light",
    page: getComputedStyle(document.body).backgroundColor,
    img: getComputedStyle(document.body).backgroundImage,
  }));

const toggle = page.getByRole("switch");
const before = await read();
await toggle.click();
await page.waitForTimeout(450);
const after = await read();

await page.getByRole("button", { name: "Inspect torvalds", exact: true }).click();
await page.waitForSelector("text=Nutrition Facts", { timeout: 25000 });
await page.waitForTimeout(3800);
const labelBg = await page.evaluate(() => {
  const el = [...document.querySelectorAll("div")].find((d) =>
    d.className.includes("border-black") && d.className.includes("bg-white"));
  return el ? getComputedStyle(el).backgroundColor : "not found";
});
await page.screenshot({ path: `${SP}/theme-light.png`, fullPage: true });

await page.reload({ waitUntil: "networkidle" });
const persisted = await read();

console.log(`start        : ${before.cls}  bg ${before.page}`);
console.log(`after toggle : ${after.cls}  bg ${after.page}`);
console.log(`after reload : ${persisted.cls}  ${persisted.cls === after.cls ? "persisted ✓" : "*** NOT PERSISTED ***"}`);
console.log(`bg image     : ${after.img === "none" ? "none — plain fill ✓" : `*** ${after.img.slice(0, 60)} ***`}`);
console.log(`label bg     : ${labelBg} ${labelBg === "rgb(255, 255, 255)" ? "— stays paper white ✓" : "*** not white ***"}`);
console.log(errs.length ? "page errors: " + errs.join("; ") : "no page errors ✓");
if (before.cls === after.cls || after.img !== "none") process.exitCode = 1;
await browser.close();
