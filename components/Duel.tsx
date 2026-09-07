"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import NutritionLabel from "@/components/NutritionLabel";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/atoms/Button";
import { EntityChip } from "@/components/atoms/EntityChip";
import { ValuePill } from "@/components/atoms/ValuePill";
import { analyze, fetchUser, gradeScore, type Nutrition } from "@/lib/nutrition";
import { cardRating, cardStats } from "@/lib/card";
import { renderPng, saveFile, shareLabel } from "@/lib/share";

/* Two panels, one winner. The comparison runs on gradeScore — the same number
 * behind the letter grade — so the duel cannot disagree with the labels it is
 * comparing. */

type Side = "a" | "b";

function StatRow({ a, b, i }: { a: Nutrition; b: Nutrition; i: number }) {
  const sa = cardStats(a)[i];
  const sb = cardStats(b)[i];
  const total = sa.value + sb.value || 1;
  const aPct = (sa.value / total) * 100;
  /* DOC and DBT are the two where a lower number is the better outcome */
  const lowerWins = sa.key === "DBT" || sa.key === "SOF";
  const aWins = lowerWins ? sa.value < sb.value : sa.value > sb.value;
  const draw = sa.value === sb.value;

  return (
    <div className="py-1.5">
      <div className="flex items-baseline gap-2 font-mono text-[12px] tabular-nums">
        <span className={draw ? "text-ink-2" : aWins ? "font-bold text-ink" : "text-ink-3"}>
          {sa.value}
        </span>
        <span className="mx-auto text-[10px] tracking-[0.14em] text-ink-3">{sa.key}</span>
        <span className={draw ? "text-ink-2" : !aWins ? "font-bold text-ink" : "text-ink-3"}>
          {sb.value}
        </span>
      </div>
      <div className="mt-1 flex h-1 overflow-hidden rounded-full bg-inset">
        <div className="h-full bg-accent transition-[width] duration-700" style={{ width: `${aPct}%` }} />
        <div className="h-full flex-1 bg-orange transition-[width] duration-700" />
      </div>
    </div>
  );
}

export default function Duel({ presets }: { presets: string[] }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [left, setLeft] = useState<Nutrition | null>(null);
  const [right, setRight] = useState<Nutrition | null>(null);
  const [busy, setBusy] = useState(false);
  const [png, setPng] = useState<Blob | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement | null>(null);

  const run = useCallback(async (ha: string, hb: string) => {
    const la = ha.trim().replace(/^@/, "");
    const lb = hb.trim().replace(/^@/, "");
    if (!la || !lb) return;
    setBusy(true);
    setPng(null);
    setNote(null);
    setLeft(null);
    setRight(null);
    const [ua, ub] = await Promise.all([fetchUser(la), fetchUser(lb)]);
    const da = analyze(la, ua);
    const db = analyze(lb, ub);
    setLeft(da);
    setRight(db);
    setBusy(false);
    /* the twin is off-screen but needs a frame to lay out before capture */
    setTimeout(() => {
      if (exportRef.current) renderPng(exportRef.current).then(setPng).catch(() => {});
    }, 500);
  }, []);

  const scoreA = left ? gradeScore(left) : 0;
  const scoreB = right ? gradeScore(right) : 0;
  const winner: Side | "draw" =
    Math.abs(scoreA - scoreB) < 0.5 ? "draw" : scoreA > scoreB ? "a" : "b";
  const champ = winner === "a" ? left : winner === "b" ? right : null;

  async function onShare() {
    if (!png || !left || !right) return;
    const how = await shareLabel(png, {
      ...(champ ?? left),
      login: `${left.login}-vs-${right.login}`,
    });
    if (how === "downloaded") setNote("Duel saved — attach it to the post X just opened.");
  }

  return (
    <main className="mx-auto w-full max-w-3xl overflow-x-clip px-4 py-10 sm:px-6 sm:py-16">
      <div className="mb-5 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="font-mono text-[11px] tracking-[0.16em] uppercase text-ink-3
            underline decoration-line-strong underline-offset-4 hover:text-ink"
        >
          ← Scanner
        </Link>
        <ThemeToggle />
      </div>

      <header className="text-center">
        <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-ink-3">
          Federal Dev Administration · Comparative Analysis
        </div>
        <h1 className="mt-3 text-[30px] leading-tight font-black tracking-tight sm:text-[44px]">
          Duel
        </h1>
        <p className="mt-2.5 text-[13.5px] text-ink-2">
          Two handles, two panels, one inspector&rsquo;s verdict.
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(a, b);
        }}
        className="mt-8 flex flex-col items-center gap-3"
      >
        <div className="flex w-full max-w-lg items-center gap-2">
          <input
            value={a}
            onChange={(e) => setA(e.target.value)}
            placeholder="first handle"
            aria-label="First GitHub handle"
            spellCheck={false}
            autoCapitalize="none"
            className="min-w-0 flex-1 rounded-full bg-surface px-4 py-2.5 text-[16px] text-ink
              shadow-btn outline-none placeholder:text-ink-3 sm:text-[14px]"
          />
          <span className="shrink-0 font-mono text-[12px] tracking-[0.14em] text-ink-3">VS</span>
          <input
            value={b}
            onChange={(e) => setB(e.target.value)}
            placeholder="second handle"
            aria-label="Second GitHub handle"
            spellCheck={false}
            autoCapitalize="none"
            className="min-w-0 flex-1 rounded-full bg-surface px-4 py-2.5 text-[16px] text-ink
              shadow-btn outline-none placeholder:text-ink-3 sm:text-[14px]"
          />
        </div>
        <Button type="submit" variant="primary" disabled={busy || !a.trim() || !b.trim()}>
          {busy ? "Inspecting both…" : "Start the duel"}
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            disabled={busy}
            onClick={() => (!a.trim() ? setA(p) : setB(p))}
            className="rounded-full transition-transform duration-150 active:scale-95
              disabled:pointer-events-none disabled:opacity-40"
            aria-label={`Add ${p}`}
          >
            <EntityChip name={p} />
          </button>
        ))}
      </div>

      {left && right && (
        <section className="mt-10">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-ink-3">
              Verdict
            </span>
            {winner === "draw" ? (
              <p className="text-[15px] font-bold text-ink">
                Dead heat — both panels grade the same.
              </p>
            ) : (
              <p className="text-[15px] font-bold text-ink">
                @{champ!.login} wins by {Math.abs(scoreA - scoreB).toFixed(1)} points
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-1.5">
              <ValuePill tone={winner === "a" ? "green" : "neutral"}>
                @{left.login} · {cardRating(left)}
              </ValuePill>
              <ValuePill tone={winner === "b" ? "green" : "neutral"}>
                @{right.login} · {cardRating(right)}
              </ValuePill>
            </div>

            {/* A duel between two fallbacks compares two hashes, not two
              * developers. Say so rather than letting it pass as a result. */}
            {(!left.real || !right.real) && (
              <p className="mt-1 max-w-md text-[12px] leading-relaxed text-orange">
                {!left.real && !right.real
                  ? "Both profiles are simulated — GitHub rate-limited the request, so this compares two hashes rather than two developers."
                  : `@${(!left.real ? left : right).login} is simulated — GitHub rate-limited that request, so this comparison is not meaningful.`}
              </p>
            )}
          </div>

          <div className="mx-auto mt-6 max-w-md rounded-card bg-surface p-4 shadow-btn">
            <div className="mb-2 flex items-baseline justify-between gap-2 text-[12.5px] font-medium">
              <span className="min-w-0 truncate text-ink">@{left.login}</span>
              <span className="min-w-0 truncate text-right text-ink">@{right.login}</span>
            </div>
            {cardStats(left).map((_, i) => (
              <StatRow key={i} a={left} b={right} i={i} />
            ))}
            <p className="mt-3 border-t border-line pt-2.5 font-mono text-[10.5px] text-ink-3">
              Lower wins on DBT and SOF. Everything else, higher.
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[left, right].map((d, i) => (
              <div key={d.login} className="flex flex-col items-center gap-2">
                {winner !== "draw" && (winner === "a") === (i === 0) && (
                  <span className="rounded-full bg-green-tint px-2.5 py-1 font-mono text-[10px] tracking-[0.16em] uppercase text-green">
                    Winner
                  </span>
                )}
                <NutritionLabel d={d} />
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-2">
            <Button variant="primary" onClick={onShare} disabled={!png} className="whitespace-nowrap">
              {png ? "Share the duel" : "Preparing image…"}
            </Button>
            <Button
              variant="secondary"
              disabled={!png}
              onClick={() => png && saveFile(png, `${left.login}-vs-${right.login}`)}
              className="whitespace-nowrap"
            >
              Download
            </Button>
          </div>
          {note && <p className="mt-3 text-center text-[12.5px] text-ink-2">{note}</p>}
        </section>
      )}

      {/* off-screen twin: both panels side by side at export width */}
      {left && right && (
        <div aria-hidden className="pointer-events-none fixed top-0 -left-[9999px]">
          <div ref={exportRef} className="flex gap-4 bg-white p-4">
            <NutritionLabel d={left} mode="export" />
            <NutritionLabel d={right} mode="export" />
          </div>
        </div>
      )}

      <footer className="mt-16 text-center font-mono text-[10px] tracking-[0.18em] uppercase text-ink-3">
        Satire. Not affiliated with GitHub or any food authority.
      </footer>
    </main>
  );
}
