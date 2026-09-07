"use client";

import RecommendationCard, {
  type RecommendationOption,
} from "@/components/primitives/RecommendationCard";
import { EntityChip } from "@/components/atoms/EntityChip";
import { ValuePill } from "@/components/atoms/ValuePill";
import type { Nutrition } from "@/lib/nutrition";
import { n } from "@/lib/nutrition";

/* The inspector's advisory, ordered so the grade's own verdict is the one on
 * offer and the others sit behind "Alternatives". */

export default function Advisory({ d }: { d: Nutrition }) {
  const safe: RecommendationOption = {
    key: "safe",
    body: (
      <>
        Approved for daily consumption. <EntityChip name={d.login} /> holds{" "}
        <ValuePill tone="green">Grade {d.grade}</ValuePill> on reach, output and tenure.
      </>
    ),
    short: `Approved · Grade ${d.grade}`,
    signal: 3,
    tone: "var(--green)",
    label: "High confidence",
    cta: "Accept",
    ctaVariant: "success",
  };

  const supervised: RecommendationOption = {
    key: "supervised",
    body: (
      <>
        Consume with supervision. Pair every serving with review —{" "}
        <ValuePill tone="orange">{n(d.debt)}% tech debt</ValuePill> is above the advisory
        threshold.
      </>
    ),
    short: "Consume with supervision",
    signal: 2,
    tone: "var(--orange)",
    label: "Medium confidence",
    cta: "Accept",
    ctaVariant: "accent",
  };

  const restricted: RecommendationOption = {
    key: "restricted",
    body: (
      <>
        Not cleared for production. <ValuePill tone="red">{d.docs}% documentation</ValuePill>{" "}
        leaves nothing for the next maintainer to go on.
      </>
    ),
    short: "Not cleared for production",
    signal: 1,
    tone: "var(--red)",
    label: "Low confidence",
    cta: "Acknowledge",
    ctaVariant: "secondary",
  };

  /* the grade decides which advisory leads; the rest stay available */
  const order =
    d.grade === "A+" || d.grade === "A"
      ? [safe, supervised, restricted]
      : d.grade === "B" || d.grade === "C"
        ? [supervised, safe, restricted]
        : [restricted, supervised, safe];

  return (
    <RecommendationCard
      options={order}
      labels={{
        title: `Is @${d.login}'s code safe to consume?`,
        alternatives: "Other findings",
        otherOptions: "Other findings",
        accepted: "Advisory accepted",
      }}
    />
  );
}
