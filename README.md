# DevNutrition

An AI-agent-styled audit of any GitHub developer, printed as a Swiss "Nutrition Facts"
label. Enter a handle, watch the agent run, get a shareable label measuring caffeine
tolerance, saturated tech debt, documentation void and raw aura.

Built entirely on [Beautiful UI](https://www.beautifului.dev) primitives, installed from
its shadcn registry rather than reimplemented.

> Satire. Not affiliated with GitHub, or with any actual food authority.

## Run it

```bash
npm install
npm run dev
```

## Grading

The letter grade is built from three real signals — reach (followers), output
(public repos) and tenure (account age) — plus a small nudge from the invented
metrics. An earlier version inverted that weighting and handed an **F** to people
whose entire public record is years of open source; `lib/nutrition.test.ts` now
asserts that prolific maintainers grade A or A+, that five thousand empty
repositories do not buy a good grade, and that a brand-new account is not graded
like a veteran.

## How it works

Public profile data comes from `api.github.com/users/{handle}`. Everything else is
derived from an FNV hash of the handle, so a given developer always gets the same
label — the joke stops working if the numbers move on reload. When the API is
rate-limited the label still prints, and says `Simulated` on its footer rather than
pretending the data is real.

The agent run is orchestrated in `app/page.tsx` as a four-phase machine
(`idle → scanning → closing → done`). Each primitive drives its own internal timeline
once mounted, and those timelines are longer than any single component's completion
callback — so the sequence is timed centrally, and the label is only revealed once the
run has played out *and* cleared the screen.

## Pages

| Route | What it is |
| --- | --- |
| `/` | the scanner, with server-loaded examples and the repo's star count |
| `/scoring` | the methodology — which numbers are real, which are invented, how the grade is computed |

## Beautiful UI components used

Installed via `npx shadcn@latest add https://www.beautifului.dev/r/{name}.json`:

| Component | Role |
| --- | --- |
| `foundation` | design tokens, dark ramp, base styles |
| `thinking-state` | the reasoning trace (custom `DevNutrition` variant) |
| `tool-chips` | `fetch_repo_density()` and friends |
| `task-rows` | the completed-checks list |
| `loading-state` | elapsed-time scan indicator |
| `streaming-text` | the streamed verdict, its source and follow-ups |
| `context-cards` | the three profile fields the grade is actually built from |
| `recommendation-card` | the consumption advisory, with its confidence meter |
| `button` · `entity-chip` · `value-pill` · `shimmer` | actions, preset handles, flagged additives |

`prompt-bar` was installed, tried, and removed: it is a full chat composer (textarea,
model picker, dictation, `@`-menus) and this app takes a single word. It is not in the
tree — `components/HandleInput.tsx` replaces it, built on the same tokens and `Button`.

## Checks

Beyond `npm test` (label maths — determinism, ranges, real-vs-fallback data), there are
browser checks that hold the parts unit tests cannot reach. They need `npm run dev`
running in another terminal.

```bash
npm test              # label maths
npm run check:sequence # the label never appears while the agent run is still on screen
npm run check:mobile   # no horizontal overflow at 360px, measured in the finished state
npm run check:theme    # toggle flips, persists, background stays a plain fill
npm run check:export   # Download produces a 1080px-wide PNG
```

`npm run fix:foundation` removes an orphaned rule the Beautiful UI registry emits into
`foundation.css` on a partial install, which otherwise fails the build with
`CssSyntaxError: Unexpected }`. Re-run it after any `shadcn add` from that registry.

## Notes

- The examples on the landing page are the real generated label, rendered by the
  same component in the same `export` mode that produces the shared PNG, scaled
  down — not a summary of it.
- The label stays black on white in both themes. It is a paper artifact, and keeping it
  out of the theme is also what makes the exported PNG identical everywhere.
- Sharing uses `navigator.share({ files })` so the real PNG reaches the X app on a
  phone; desktop falls back to saving the PNG and opening the composer, since the X web
  intent cannot carry an image. The PNG is rendered when the label appears rather than
  when Share is tapped — iOS only honours `share()` from inside the tap.
- `components/primitives/**` and `app/beautifui/foundation.css` are vendored from the
  registry and are excluded from linting; they are owned upstream.
