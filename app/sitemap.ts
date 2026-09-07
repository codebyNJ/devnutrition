import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/nutrition";

const EXAMPLES = ["torvalds", "karpathy", "sindresorhus", "shadcn"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/scoring`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/duel`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    /* the pre-rendered example panels: real pages with real content, which is
     * what makes them worth indexing at all */
    ...EXAMPLES.map((login) => ({
      url: `${SITE_URL}/u/${login}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
