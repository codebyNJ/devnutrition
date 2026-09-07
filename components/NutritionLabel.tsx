"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { Nutrition } from "@/lib/nutrition";
import { gradeNote, n } from "@/lib/nutrition";
import { cardPosition, cardRating, cardStats } from "@/lib/card";

/* An FDA panel is a typographic system, not a card: hairline rules between
 * lines, heavy rules between blocks.
 *
 * Two sizings from one component:
 *   screen — fluid, type scales with the viewport, rows wrap rather than clip
 *   export — locked to 540px so the shared PNG is identical on every device
 *
 * Always plain black on white: this is the artifact people screenshot, so it
 * must not inherit the app's theme, tokens, or dark mode. */

type Mode = "screen" | "export";

const TYPE = {
  screen: {
    title: "clamp(30px, 8.5vw, 42px)",
    calories: "clamp(26px, 7.5vw, 34px)",
    caloriesWord: "clamp(20px, 5.5vw, 26px)",
    body: "clamp(12.5px, 3.4vw, 13.5px)",
  },
  export: { title: "42px", calories: "34px", caloriesWord: "26px", body: "13.5px" },
} satisfies Record<Mode, Record<string, string>>;

/* Roll the headline number up on reveal. Screen only — the export twin must
 * never animate, or the PNG catches a half-counted number. */
function useCountUp(target: number, run: boolean, ms = 900) {
  const [value, setValue] = useState(run ? 0 : target);
  const frame = useRef(0);

  useEffect(() => {
    if (!run) return;
    /* every update happens inside the frame callback, never synchronously in
     * the effect body, so this cannot cascade a second render pass */
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    const tick = (now: number) => {
      if (reduced) return setValue(target);
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, run, ms]);

  return value;
}

function GradeStamp({ grade, animate }: { grade: Nutrition["grade"]; animate: boolean }) {
  /* Two concentric hairlines and one letter. The previous version stacked
   * three lines of type inside 74px, which just read as grey mush at label
   * scale and worse in the exported PNG. */
  const wide = grade.length > 1; // "A+" needs a little more room than "B"
  return (
    <div
      className={`pointer-events-none absolute top-3 right-4 select-none
        ${animate ? "animate-stamp-in" : "-rotate-[11deg]"}`}
      aria-hidden
    >
      <div className="relative grid size-[68px] place-items-center rounded-full border-[2.5px] border-black text-black">
        <span className="absolute inset-[5px] rounded-full border border-black/35" />
        <span
          className={`leading-none font-black tracking-[-0.04em] ${wide ? "text-[26px]" : "text-[30px]"}`}
        >
          {grade}
        </span>
        <span className="absolute bottom-[9px] font-mono text-[6.5px] tracking-[0.22em]">
          F.D.A.
        </span>
      </div>
    </div>
  );
}

/* The rating block: one headline number and six three-letter stats, printed
 * the way a supplement panel prints its active ingredients. Same arithmetic as
 * the rest of the label, shown the way a scouting report would show it. */
function ScoutingReport({ d, size }: { d: Nutrition; size: string }) {
  const stats = cardStats(d);
  return (
    <div className="mt-3 border-t-[5px] border-black pt-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold">Overall Rating</div>
          <div className="font-mono text-[9px] tracking-[0.14em] text-black/50">
            {cardPosition(d)} · {n(d.followers)} followers · {n(d.repos)} repos
          </div>
        </div>
        <div className="font-mono text-[30px] leading-none font-bold tabular-nums">
          {cardRating(d)}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1">
        {stats.map((st) => (
          <div
            key={st.key}
            className="flex items-baseline gap-1.5 border-b border-black/15 py-0.5"
            style={{ fontSize: size }}
            title={st.label}
          >
            <span className="font-mono font-bold">{st.key}</span>
            <span className="ml-auto font-mono tabular-nums">
              {String(st.value).padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Real panels carry a barcode; this one encodes nothing but the handle's hash,
 * which is the honest amount of information here. */
function Barcode({ bars }: { bars: number[] }) {
  return (
    <div className="flex h-9 items-stretch gap-px" aria-hidden>
      {bars.map((w, i) => (
        <span
          key={i}
          className={i % 2 ? "bg-transparent" : "bg-black"}
          style={{ width: `${w}px` }}
        />
      ))}
    </div>
  );
}

function Line({
  label,
  value,
  dv,
  indent,
  bold = true,
  size,
}: {
  label: string;
  value?: string;
  dv?: string;
  indent?: boolean;
  bold?: boolean;
  size: string;
}) {
  return (
    /* min-w-0 lets a long label wrap to a second line instead of pushing the
     * row wider than the panel — the clipping bug on narrow phones */
    <div
      className={`flex items-baseline gap-x-2 border-b border-black/15 py-1 ${indent ? "pl-4" : ""}`}
      style={{ fontSize: size }}
    >
      <span className={`min-w-0 ${bold ? "font-bold" : ""}`}>{label}</span>
      {value && <span className="shrink-0 font-mono tabular-nums">{value}</span>}
      {dv && <span className="ml-auto shrink-0 font-mono font-bold tabular-nums">{dv}</span>}
    </div>
  );
}

export default function NutritionLabel({
  d,
  mode = "screen",
  panelRef,
}: {
  d: Nutrition;
  mode?: Mode;
  panelRef?: RefObject<HTMLDivElement | null>;
}) {
  const t = TYPE[mode];
  const isExport = mode === "export";
  const calories = useCountUp(d.calories, !isExport);

  return (
    <div
      ref={panelRef}
      className={`relative overflow-hidden border border-black bg-white text-black ${
        isExport ? "w-[540px] p-8" : "w-full max-w-md p-5 sm:p-8"
      }`}
    >
      {!isExport && (
        /* a single pass of inspection light across the fresh print */
        <div
          className="animate-scan-sweep pointer-events-none absolute inset-x-0 top-0 h-1/3
            bg-gradient-to-b from-transparent via-black/[0.07] to-transparent"
          aria-hidden
        />
      )}
      <GradeStamp grade={d.grade} animate={!isExport} />
      {/* pr- clears the grade stamp parked in the top-right corner */}
      <div className="flex items-center gap-3 pr-[76px] pb-3">
        {d.avatar && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={d.avatar}
            crossOrigin="anonymous"
            alt=""
            className="size-9 shrink-0 rounded-full border border-black/15"
          />
        )}
        {/* tracking is tighter on screen so the byline still clears the stamp
            on a narrow phone; the export has the room for the wider setting */}
        <div className="min-w-0">
          <div
            className={`truncate font-mono uppercase text-black/55 ${
              isExport ? "text-[10.5px] tracking-[0.16em]" : "text-[9.5px] tracking-[0.08em]"
            }`}
          >
            @{d.login}
            <span className="text-black/25"> · </span>
            {d.years} yrs cultured
          </div>
          {/* real profile detail when GitHub gives us any */}
          {(d.name !== d.login || d.company || d.location) && (
            <div className="truncate text-[10.5px] text-black/45">
              {[d.name !== d.login ? d.name : null, d.company, d.location]
                .filter(Boolean)
                .join(" · ")}
            </div>
          )}
        </div>
      </div>

      <h2
        className="border-b-[10px] border-black pb-2 leading-[0.9] font-black tracking-tight"
        style={{ fontSize: t.title }}
      >
        Nutrition Facts
      </h2>

      <div className="border-b border-black/15 py-1.5 text-[13px]">
        {n(d.servings)} servings per lifetime
      </div>
      {/* Stacks on a narrow screen so the serving size never forces overflow —
        * but keyed off `mode`, not a `sm:` breakpoint: the export twin is 540px
        * wide inside whatever viewport rendered it, and a viewport-driven
        * breakpoint would make a phone's PNG differ from a desktop's. */}
      <div
        className={`flex border-b-[8px] border-black py-1.5 font-bold ${
          isExport
            ? "flex-row items-baseline justify-between gap-2"
            : "flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2"
        }`}
        style={{ fontSize: t.body }}
      >
        <span>Serving size</span>
        <span>1 Pull Request (~400 LOC)</span>
      </div>

      <div className="pt-2 text-[11px] font-bold">Amount Per Session</div>
      <div className="flex items-end justify-between gap-2 border-b-[5px] border-black pb-1">
        <span className="font-black tracking-tight" style={{ fontSize: t.caloriesWord }}>
          Calories
        </span>
        <span
          className="font-mono leading-none font-bold tabular-nums"
          style={{ fontSize: t.calories }}
        >
          {n(calories)}
        </span>
      </div>
      <div className="border-b border-black/15 py-1 text-right text-[11px] font-bold">
        % Daily Value*
      </div>

      <Line size={t.body} label="Total Caffeine" value={`${n(d.caffeine)}mg`} dv={`${n(d.caffeine * 2 + 100)}%`} />
      <Line size={t.body} label="Saturated Tech Debt" dv={`${n(d.debt)}% (High)`} indent bold={false} />
      <Line size={t.body} label="Documentation" value="0g" dv={`${d.docs}%`} />
      <Line size={t.body} label="Stack Overflow Copy-Paste" dv={`${d.stackOverflow}%`} />
      <Line size={t.body} label="Unused npm Dependencies" value={`${n(d.npm)}g`} />
      <div className="border-b-[8px] border-black">
        <Line size={t.body} label="Raw Aura / Clout" dv={`${d.aura}%`} />
      </div>

      <ScoutingReport d={d} size={t.body} />

      <p className="pt-3 text-[10.5px] leading-snug text-black/55">
        * Percent Daily Values are based on a 2,000 commit diet. Documentation is naturally low and
        occurs in trace amounts only.
      </p>
      <p className="mt-3 border-t border-black/15 pt-3 text-[11.5px] leading-relaxed">
        <span className="font-bold">Ingredients:</span> Purified espresso, late-night commit regret,
        unformatted JSON, broken unit tests, traces of rust and hallucinated APIs.
      </p>
      {d.bio && (
        <p className="mt-2 text-[11px] leading-relaxed text-black/60">
          <span className="font-bold text-black">Declared by manufacturer:</span> &ldquo;{d.bio}&rdquo;
        </p>
      )}
      <div className="mt-4 border-2 border-black p-3 text-[11.5px] leading-relaxed">
        <span className="font-black tracking-wide uppercase">Warning:</span> Excessive consumption of
        this developer&rsquo;s code may cause merge conflicts, existential dread, and unexpected
        production downtime.
      </div>
      <div className="mt-4 flex items-end justify-between gap-3 border-t border-black/15 pt-3">
        <div className="min-w-0 font-mono text-[9px] leading-relaxed tracking-[0.08em] text-black/55">
          <div>{d.batch}</div>
          <div>BEST BEFORE {d.bestBefore}</div>
          <div className="text-black/40">{gradeNote(d.grade)}</div>
        </div>
        <Barcode bars={d.barcode} />
      </div>

      <div className="mt-3 font-mono text-[9.5px] tracking-[0.18em] uppercase text-black/40">
        DevNutrition · {d.real ? "Verified via api.github.com" : "Simulated (rate-limited)"} · FDA
        certified
      </div>
    </div>
  );
}
