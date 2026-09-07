import type { Nutrition } from "./nutrition";
import { fnv, n } from "./nutrition";

/* One description of the scoring model, shared by the live readout during a
 * scan and by the /scoring page. Two copies of this would drift apart within a
 * week. */

export type MetricKey = "caffeine" | "debt" | "docs" | "stackOverflow" | "npm" | "aura";

export type Metric = {
  key: MetricKey;
  label: string;
  /** what the scan says while this one is resolving */
  working: string;
  format: (d: Nutrition) => string;
  /** true when real profile data feeds the number, false when it is theatre */
  grounded: boolean;
  inputs: string;
  formula: string;
  blurb: string;
};

export const METRICS: Metric[] = [
  {
    key: "caffeine",
    label: "Total Caffeine",
    working: "Measuring commit churn & sleep deprivation",
    format: (d) => `${n(d.caffeine)}mg`,
    grounded: true,
    inputs: "followers",
    formula: "380 + log₂(followers + 2) × 68 + seeded(0…260)",
    blurb:
      "Reach is treated as a stimulant: the more people watching, the more of the night gets spent shipping. Scales logarithmically, so going from 10 to 100 followers costs more sleep than 10,000 to 100,000.",
  },
  {
    key: "debt",
    label: "Saturated Tech Debt",
    working: "Calculating saturated technical debt",
    format: (d) => `${n(d.debt)}%`,
    grounded: false,
    inputs: "handle hash",
    formula: "620 + seeded(0…1800)",
    blurb:
      "Entirely invented. Nothing in a public profile reveals what the inside of a codebase looks like, and pretending otherwise would be the dishonest kind of joke. Always high, because it always is.",
  },
  {
    key: "docs",
    label: "Documentation",
    working: "Probing for documentation",
    format: (d) => `${d.docs}%`,
    grounded: false,
    inputs: "handle hash",
    formula: "seeded(0…4)",
    blurb:
      "Capped at 4% by design. The measurement is not sensitive enough to detect documentation in the wild, and the search continues.",
  },
  {
    key: "stackOverflow",
    label: "Stack Overflow Copy-Paste",
    working: "Auditing Stack Overflow dependencies",
    format: (d) => `${d.stackOverflow}%`,
    grounded: false,
    inputs: "handle hash",
    formula: "seeded(22…88)",
    blurb:
      "The floor is 22% because nobody is at zero, and the ceiling is 88% because at some point you did write a for-loop yourself.",
  },
  {
    key: "npm",
    label: "Unused npm Dependencies",
    working: "Weighing the node_modules",
    format: (d) => `${n(d.npm)}g`,
    grounded: false,
    inputs: "handle hash",
    formula: "120 + seeded(0…640)",
    blurb: "Measured by mass, which is the only honest unit for a dependency tree.",
  },
  {
    key: "aura",
    label: "Raw Aura / Clout",
    working: "Reading raw aura",
    format: (d) => `${d.aura}%`,
    grounded: true,
    inputs: "followers",
    formula: "min(99, log₁₀(followers + 10) × 25 + seeded(0…18))",
    blurb:
      "The one number that is mostly earned. Capped at 99 — nobody gets a hundred, not even the one whose profile you are probably about to scan.",
  },
];

export const GRADE_BANDS = [
  { grade: "A", min: 68, note: "Exemplary. Suspiciously so." },
  { grade: "B", min: 56, note: "Edible. Ships on Fridays." },
  { grade: "C", min: 44, note: "Consume with supervision." },
  { grade: "D", min: 32, note: "Do not deploy on a Friday." },
  { grade: "F", min: -Infinity, note: "Condemned by inspectors." },
] as const;

export const GRADE_FORMULA = "40 + aura×0.45 + documentation×9 − techDebt/55 − stackOverflow×0.28";

/* Per-handle stage durations, so the scan takes a different shape for each
 * developer instead of replaying one canned timeline. Deterministic: the same
 * handle always gets the same rhythm. */
export function stageTimings(login: string): number[] {
  const h = fnv(login.toLowerCase());
  return METRICS.map((_, i) => 460 + ((h >>> (i * 4)) % 7) * 90);
}

export const totalRunMs = (login: string) =>
  stageTimings(login).reduce((a, b) => a + b, 0) + 900;
