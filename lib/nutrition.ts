/* The audit itself: real public GitHub data where we can get it, a
 * handle-seeded fallback where we cannot. Same handle always yields the
 * same label — the joke only lands if the numbers are stable. */

export type Nutrition = {
  login: string;
  name: string;
  avatar: string | null;
  /* profile colour, shown on the panel when GitHub gives it to us */
  bio: string | null;
  company: string | null;
  location: string | null;
  gists: number;
  following: number;
  real: boolean;
  repos: number;
  followers: number;
  years: string;
  servings: number;
  calories: number;
  caffeine: number;
  debt: number;
  docs: number;
  stackOverflow: number;
  npm: number;
  aura: number;
  grade: Grade;
  batch: string;
  bestBefore: string;
  barcode: number[];
};

/* A health-inspection letter, weighted so most working developers land
 * somewhere unflattering. That is the joke. */
export type Grade = "A+" | "A" | "B" | "C" | "D" | "F";

const GRADE_NOTE: Record<Grade, string> = {
  "A+": "Certified organic. Feeds thousands.",
  A: "Grade A. Widely consumed.",
  B: "Wholesome. Ships on Fridays.",
  C: "Consume with supervision.",
  D: "Do not deploy on a Friday.",
  F: "Condemned by inspectors.",
};

export const gradeNote = (g: Grade) => GRADE_NOTE[g];

export const fnv = (s: string) => {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return h;
};

type GhUser = {
  login?: string;
  name?: string | null;
  avatar_url?: string;
  bio?: string | null;
  company?: string | null;
  location?: string | null;
  public_repos?: number;
  public_gists?: number;
  followers?: number;
  following?: number;
  created_at?: string;
};

/* Client-side scans go through our own route, not straight to GitHub: the
 * route attaches the server's token, so every visitor shares the 5,000/hour
 * budget instead of burning their own IP's 60. Server components call
 * lib/github.ts directly. */
export async function fetchUser(login: string): Promise<GhUser | null> {
  try {
    const res = await fetch(`/api/gh/${encodeURIComponent(login)}`);
    return res.ok ? await res.json() : null;
  } catch {
    return null; // offline or rate-limited: the label still gets made
  }
}

export function analyze(login: string, u: GhUser | null): Nutrition {
  const h = fnv(login.toLowerCase());
  /* deterministic pseudo-random in [min,max], one independent draw per index */
  const r = (i: number, min: number, max: number) =>
    min + Math.round((((h >>> (i * 3)) % 997) / 997) * (max - min));

  const repos = u?.public_repos ?? r(9, 12, 210);
  const followers = u?.followers ?? r(10, 40, 9000);
  const years = u?.created_at
    ? (Date.now() - Date.parse(u.created_at)) / 31557600000
    : 9 + (h % 60) / 10;

  const base: Nutrition = {
    login: u?.login ?? login,
    name: u?.name || (u?.login ?? login),
    avatar: u?.avatar_url ?? null,
    bio: u?.bio?.trim() || null,
    company: u?.company?.trim() || null,
    location: u?.location?.trim() || null,
    gists: u?.public_gists ?? 0,
    following: u?.following ?? 0,
    real: !!u,
    repos,
    followers,
    years: years.toFixed(1),
    servings: Math.round(repos * (18 + (h % 41)) + followers / 3) + 1,
    calories: 2400 + r(1, 0, 900),
    caffeine: 380 + Math.round(Math.log2(followers + 2) * 68) + r(2, 0, 260),
    debt: 620 + r(3, 0, 1800),
    docs: r(4, 0, 4),
    stackOverflow: r(5, 22, 88),
    npm: 120 + r(6, 0, 640),
    aura: Math.min(99, Math.round(Math.log10(followers + 10) * 25) + r(7, 0, 18)),
    grade: "F" as Grade, // replaced below, once the inputs it grades exist
    batch: `LOT ${(h % 899999 + 100000).toString(36).toUpperCase()}-${(repos % 99) + 1}`,
    /* an expiry a couple of quarters out — long enough to be plausible,
     * short enough to be a threat */
    bestBefore: new Date(Date.now() + (90 + (h % 270)) * 864e5)
      .toISOString()
      .slice(0, 10),
    /* deterministic bar widths, so a handle always prints the same code */
    barcode: Array.from({ length: 44 }, (_, i) => ((h >>> (i % 27)) % 3) + 1),
  };

  base.grade = gradeFor(base);
  return base;
}

export const REPO_URL = "https://github.com/codebyNJ/devnutrition";

/* Absolute origin, needed for metadataBase, canonicals, sitemap and OG image
 * URLs. Overridable so preview deployments describe themselves correctly. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://devnutrie.vercel.app"
).replace(/\/$/, "");

export const n = (x: number) => x.toLocaleString("en-US");

/* The grade is earned from what a public profile actually shows: reach,
 * output, and how long they have been at it. The invented metrics only nudge
 * it.
 *
 * An earlier version let those invented metrics dominate, which handed an F to
 * people whose entire visible record is years of open source. That was the
 * model being wrong, not the joke landing — a satire of nutrition labels can
 * be absurd about tech debt while still being fair about who ships.
 *
 * Reach is capped highest: it is the one signal that cannot be inflated by
 * pushing more repositories. It is log-scaled so the very top of GitHub does
 * not run away with the scale. */
export type GradeInputs = {
  followers: number;
  repos: number;
  years: string;
  docs: number;
  debt: number;
  stackOverflow: number;
};

export function gradeScore(d: GradeInputs): number {
  const reach = Math.min(45, Math.log10(d.followers + 1) * 8.2);
  const output = Math.min(20, Math.log10(d.repos + 1) * 7);
  const tenure = Math.min(12, Number(d.years) * 0.85);
  const craft = d.docs * 2 - d.debt / 500 - d.stackOverflow * 0.06;
  return reach + output + tenure + craft;
}

const BANDS: [number, Grade][] = [
  [66, "A+"],
  [55, "A"],
  [44, "B"],
  [33, "C"],
  [22, "D"],
];

function gradeFor(d: GradeInputs): Grade {
  const score = gradeScore(d);
  return BANDS.find(([min]) => score >= min)?.[1] ?? "F";
}
