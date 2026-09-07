import type { Metadata } from "next";
import Duel from "@/components/Duel";
import { SITE_URL } from "@/lib/nutrition";

export const metadata: Metadata = {
  title: "Duel — compare two GitHub developers",
  description:
    "Put two GitHub handles head to head. DevNutrition grades both from their public profiles and breaks the comparison down stat by stat.",
  alternates: { canonical: "/duel" },
  openGraph: {
    type: "website",
    title: "Duel — compare two GitHub developers",
    description:
      "Put two GitHub handles head to head. DevNutrition grades both from their public profiles and breaks the comparison down stat by stat.",
    url: `${SITE_URL}/duel`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Duel — compare two GitHub developers",
    description: "Put two GitHub handles head to head, graded from their public profiles.",
  },
};

const PRESETS = ["torvalds", "karpathy", "sindresorhus", "shadcn"];

export default function DuelPage() {
  return <Duel presets={PRESETS} />;
}
