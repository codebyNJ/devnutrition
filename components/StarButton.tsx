import { REPO_URL, n } from "@/lib/nutrition";

/* Star count is read on the server (see app/page.tsx) and revalidated
 * periodically, so it stays roughly live without shipping a client fetch.
 * Starring itself needs a signed-in GitHub session, so this is a link to the
 * repo rather than a button pretending it can star on your behalf. */

export default function StarButton({ stars }: { stars: number | null }) {
  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        stars === null
          ? "Star DevNutrition on GitHub"
          : `Star DevNutrition on GitHub — ${stars} stars so far`
      }
      className="inline-flex h-9 items-center gap-2 rounded-full bg-surface px-3
        text-[12.5px] text-ink shadow-btn transition-colors duration-150 hover:bg-hover
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" className="shrink-0 text-orange" aria-hidden>
        <path
          fill="currentColor"
          d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9z"
        />
      </svg>
      <span className="font-medium">Star</span>
      {stars !== null && (
        <span className="border-l border-line pl-2 font-mono tabular-nums text-ink-2">
          {n(stars)}
        </span>
      )}
    </a>
  );
}
