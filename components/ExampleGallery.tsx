"use client";

import type { Nutrition } from "@/lib/nutrition";
import { gradeNote, n } from "@/lib/nutrition";

/* Already-inspected developers, scanned on the server so the page opens with
 * real grades rather than an empty state. Picking one replays the audit using
 * the data already in hand — no second round-trip. */

const GRADE_TONE: Record<Nutrition["grade"], string> = {
  A: "text-green",
  B: "text-green",
  C: "text-orange",
  D: "text-orange",
  F: "text-red",
};

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

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {examples.map((d) => (
          <button
            key={d.login}
            type="button"
            onClick={() => onPick(d.login)}
            className="group flex items-center gap-3 rounded-card bg-surface p-3 text-left
              shadow-btn transition-colors duration-150 hover:bg-hover
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span
              className={`grid size-10 shrink-0 place-items-center rounded-full border-2
                border-current text-[17px] font-black ${GRADE_TONE[d.grade]}`}
              aria-hidden
            >
              {d.grade}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-medium text-ink">
                @{d.login}
              </span>
              <span className="block truncate font-mono text-[11px] text-ink-3">
                {n(d.caffeine)}mg · {d.docs}% docs · {d.aura}% aura
              </span>
            </span>

            <span className="hidden max-w-[38%] shrink-0 text-right font-mono text-[10px] leading-tight text-ink-3 sm:block">
              {gradeNote(d.grade)}
            </span>
          </button>
        ))}
      </div>

      {/* Say which it is. The whole app's stance is that a simulated number
        * announces itself, and a caption that always claims "live" would be
        * the one dishonest thing on the page. */}
      <p className="mt-3 text-center font-mono text-[10.5px] text-ink-3">
        {examples.every((e) => e.real)
          ? "Grades from live GitHub data · re-inspect any of them"
          : "Simulated — GitHub rate limit reached · re-inspect any of them"}
      </p>
    </section>
  );
}
