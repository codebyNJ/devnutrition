import type { Metadata } from "next";
import Duel from "@/components/Duel";

export const metadata: Metadata = {
  title: "Duel // DevNutrition",
  description: "Compare two GitHub developers panel against panel.",
};

const PRESETS = ["torvalds", "karpathy", "sindresorhus", "shadcn"];

export default function DuelPage() {
  return <Duel presets={PRESETS} />;
}
