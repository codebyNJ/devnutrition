/* The audit itself: real public GitHub data where we can get it, a
 * handle-seeded fallback where we cannot. Same handle always yields the
 * same label — the joke only lands if the numbers are stable. */

export type Nutrition = {
  login: string;
  name: string;
  avatar: string | null;
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
export type Grade = "A" | "B" | "C" | "D" | "F";

const GRADE_NOTE: Record<Grade, string> = {
  A: "Exemplary. Suspiciously so.",
  B: "Edible. Ships on Fridays.",
  C: "Consume with supervision.",
  D: "Do not deploy on a Friday.",
  F: "Condemned by inspectors.",
};

export const gradeNote = (g: Grade) => GRADE_NOTE[g];

const fnv = (s: string) => {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return h;
};

type GhUser = {
  login?: string;
  name?: string | null;
  avatar_url?: string;
  public_repos?: number;
  followers?: number;
  created_at?: string;
};

export async function fetchUser(login: string): Promise<GhUser | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(login)}`);
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

export const n = (x: number) => x.toLocaleString("en-US");

function gradeFor(d: {
  aura: number; docs: number; debt: number; stackOverflow: number;
}): Grade {
  const score =
    40 + d.aura * 0.45 + d.docs * 9 - d.debt / 55 - d.stackOverflow * 0.28;
  if (score >= 68) return "A";
  if (score >= 56) return "B";
  if (score >= 44) return "C";
  if (score >= 32) return "D";
  return "F";
}
