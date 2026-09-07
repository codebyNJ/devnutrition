import "server-only";

/* The only place a GitHub token is read. `server-only` makes importing this
 * from a client component a build error rather than a leak — the token must
 * never reach the browser, so client-side scans go through /api/gh instead.
 *
 * Unauthenticated GitHub allows 60 requests/hour per IP, which a handful of
 * visitors exhausts; a token raises that to 5,000. */

export type GhUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
};

/* Only the fields the panel uses are passed on — the upstream payload carries
 * plenty we have no business forwarding to the browser. */
const pick = (u: Record<string, unknown>): GhUser => ({
  login: String(u.login ?? ""),
  name: (u.name as string) ?? null,
  avatar_url: String(u.avatar_url ?? ""),
  bio: (u.bio as string) ?? null,
  company: (u.company as string) ?? null,
  location: (u.location as string) ?? null,
  public_repos: Number(u.public_repos ?? 0),
  public_gists: Number(u.public_gists ?? 0),
  followers: Number(u.followers ?? 0),
  following: Number(u.following ?? 0),
  created_at: String(u.created_at ?? ""),
});

export const hasToken = () => !!process.env.GITHUB_TOKEN;

export async function ghUser(login: string): Promise<GhUser | null> {
  const clean = login.trim().replace(/^@/, "");
  /* GitHub handles are alphanumeric with single hyphens; anything else is not
   * worth a round-trip and must not be pasted into a URL */
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(clean)) return null;

  const token = process.env.GITHUB_TOKEN;
  try {
    const res = await fetch(`https://api.github.com/users/${clean}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: 900 },
    });
    if (!res.ok) return null;
    return pick(await res.json());
  } catch {
    return null; // the panel still prints, and says it is simulated
  }
}

export async function ghStars(owner: string, repo: string): Promise<number | null> {
  const token = process.env.GITHUB_TOKEN;
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: 900 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return typeof json.stargazers_count === "number" ? json.stargazers_count : null;
  } catch {
    return null;
  }
}
