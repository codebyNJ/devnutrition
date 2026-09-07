"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/Button";

/* Beautiful UI's PromptBar is a full chat composer — multi-line textarea,
 * model picker, dictation, @-source menus. This app takes one word, so it gets
 * one line. Built on the same foundation tokens and the library's Button. */

export default function HandleInput({
  onSubmit,
  busy,
}: {
  onSubmit: (handle: string) => void;
  busy?: boolean;
}) {
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
      className="flex w-full max-w-md items-center gap-1.5 rounded-full bg-surface
        p-1.5 pl-3.5 shadow-btn transition-shadow duration-150
        focus-within:shadow-raised"
    >
      <svg
        width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        className="shrink-0 text-ink-3"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="github handle…"
        aria-label="GitHub handle"
        spellCheck={false}
        autoCapitalize="none"
        autoCorrect="off"
        /* 16px on mobile: anything smaller makes iOS Safari zoom on focus */
        className="min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none
          placeholder:text-ink-3 sm:text-[14px]"
      />

      <Button type="submit" variant="primary" size="sm" disabled={busy || !value.trim()}>
        {busy ? "Scanning…" : "Inspect"}
      </Button>
    </form>
  );
}
