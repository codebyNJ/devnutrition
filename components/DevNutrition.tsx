"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import HandleInput from "@/components/HandleInput";
import ThemeToggle from "@/components/ThemeToggle";
import ScoreMeter from "@/components/ScoreMeter";
import ProfileContext from "@/components/ProfileContext";
import Advisory from "@/components/Advisory";
import ExampleGallery from "@/components/ExampleGallery";
import StarButton from "@/components/StarButton";
import Link from "next/link";
import LoadingState from "@/components/primitives/LoadingState";
import ThinkingState from "@/components/primitives/ThinkingState";
import ToolChips, { type ToolStep, type ToolDiff } from "@/components/primitives/ToolChips";
import TaskRows, { type TaskRow } from "@/components/primitives/TaskRows";
import StreamingText, { type StreamingToken } from "@/components/primitives/StreamingText";
import { Button } from "@/components/atoms/Button";
import { EntityChip } from "@/components/atoms/EntityChip";
import { ValuePill } from "@/components/atoms/ValuePill";
import NutritionLabel from "@/components/NutritionLabel";
import { analyze, fetchUser, gradeNote, n, type Nutrition } from "@/lib/nutrition";
import { totalRunMs } from "@/lib/scoring";
import { renderPng, shareLabel, saveFile } from "@/lib/share";

type Phase = "idle" | "scanning" | "closing" | "done";

/* src="" makes the browser re-request the current page, so a profile with no
 * avatar gets this inline mark instead of an empty string. */
const FALLBACK_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="%23d4d4d8"/><circle cx="12" cy="9.5" r="3.6" fill="%23fff"/><path d="M4.6 21a7.6 7.6 0 0 1 14.8 0z" fill="%23fff"/></svg>',
  );

const GRADE_TONE: Record<Nutrition["grade"], string> = {
  "A+": "text-green",
  A: "text-green",
  B: "text-green",
  C: "text-orange",
  D: "text-orange",
  F: "text-red",
};

/* Beats of the audit, ms from the moment Inspect is pressed. Each primitive
 * starts its own animation when it mounts, so mounting them on these beats is
 * what sequences the run. The run length itself comes from the handle (see
 * totalRunMs) so no two developers scan at the same pace; CLOSE_MS is the fade
 * before the label takes the stage. */
const STEP_AT = [300, 1600, 3000];
const CLOSE_MS = 420;

const PRESETS = [
  { name: "torvalds", color: "var(--orange)" },
  { name: "karpathy", color: "var(--accent)" },
  { name: "sindresorhus", color: "var(--green)" },
  { name: "shadcn", color: "var(--ink-2)" },
];

const TOOL_STEPS: ToolStep[] = [
  {
    icon: "run", label: "Scan profile", chip: "fetch_repo_density()", mono: true, detailMono: true,
    detail: [
      { text: "GET api.github.com/users/:handle → 200" },
      { text: "repos, followers and account age parsed" },
    ],
  },
  {
    icon: "think", label: "Measure stimulants", chip: "calculate_caffeine_index()", mono: true, detailMono: true,
    detail: [
      { text: "commit timestamps cluster after 23:00" },
      { text: "caffeine index scaled against reach" },
    ],
  },
  {
    icon: "read", label: "Probe for docs", chip: "test_documentation_void()", mono: true, detailMono: true,
    detail: [
      { text: "README found · contents: one badge" },
      { text: "void confirmed, trace amounts only" },
    ],
  },
];

const TOOL_DIFFS: ToolDiff[] = [
  { file: "nutrition-label.tsx", add: 42, del: 0 },
  { file: "ingredients.json", add: 18, del: 3 },
];

const TASKS: TaskRow[] = [
  {
    key: "parsed", label: "Public activity parsed", amount: "1 profile", status: "done",
    details: [
      { label: "Repositories weighed", meta: "all public" },
      { label: "Account age measured", meta: "years" },
    ],
  },
  {
    key: "toxic", label: "Toxic additives flagged", amount: "6 found", status: "done",
    details: [
      { label: "Saturated tech debt", meta: "high" },
      { label: "Unused npm dependencies", meta: "by weight" },
    ],
  },
  {
    key: "certified", label: "Certified by the FDA", amount: "1 label", status: "done",
    details: [
      { label: "Federal Dev Administration", meta: "panel typeset" },
      { label: "Warning box attached", meta: "mandatory" },
    ],
  },
];

const VERDICT: StreamingToken[] = [
  { text: "Analysis complete." },
  { text: " This developer runs on purified espresso, late-night commit regret," },
  { text: " unformatted JSON and broken unit tests, with traces of rust and" },
  { text: " hallucinated APIs. Documentation was detected only in trace amounts." },
  { text: " Handle with care." },
];

export default function DevNutrition({
  examples,
  stars,
}: {
  /** scanned server-side so the gallery has real grades on first paint */
  examples: Nutrition[];
  stars: number | null;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [handle, setHandle] = useState<string | null>(null);
  const [result, setResult] = useState<Nutrition | null>(null);
  const [png, setPng] = useState<Blob | null>(null);
  /* separate from `result`, which gates the reveal: the readout needs the
   * numbers as soon as they land, and a ref would not re-render it */
  const [scanned, setScanned] = useState<Nutrition | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const pending = useRef<Nutrition | null>(null);
  const timelineDone = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const exportRef = useRef<HTMLDivElement | null>(null);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  /* The label lands only when BOTH the run has played out and the profile has
   * come back — never mid-animation. Each primitive drives its own internal
   * timeline once mounted, and they are longer than any single onSettled
   * callback, so the sequence is orchestrated here rather than trusting one
   * component to say when the whole run is over. */
  const tryClose = useCallback(() => {
    if (!timelineDone.current || !pending.current) return;
    setPhase((current) => {
      if (current !== "scanning") return current;
      timers.current.push(
        setTimeout(() => {
          setResult(pending.current);
          setPhase("done");
        }, CLOSE_MS),
      );
      return "closing";
    });
  }, []);

  const inspect = useCallback(
    async (raw: string) => {
      const login = raw.trim().replace(/^@/, "").split("/").pop() ?? "";
      if (!login) return;

      clearTimers();
      pending.current = null;
      timelineDone.current = false;
      setResult(null);
      setScanned(null);
      setPng(null);
      setNote(null);
      setHandle(login);
      setStep(0);
      setPhase("scanning");

      STEP_AT.forEach((ms, i) =>
        timers.current.push(setTimeout(() => setStep(i + 1), ms)),
      );
      timers.current.push(
        setTimeout(() => {
          timelineDone.current = true;
          tryClose();
        }, totalRunMs(login)),
      );

      const preloaded = examples.find(
        (e) => e.login.toLowerCase() === login.toLowerCase(),
      );
      const data = preloaded ?? analyze(login, await fetchUser(login));
      pending.current = data;
      setScanned(data);
      tryClose();
    },
    [tryClose, examples],
  );

  /* Render the PNG as soon as the label exists, not when Share is tapped:
   * iOS only honours navigator.share() from inside the tap, and awaiting a
   * canvas render first loses that user gesture. */
  useEffect(() => {
    if (!result || !exportRef.current) return;
    let live = true;
    const id = setTimeout(() => {
      if (!exportRef.current) return;
      renderPng(exportRef.current)
        .then((b) => live && setPng(b))
        .catch(() => live && setNote("Couldn't render the image — the label is still on screen."));
    }, 350); // let the avatar and web fonts land first
    return () => {
      live = false;
      clearTimeout(id);
    };
  }, [result]);

  async function onShare() {
    if (!result || !png) return;
    const how = await shareLabel(png, result);
    if (how === "downloaded") setNote("Label saved — attach it to the post X just opened.");
  }

  function reset() {
    clearTimers();
    setPhase("idle");
    setHandle(null);
    setResult(null);
    setScanned(null);
    setPng(null);
    setNote(null);
    setStep(0);
    pending.current = null;
    timelineDone.current = false;
  }

  const running = phase === "scanning" || phase === "closing";

  return (
    /* overflow-x-clip is the backstop: every child is sized to fit, but one
     * long unbroken string should never make the whole page pan sideways */
    <main className="mx-auto w-full max-w-2xl overflow-x-clip px-4 py-10 sm:px-6 sm:py-16">
      <header className="text-center">
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-3">
            F.D.A.
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/duel"
              className="inline-flex h-9 items-center rounded-full bg-surface px-3 text-[12.5px]
                font-medium text-ink shadow-btn transition-colors duration-150 hover:bg-hover
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Duel
            </Link>
            <StarButton stars={stars} />
            <ThemeToggle />
          </div>
        </div>
        <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-ink-3 sm:text-[10.5px]">
          Federal Dev Administration
        </div>
        <h1 className="mt-3 text-[30px] leading-tight font-black tracking-tight sm:text-[44px]">
          DevNutrition
        </h1>
        <p className="mt-2.5 text-[13.5px] text-ink-2 sm:text-[14px]">
          Scan any GitHub handle. Receive its nutritional truth.
        </p>
      </header>

      <div className="mt-8 flex justify-center">
        <HandleInput onSubmit={inspect} busy={running} />
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => inspect(p.name)}
            disabled={running}
            className="rounded-full transition-transform duration-150 active:scale-95
              disabled:pointer-events-none disabled:opacity-40"
            aria-label={`Inspect ${p.name}`}
          >
            <EntityChip name={p.name} color={p.color} />
          </button>
        ))}
      </div>

      {phase === "idle" && (
        <>
          <ExampleGallery examples={examples} onPick={inspect} />
          <p className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-center text-[12.5px] text-ink-2">
            <Link
              href="/duel"
              className="underline decoration-line-strong underline-offset-4 hover:text-ink"
            >
              Compare two developers
            </Link>
            <Link
              href="/scoring"
              className="underline decoration-line-strong underline-offset-4 hover:text-ink"
            >
              How the scoring works
            </Link>
          </p>
        </>
      )}

      {running && (
        <section
          key={handle}
          className={`mt-10 flex flex-col items-center gap-6 ${
            phase === "closing" ? "animate-agent-out" : ""
          }`}
        >
          <LoadingState variant="Dots" label={`Auditing @${handle}`} />
          <ScoreMeter key={handle} login={handle!} data={scanned} />
          {scanned && (
            <div className="w-full max-w-md">
              <ProfileContext d={scanned} />
            </div>
          )}
          {step >= 1 && (
            <div className="w-full max-w-md">
              <ThinkingState variant="DevNutrition" />
            </div>
          )}
          {step >= 2 && (
            <div className="w-full max-w-md">
              <ToolChips
                steps={TOOL_STEPS}
                diffs={TOOL_DIFFS}
                labels={{ header: "3 tool calls, 1 audit", more: "+1 more" }}
              />
            </div>
          )}
          {step >= 3 && (
            <div className="w-full max-w-md">
              <TaskRows rows={TASKS} />
            </div>
          )}
        </section>
      )}

      {result && (
        <section className="mt-10">
          {/* verdict line: who, what grade, and the inspector's note — the
              summary someone reads before deciding to look at the panel */}
          <div className="animate-label-in mb-5 flex flex-col items-center gap-2 text-center">
            <span className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-ink-3">
              Inspection complete
            </span>
            <div className="flex items-center gap-3">
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-full border-2
                  border-current text-[17px] font-black ${GRADE_TONE[result.grade]}`}
                aria-hidden
              >
                {result.grade}
              </span>
              <span className="text-left">
                <span className="block text-[15px] font-bold text-ink">@{result.login}</span>
                <span className="block text-[12.5px] text-ink-2">{gradeNote(result.grade)}</span>
              </span>
            </div>
          </div>

          <div className="animate-label-in flex w-full justify-center">
            <NutritionLabel d={result} />
          </div>

          {/* the flagged additives, in the library's own pills — the panel
              itself stays plain black on white */}
          <div className="mx-auto mt-6 max-w-md">
            <h3 className="mb-2 text-center font-mono text-[10px] tracking-[0.2em] uppercase text-ink-3">
              Flagged additives
            </h3>
            <div className="flex flex-wrap justify-center gap-1.5">
              <ValuePill tone="red">Tech debt {n(result.debt)}%</ValuePill>
              <ValuePill tone="orange">Caffeine {n(result.caffeine)}mg</ValuePill>
              <ValuePill tone="green">Docs {result.docs}%</ValuePill>
              <ValuePill tone="accent">Aura {result.aura}%</ValuePill>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Advisory d={result} />
          </div>

          <div className="mx-auto mt-6 max-w-md rounded-card bg-surface p-4 shadow-btn">
            <StreamingText
              content={VERDICT}
              loop={false}
              fill
              followUps={PRESETS.filter((p) => p.name !== result.login).map(
                (p) => `Inspect @${p.name}`,
              )}
              onFollowUp={(text) => inspect(text.replace("Inspect @", ""))}
              labels={{ sources: "1 source" }}
              sources={[
                {
                  name: "GitHub",
                  domain: "github.com",
                  href: `https://github.com/${result.login}`,
                  image: result.avatar || FALLBACK_AVATAR,
                },
              ]}
            />
          </div>

          <div className="mt-7 flex flex-col items-center gap-3">
            <div className="flex w-full max-w-md flex-wrap justify-center gap-2">
              {/* auto width, wrapping as a group — flex-1 squeezed the third
                  pill until its label broke across two lines on a phone */}
              <Button variant="primary" onClick={onShare} disabled={!png} className="whitespace-nowrap">
                {png ? "Share on X" : "Preparing image…"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => png && result && saveFile(png, result.login)}
                disabled={!png}
                className="whitespace-nowrap"
              >
                Download
              </Button>
              <Button variant="ghost" onClick={reset} className="whitespace-nowrap">
                Scan another
              </Button>
            </div>

            {note && <p className="max-w-md text-center text-[12.5px] text-ink-2">{note}</p>}

            <Link
              href="/scoring"
              className="font-mono text-[11px] tracking-[0.14em] uppercase text-ink-3
                underline decoration-line-strong underline-offset-4 hover:text-ink"
            >
              How is this scored?
            </Link>
          </div>
        </section>
      )}

      <footer className="mt-16 text-center font-mono text-[10px] tracking-[0.18em] uppercase text-ink-3">
        Satire. Not affiliated with GitHub or any food authority.
      </footer>

      {/* Off-screen twin at a locked 540px → a 1080px PNG that looks the same
          whether it was shared from a phone or a desktop. */}
      {result && (
        <div aria-hidden className="pointer-events-none fixed top-0 -left-[9999px]">
          <NutritionLabel d={result} mode="export" panelRef={exportRef} />
        </div>
      )}
    </main>
  );
}
