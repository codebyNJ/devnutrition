"use client";

import { useEffect, useState } from "react";
import type { Nutrition } from "@/lib/nutrition";
import { METRICS, stageTimings } from "@/lib/scoring";

/* The scan's live readout. Each metric resolves on its own beat and prints its
 * real value, so the animation is showing the actual score being assembled
 * rather than replaying a fixed loop. The beats come from the handle, so two
 * developers do not scan at the same rhythm. */

export default function ScoreMeter({
  login,
  data,
}: {
  login: string;
  /** null until the profile lands; rows hold at "measuring" until then */
  data: Nutrition | null;
}) {
  /* The parent keys this component by handle, so a new scan mounts a fresh
   * one — no reset needed, and nothing sets state during the effect body. */
  const [resolved, setResolved] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let at = 260;
    stageTimings(login).forEach((ms, i) => {
      at += ms;
      timers.push(setTimeout(() => setResolved(i + 1), at));
    });
    return () => timers.forEach(clearTimeout);
  }, [login]);

  const pct = Math.round((resolved / METRICS.length) * 100);

  return (
    <div className="w-full max-w-md">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-ink-3">
          Assembling panel
        </span>
        <span className="font-mono text-[12px] tabular-nums text-ink-2">{pct}%</span>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-inset" role="presentation">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul
        className="mt-4 space-y-2"
        aria-live="polite"
        aria-label={`Scoring ${login}, ${pct} percent complete`}
      >
        {METRICS.map((m, i) => {
          const isDone = i < resolved && !!data;
          const active = i === resolved;
          return (
            <li
              key={m.key}
              className={`flex items-baseline gap-2 font-mono text-[12px] transition-opacity duration-300 ${
                i <= resolved ? "opacity-100" : "opacity-25"
              }`}
            >
              <span
                className={`size-1.5 shrink-0 translate-y-[-1px] rounded-full ${
                  isDone ? "bg-green" : active ? "animate-pulse bg-accent" : "bg-line-strong"
                }`}
                aria-hidden
              />
              <span className={`min-w-0 truncate ${isDone ? "text-ink-2" : "text-ink-3"}`}>
                {isDone ? m.label : `${m.working}…`}
              </span>
              <span className="ml-auto shrink-0 tabular-nums text-ink">
                {isDone && data ? m.format(data) : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
