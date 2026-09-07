import { readFile } from "node:fs/promises";
import { join } from "node:path";

/* Satori has no default typeface worth using and does not read woff2, so the
 * weights are bundled as woff and read from disk at render time. Without this
 * the panel's heavy grotesque falls back to a regular weight and the OG image
 * stops looking like the label it is advertising.
 *
 * Each weight is registered as its OWN FAMILY rather than as weight variants
 * of one family: Satori's weight matching did not select the heavier faces
 * here, and naming them explicitly removes the guesswork. lib/og.tsx picks the
 * family it wants instead of asking for a weight. */

const FONT_DIR = join(process.cwd(), "assets", "fonts");

type Font = { name: string; data: ArrayBuffer; weight: 400; style: "normal" };

export const FONT = {
  body: "Inter",
  bold: "InterBold",
  black: "InterBlack",
  mono: "JetBrainsMono",
} as const;

let cache: Font[] | null = null;

export async function ogFonts(): Promise<Font[]> {
  if (cache) return cache;
  const load = async (file: string) => {
    const buf = await readFile(join(FONT_DIR, file));
    return new Uint8Array(buf).buffer;
  };
  cache = [
    { name: FONT.body, data: await load("inter-latin-400-normal.woff"), weight: 400, style: "normal" },
    { name: FONT.bold, data: await load("inter-latin-700-normal.woff"), weight: 400, style: "normal" },
    { name: FONT.black, data: await load("inter-latin-900-normal.woff"), weight: 400, style: "normal" },
    { name: FONT.mono, data: await load("jetbrains-mono-latin-700-normal.woff"), weight: 400, style: "normal" },
  ];
  return cache;
}
