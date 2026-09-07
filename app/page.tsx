import DevNutrition from "@/components/DevNutrition";
import { analyze, REPO_URL, type Nutrition } from "@/lib/nutrition";
import { ghStars, ghUser } from "@/lib/github";

/* Examples and the star count are fetched here, on the server, so the page
 * opens with real grades instead of an empty state — and so these calls use
 * the server's token rather than every visitor's own rate limit. */
export const revalidate = 3600;

const EXAMPLE_HANDLES = ["torvalds", "karpathy", "sindresorhus", "shadcn"];

async function loadExamples(): Promise<Nutrition[]> {
  const users = await Promise.all(EXAMPLE_HANDLES.map(ghUser));
  return users.map((u, i) => analyze(EXAMPLE_HANDLES[i], u));
}

export default async function Page() {
  const [owner, repo] = new URL(REPO_URL).pathname.slice(1).split("/");
  const [examples, stars] = await Promise.all([loadExamples(), ghStars(owner, repo)]);
  return <DevNutrition examples={examples} stars={stars} />;
}
