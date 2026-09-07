import type { Nutrition } from "./nutrition.ts";
import { gradeScore } from "./nutrition.ts";

/* The collectible view of the same audit. A football card wants one headline
 * rating and six two-or-three-letter stats, so the panel's units are remapped
 * onto a 0–99 scale — the numbers are identical, only the presentation differs. */

export type CardStat = { key: string; label: string; value: number };
export type Tier = "gold" | "silver" | "bronze" | "condemned";

const scale = (v: number, lo: number, hi: number, outLo: number, outHi: number) =>
  Math.round(
    Math.max(outLo, Math.min(outHi, outLo + ((v - lo) / (hi - lo)) * (outHi - outLo))),
  );

export const cardRating = (d: Nutrition) =>
  Math.max(1, Math.min(99, Math.round(gradeScore(d) * 1.2)));

export const cardTier = (d: Nutrition): Tier =>
  d.grade === "A+" || d.grade === "A"
    ? "gold"
    : d.grade === "B"
      ? "silver"
      : d.grade === "F"
        ? "condemned"
        : "bronze";

/* The three-letter keys are the joke: a scouting report for a developer. */
export const cardStats = (d: Nutrition): CardStat[] => [
  { key: "CAF", label: "Caffeine", value: scale(d.caffeine, 380, 1900, 40, 99) },
  { key: "DBT", label: "Tech debt", value: scale(d.debt, 620, 2420, 40, 99) },
  { key: "DOC", label: "Documentation", value: scale(d.docs, 0, 4, 1, 14) },
  { key: "SOF", label: "Stack Overflow", value: d.stackOverflow },
  { key: "DEP", label: "Dependencies", value: scale(d.npm, 120, 760, 20, 99) },
  { key: "AUR", label: "Aura", value: d.aura },
];

/* Where a developer plays. Reach-heavy profiles are strikers; repo-heavy ones
 * do the unglamorous work in midfield. */
export function cardPosition(d: Nutrition): string {
  const reach = Math.log10(d.followers + 1);
  const output = Math.log10(d.repos + 1);
  if (reach > 4.5) return "ICON";
  if (output > 2.4) return "MAINT";
  if (reach > 3.4) return "OSS";
  if (Number(d.years) > 10) return "VET";
  return "SUB";
}

export const TIER_STYLE: Record<Tier, { face: string; ink: string; rule: string; foil: string }> = {
  gold: {
    face: "linear-gradient(150deg,#3a2c07 0%,#7a5c14 18%,#e8c56a 42%,#fff4cf 50%,#e8c56a 58%,#7a5c14 82%,#3a2c07 100%)",
    ink: "#2a1f04",
    rule: "rgba(42,31,4,0.28)",
    foil: "linear-gradient(115deg,transparent 38%,rgba(255,255,255,0.55) 47%,transparent 56%)",
  },
  silver: {
    face: "linear-gradient(150deg,#2b2e33 0%,#5c626b 18%,#c9ced6 42%,#ffffff 50%,#c9ced6 58%,#5c626b 82%,#2b2e33 100%)",
    ink: "#1e2126",
    rule: "rgba(30,33,38,0.26)",
    foil: "linear-gradient(115deg,transparent 38%,rgba(255,255,255,0.6) 47%,transparent 56%)",
  },
  bronze: {
    face: "linear-gradient(150deg,#33200f 0%,#6b4522 18%,#c98b52 42%,#f0c79c 50%,#c98b52 58%,#6b4522 82%,#33200f 100%)",
    ink: "#2a1a0b",
    rule: "rgba(42,26,11,0.28)",
    foil: "linear-gradient(115deg,transparent 38%,rgba(255,255,255,0.45) 47%,transparent 56%)",
  },
  condemned: {
    face: "linear-gradient(150deg,#1a1a1c 0%,#2e2e33 30%,#4a4a52 50%,#2e2e33 70%,#1a1a1c 100%)",
    ink: "#e8e8ea",
    rule: "rgba(232,232,234,0.22)",
    foil: "linear-gradient(115deg,transparent 40%,rgba(255,255,255,0.18) 48%,transparent 56%)",
  },
};
