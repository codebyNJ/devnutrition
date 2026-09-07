/* The Beautiful UI registry emits foundation.css by slicing per-component
 * blocks out of one master file. On a partial install (we don't use
 * records-table) the slice leaves an orphaned rule plus the closing brace of
 * the @media it used to live in, and PostCSS refuses the file:
 *   CssSyntaxError: Unexpected }
 * Re-run after every `shadcn add` from this registry. Idempotent.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "app/beautifui/foundation.css";
const ORPHAN = "  .records-footer-hint {\n    display: none;\n  }\n}\n\n";

const before = readFileSync(FILE, "utf8");
const after = before.replace(ORPHAN, "");

const braces = (s) => {
  const t = s.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...t].reduce((n, c) => n + (c === "{") - (c === "}"), 0);
};

if (after !== before) writeFileSync(FILE, after);
const drift = braces(after);
console.log(
  after === before ? "foundation.css: already clean" : "foundation.css: removed orphaned records-table rule",
);
if (drift !== 0) {
  console.error(`foundation.css: braces still unbalanced by ${drift} — registry emitted something new`);
  process.exit(1);
}
console.log("foundation.css: braces balanced");
