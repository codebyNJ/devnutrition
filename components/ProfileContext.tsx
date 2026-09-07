"use client";

import ContextCards, { type ContextChunk } from "@/components/primitives/ContextCards";
import type { Nutrition } from "@/lib/nutrition";
import { n } from "@/lib/nutrition";

/* What the audit actually read, shown as retrieved context. Three fields from
 * one endpoint — the same three the grade is built from. Putting them on
 * screen is the point: everything else on the panel is invented, and this is
 * the part that is not. */

export default function ProfileContext({ d }: { d: Nutrition }) {
  const source = `api.github.com/users/${d.login}`;

  const chunks: ContextChunk[] = [
    {
      title: "Public repositories",
      chars: `${n(d.repos)} repos`,
      body: `${n(d.repos)} public repositories, worth up to 20 points of Output on the grade.`,
      source,
      badge: "API",
      tone: "bg-accent",
    },
    {
      title: "Followers",
      chars: `${n(d.followers)} followers`,
      body: `Reach is log-scaled from this and capped at 45 points — the heaviest term, and the one that cannot be inflated by pushing more repositories.`,
      source,
      badge: "API",
      tone: "bg-green",
    },
    {
      title: "Account age",
      chars: `${d.years} years`,
      body: `Tenure contributes up to 12 points, maxing out at roughly fourteen years on the platform.`,
      source,
      badge: "API",
      tone: "bg-orange",
    },
  ];

  return (
    <ContextCards
      chunks={chunks}
      labels={{
        header: d.real ? "Read from the profile" : "Simulated — rate limited",
        count: String(chunks.length),
      }}
    />
  );
}
