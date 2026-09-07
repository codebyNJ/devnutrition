"use client";

import NutritionLabel from "@/components/NutritionLabel";
import type { Nutrition } from "@/lib/nutrition";
import { gradeNote } from "@/lib/nutrition";

/* Each card is the real thing: the same component, in the same `export` mode
 * that produces the shared PNG, scaled down. Not a summary of the label — the
 * label itself, which is what people are actually here to see.
 *
 * PREVIEW_W is the export width; the card scales it to fit and clips to the
 * top of the panel, where the stamp, title and calories live. */
/* transform: scale() takes a unitless factor, so this is a fixed ratio rather
 * than a fit-to-container calc. 540 x 0.55 = 297px, which fits the one-column
 * phone layout and the two-column desktop grid without measuring anything. */
const EXPORT_W = 540;
const SCALE = 0.55;
const PREVIEW_W = EXPORT_W * SCALE;
const CARD_H = 236;

export default function ExampleGallery({
  examples,
  onPick,
}: {
  examples: Nutrition[];
  onPick: (login: string) => void;
}) {
  if (!examples.length) return null;

  return (
    <section className="mt-12">
      <h2 className="text-center font-mono text-[10.5px] tracking-[0.22em] uppercase text-ink-3">
        Previously inspected
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {examples.map((d) => (
          <button
            key={d.login}
            type="button"
            onClick={() => onPick(d.login)}
            aria-label={`Inspect ${d.login}, graded ${d.grade}`}
            className="group overflow-hidden rounded-card bg-surface text-left shadow-btn
              transition-transform duration-200 hover:-translate-y-0.5
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <div
              className="relative mx-auto overflow-hidden bg-white"
              style={{ height: CARD_H, width: PREVIEW_W }}
            >
              <div
                className="origin-top-left"
                style={{ width: EXPORT_W, transform: `scale(${SCALE})` }}
                aria-hidden
              >
                <NutritionLabel d={d} mode="export" />
              </div>
              {/* fade the clip line so it reads as a preview, not a crop bug */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-b from-transparent to-white" />
            </div>

            <div className="flex items-center gap-2 border-t border-line px-3 py-2.5">
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">
                @{d.login}
              </span>
              <span className="shrink-0 font-mono text-[11px] text-ink-3">
                {gradeNote(d.grade)}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Say which it is. The whole app's stance is that a simulated number
        * announces itself, and a caption that always claims "live" would be
        * the one dishonest thing on the page. */}
      <p className="mt-3 text-center font-mono text-[10.5px] text-ink-3">
        {examples.every((e) => e.real)
          ? "Grades from live GitHub data · tap to re-inspect"
          : "Simulated — GitHub rate limit reached · tap to re-inspect"}
      </p>
    </section>
  );
}
