import DevNutrition from "@/components/DevNutrition";
import { analyze, fetchUser, REPO_URL, type Nutrition } from "@/lib/nutrition";

/* Examples and the star count are fetched here, on the server, so the page
 * opens with real grades instead of an empty state — and so four extra GitHub
 * calls do not come out of every visitor's rate limit. */
export const revalidate = 3600;

const EXAMPLE_HANDLES = ["torvalds", "karpathy", "sindresorhus", "shadcn"];

async function loadExamples(): Promise<Nutrition[]> {
  const users = await Promise.all(EXAMPLE_HANDLES.map(fetchUser));
  return users.map((u, i) => analyze(EXAMPLE_HANDLES[i], u));
}

async function loadStars(): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${new URL(REPO_URL).pathname.slice(1)}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return typeof json.stargazers_count === "number" ? json.stargazers_count : null;
  } catch {
    return null; // the page is not worth failing over a star count
  }
}

export default async function Page() {
  const [examples, stars] = await Promise.all([loadExamples(), loadStars()]);
  return <DevNutrition examples={examples} stars={stars} />;
}
