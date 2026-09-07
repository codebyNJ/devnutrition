import Link from "next/link";
import type { Metadata } from "next";
import { GRADE_BANDS, GRADE_FORMULA, GRADE_TERMS, METRICS } from "@/lib/scoring";
import { REPO_URL, SITE_URL } from "@/lib/nutrition";

export const metadata: Metadata = {
  title: "How the scoring works",
  description:
    "Exactly which numbers come from a real GitHub profile, which are invented, and how the DevNutrition letter grade is calculated.",
  alternates: { canonical: "/scoring" },
  openGraph: {
    type: "article",
    title: "How DevNutrition scores a GitHub developer",
    description:
      "Which numbers come from a real GitHub profile, which are invented, and the exact formula behind the letter grade.",
    url: `${SITE_URL}/scoring`,
  },
  twitter: {
    card: "summary_large_image",
    title: "How DevNutrition scores a GitHub developer",
    description:
      "Which numbers come from a real GitHub profile, which are invented, and the exact formula behind the letter grade.",
  },
};

/* FAQ structured data. These are the questions an answer engine actually gets
 * asked about a tool like this, and the honest answers are short — which makes
 * them quotable. */
const FAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      q: "What data does DevNutrition read from GitHub?",
      a: "Three fields from one unauthenticated request to api.github.com/users/{handle}: public_repos, followers and created_at. No commits are read, no code is cloned, and nothing is stored.",
    },
    {
      q: "Are the nutrition numbers real measurements?",
      a: "No. Caffeine, saturated tech debt, documentation, Stack Overflow copy-paste and unused npm dependencies are invented. They are derived deterministically from a hash of the handle, so they never change for a given developer, but they measure nothing.",
    },
    {
      q: "How is the letter grade calculated?",
      a: "From three real signals plus a small invented nudge: reach = min(45, log10(followers + 1) x 8.2), output = min(20, log10(public_repos + 1) x 7), tenure = min(12, account age in years x 0.85), and craft = documentation x 2 minus techDebt/500 minus stackOverflow x 0.06. A+ is 66 and up, A is 55, B is 44, C is 33, D is 22, and anything lower is F.",
    },
    {
      q: "Does DevNutrition measure code quality?",
      a: "No, and it does not claim to. A public profile shows reach, output and tenure; it does not show what the inside of a codebase looks like.",
    },
    {
      q: "Is it free, and does it need a login?",
      a: "It is free and needs no account. It reads only public profile data.",
    },
  ].map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const TONE: Record<string, string> = {
  "A+": "text-green",
  A: "text-green",
  B: "text-green",
  C: "text-orange",
  D: "text-orange",
  F: "text-red",
};

export default function ScoringPage() {
  const grounded = METRICS.filter((m) => m.grounded);

  return (
    <main className="mx-auto w-full max-w-2xl overflow-x-clip px-4 py-10 sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ) }}
      />
      <Link
        href="/"
        className="font-mono text-[11px] tracking-[0.16em] uppercase text-ink-3
          underline decoration-line-strong underline-offset-4 hover:text-ink"
      >
        ← Back to the scanner
      </Link>

      <header className="mt-8">
        <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-ink-3">
          Federal Dev Administration · Methodology
        </div>
        <h1 className="mt-3 text-[26px] leading-tight font-black tracking-tight sm:text-4xl">
          How the scoring works
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
          Short version: {grounded.length} of the {METRICS.length} values on the panel are
          derived from a real GitHub profile, and the letter grade is built almost entirely
          from real ones. The rest are invented — deterministically, so they never change
          for a given handle, but invented all the same. This page says which is which,
          because a joke that quietly pretends to be a measurement is just a lie with
          better typography.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-ink-3">
          What is actually read
        </h2>
        <div className="mt-3 rounded-card bg-surface p-4 shadow-btn">
          <p className="text-[13.5px] leading-relaxed text-ink-2">
            One unauthenticated request to{" "}
            <code className="rounded-chip bg-field px-1.5 py-0.5 font-mono text-[12px] text-ink">
              api.github.com/users/&#123;handle&#125;
            </code>
            , from which three fields are used: <strong className="text-ink">public_repos</strong>,{" "}
            <strong className="text-ink">followers</strong> and{" "}
            <strong className="text-ink">created_at</strong>. No commits are read, no code is
            cloned, nothing is stored. When GitHub rate-limits the request the panel still
            prints, and its footer says <em>Simulated</em> rather than claiming the numbers
            are real.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-ink-3">
          The seeded values
        </h2>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">
          Anything marked <em>invented</em> comes from an FNV-1a hash of the lowercased
          handle. That makes every number stable — scan the same developer twice and the
          panel is identical — without claiming to have measured something it cannot see.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-ink-3">
          Line by line
        </h2>

        {METRICS.map((m) => (
          <article key={m.key} className="rounded-card bg-surface p-4 shadow-btn">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-[14px] font-bold text-ink">{m.label}</h3>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase ${
                  m.grounded ? "bg-green-tint text-green" : "bg-orange-tint text-orange"
                }`}
              >
                {m.grounded ? "from profile" : "invented"}
              </span>
              <span className="font-mono text-[11px] text-ink-3">inputs: {m.inputs}</span>
            </div>

            <pre className="mt-3 overflow-x-auto rounded-chip bg-field px-3 py-2 font-mono text-[11.5px] text-ink">
              {m.formula}
            </pre>

            <p className="mt-2.5 text-[13px] leading-relaxed text-ink-2">{m.blurb}</p>
          </article>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-ink-3">
          The letter grade
        </h2>
        <div className="mt-3 rounded-card bg-surface p-4 shadow-btn">
          <pre className="overflow-x-auto rounded-chip bg-field px-3 py-2 font-mono text-[11.5px] text-ink">
            score = {GRADE_FORMULA}
          </pre>

          <p className="mt-3 text-[13px] leading-relaxed text-ink-2">
            Three of those four terms come from the profile. An earlier version of this
            page described a formula built mostly out of the invented metrics — it graded
            career open-source maintainers an <strong className="text-ink">F</strong>,
            which was the model being wrong rather than the joke landing.
          </p>

          <div className="mt-4 space-y-2">
            {GRADE_TERMS.map((t) => (
              <div key={t.name} className="rounded-chip bg-field p-3">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-[13px] font-bold text-ink">{t.name}</span>
                  <span className="font-mono text-[11px] text-ink-3">up to {t.max}</span>
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 font-mono text-[9.5px] tracking-wide uppercase ${
                      t.grounded ? "bg-green-tint text-green" : "bg-orange-tint text-orange"
                    }`}
                  >
                    {t.grounded ? "from profile" : "invented"}
                  </span>
                </div>
                <pre className="mt-2 overflow-x-auto font-mono text-[11px] text-ink-2">
                  {t.formula}
                </pre>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">{t.blurb}</p>
              </div>
            ))}
          </div>
          <ul className="mt-4 space-y-2">
            {GRADE_BANDS.map((b) => (
              <li key={b.grade} className="flex items-center gap-3">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full border-2
                    border-current text-[15px] font-black ${TONE[b.grade]}`}
                >
                  {b.grade}
                </span>
                <span className="font-mono text-[12px] tabular-nums text-ink-2">
                  {b.min === -Infinity ? "below 32" : `${b.min} and up`}
                </span>
                <span className="ml-auto text-right text-[12.5px] text-ink-3">{b.note}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] leading-relaxed text-ink-2">
            Reach carries the most weight because it is the hardest term to inflate:
            publishing five thousand empty repositories moves Output by its cap of 20 and
            leaves Reach untouched. Craft can push a panel across a boundary; it can no
            longer decide one on its own.
          </p>
        </div>
      </section>

      <section className="mt-10 rounded-card border border-line bg-inset p-4">
        <h2 className="text-[13.5px] font-bold text-ink">Is any of this real?</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
          The profile fields are. The nutrition science is not. DevNutrition is satire, is
          not affiliated with GitHub or any food authority, and should not be used to make
          hiring decisions, code review decisions, or dietary ones. The source is on{" "}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-line-strong underline-offset-4 hover:text-ink"
          >
            GitHub
          </a>{" "}
          if you would rather read the arithmetic than trust this page about it.
        </p>
      </section>

      <footer className="mt-12 text-center">
        <Link
          href="/"
          className="text-[13px] text-ink-2 underline decoration-line-strong underline-offset-4 hover:text-ink"
        >
          Inspect a developer →
        </Link>
      </footer>
    </main>
  );
}
