"use client";

import { useSyncExternalStore } from "react";

/* Track with the knob riding over whichever icon is active. The class on
 * <html> is the single source of truth — foundation.css keys its whole dark
 * ramp off `.dark`, and the inline script in layout.tsx sets it before first
 * paint so there is no flash. */

export type Theme = "light" | "dark";

const listeners = new Set<() => void>();

export const applyTheme = (t: Theme) => {
  document.documentElement.classList.toggle("dark", t === "dark");
  document.documentElement.style.colorScheme = t;
  try {
    localStorage.setItem("devnutrition-theme", t);
  } catch {
    /* private mode: the choice just won't survive a reload */
  }
  listeners.forEach((fn) => fn());
};

/* The <html> class is the store. Subscribing to it rather than mirroring it
 * into state keeps the pre-paint script and React in agreement, with no
 * first-render flash to paper over. */
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const getSnapshot = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

const Sun = (
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </>
);

const Moon = <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.7 6.7 0 0 0 10.5 10.5z" />;

function Icon({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <svg
      width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden
    >
      {children}
    </svg>
  );
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "dark" as Theme);
  const dark = theme === "dark";

  const toggle = () => applyTheme(dark ? "light" : "dark");

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
      onClick={toggle}
      className="relative inline-flex h-9 w-[68px] shrink-0 items-center rounded-full
        bg-inset p-1 shadow-inset-field transition-colors duration-200
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {/* the knob — parked left in light mode, right in dark */}
      <span
        className="absolute top-1 left-1 size-7 translate-x-0 rounded-full bg-surface
          shadow-btn transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          dark:translate-x-[32px]"
        aria-hidden
      />
      <span className="relative z-10 grid size-7 place-items-center">
        <Icon className="text-ink dark:text-ink-3">{Sun}</Icon>
      </span>
      <span className="relative z-10 ml-[4px] grid size-7 place-items-center">
        <Icon className="text-ink-3 dark:text-ink">{Moon}</Icon>
      </span>
    </button>
  );
}
