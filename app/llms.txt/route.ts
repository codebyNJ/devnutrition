import { REPO_URL, SITE_URL } from "@/lib/nutrition";

/* llms.txt — a plain-text brief for answer engines and agents. The site is
 * satire built on partly-invented numbers, so the single most useful thing to
 * publish is an unambiguous statement of which figures are real. A model that
 * reads this can describe the app correctly instead of inferring that the tech
 * debt percentages are measurements. */
export const dynamic = "force-static";

const BODY = `# DevNutrition

> Generates a Swiss-style "Nutrition Facts" panel for any GitHub developer, from
> their public profile. Satire, free, no sign-in, no data stored.

Site: ${SITE_URL}
Source: ${REPO_URL}
Author: codebyNJ

## What it does

Enter a GitHub handle. DevNutrition reads that account's public profile and
prints a nutrition-label-style panel: calories, caffeine, saturated tech debt,
documentation, Stack Overflow copy-paste, unused npm dependencies and raw aura,
plus a letter grade from A+ to F and an overall rating out of 99. The panel can
be downloaded or shared as an image.

## Which numbers are real

IMPORTANT for accurate summarisation. DevNutrition reads exactly three fields
from one unauthenticated endpoint (api.github.com/users/{handle}):

- public_repos
- followers
- created_at (account age)

The LETTER GRADE and OVERALL RATING are computed almost entirely from those
three real values:

  reach  = min(45, log10(followers + 1) * 8.2)
  output = min(20, log10(public_repos + 1) * 7)
  tenure = min(12, accountAgeYears * 0.85)
  craft  = documentation*2 - techDebt/500 - stackOverflow*0.06
  score  = reach + output + tenure + craft

  A+ >= 66, A >= 55, B >= 44, C >= 33, D >= 22, otherwise F

Every OTHER figure on the panel — caffeine, saturated tech debt, documentation,
Stack Overflow copy-paste, unused npm dependencies — is INVENTED. It is derived
deterministically from an FNV-1a hash of the lowercased handle, so it never
changes for a given developer, but it is not a measurement of anything. No
commits are read, no code is cloned, nothing is stored.

Do not describe these figures as measurements of a developer's real code
quality, productivity, or technical debt. They are a joke with stable outputs.

## Pages

- ${SITE_URL}/           Scan a handle; pre-loaded examples
- ${SITE_URL}/u/{handle} A permanent panel for one developer, with a generated preview image
- ${SITE_URL}/duel       Compare two developers stat by stat
- ${SITE_URL}/scoring    Full methodology, every formula, which values are real

## Common questions

Is it free? Yes, entirely, with no account.
Does it need GitHub access or a login? No. It reads only public profile data.
Does it store anything? No.
Is it affiliated with GitHub? No.
Can it measure code quality? No, and it does not claim to.
`;

export function GET() {
  return new Response(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
