import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NutritionLabel from "@/components/NutritionLabel";
import ThemeToggle from "@/components/ThemeToggle";
import { ValuePill } from "@/components/atoms/ValuePill";
import { analyze, gradeNote, n, SITE_URL, type Nutrition } from "@/lib/nutrition";
import { cardPosition, cardRating, cardStats } from "@/lib/card";
import { ghUser } from "@/lib/github";

/* A permanent, shareable address for one developer's panel. This is what a
 * link on X or Slack resolves to, and what gives the unfurl a thumbnail worth
 * showing — the sibling opengraph-image.tsx renders this same data. */

export const revalidate = 3600;

const HANDLE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

async function load(login: string): Promise<Nutrition | null> {
  if (!HANDLE.test(login)) return null;
  return analyze(login, await ghUser(login));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ login: string }>;
}): Promise<Metadata> {
  const { login } = await params;
  const clean = decodeURIComponent(login);
  const d = await load(clean);
  if (!d) return { title: "Unknown handle" };

  const title = `@${d.login} — Grade ${d.grade}`;
  const description =
    `@${d.login} scores ${cardRating(d)}/99 (${cardPosition(d)}) on DevNutrition: ` +
    `${n(d.caffeine)}mg caffeine, ${n(d.debt)}% saturated tech debt, ${d.docs}% documentation, ` +
    `${d.aura}% raw aura. ${gradeNote(d.grade)}`;

  return {
    title,
    description,
    alternates: { canonical: `/u/${d.login}` },
    openGraph: { type: "profile", title, description, url: `${SITE_URL}/u/${d.login}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function UserPage({ params }: { params: Promise<{ login: string }> }) {
  const { login } = await params;
  const d = await load(decodeURIComponent(login));
  if (!d) notFound();

  const stats = cardStats(d);

  return (
    <main className="mx-auto w-full max-w-2xl overflow-x-clip px-4 py-10 sm:px-6 sm:py-16">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="font-mono text-[11px] tracking-[0.16em] uppercase text-ink-3
            underline decoration-line-strong underline-offset-4 hover:text-ink"
        >
          ← DevNutrition
        </Link>
        <ThemeToggle />
      </div>

      <header className="text-center">
        <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-ink-3">
          Federal Dev Administration · Certified panel
        </div>
        <h1 className="mt-3 text-[28px] leading-tight font-black tracking-tight sm:text-[40px]">
          @{d.login}
        </h1>
        <p className="mt-2 text-[13.5px] text-ink-2">
          Grade {d.grade} · {cardPosition(d)} · rated {cardRating(d)}/99. {gradeNote(d.grade)}
        </p>
      </header>

      <div className="mt-8 flex justify-center">
        <NutritionLabel d={d} />
      </div>

      <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-1.5">
        {stats.map((st) => (
          <ValuePill key={st.key} tone="neutral">
            {st.key} {String(st.value).padStart(2, "0")}
          </ValuePill>
        ))}
      </div>

      {/* plain prose under the artifact: the part an answer engine can quote */}
      <section className="mx-auto mt-8 max-w-md text-[13.5px] leading-relaxed text-ink-2">
        <p>
          This panel was generated from <strong className="text-ink">@{d.login}</strong>&rsquo;s
          public GitHub profile: {n(d.repos)} public repositories, {n(d.followers)} followers, and{" "}
          {d.years} years on the platform. Those three figures produce the letter grade; the
          caffeine, tech debt, documentation and dependency figures are invented for comedic
          effect and are stable per handle rather than measured.{" "}
          <Link
            href="/scoring"
            className="underline decoration-line-strong underline-offset-4 hover:text-ink"
          >
            The full method is documented here.
          </Link>
        </p>
      </section>

      <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-center text-[12.5px] text-ink-2">
        <Link href="/" className="underline decoration-line-strong underline-offset-4 hover:text-ink">
          Scan another developer
        </Link>
        <Link href="/duel" className="underline decoration-line-strong underline-offset-4 hover:text-ink">
          Compare two developers
        </Link>
      </div>

      <footer className="mt-16 text-center font-mono text-[10px] tracking-[0.18em] uppercase text-ink-3">
        Satire. Not affiliated with GitHub or any food authority.
      </footer>
    </main>
  );
}
