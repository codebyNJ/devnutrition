import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/og-fonts";
import { OG_SIZE, OgPanel } from "@/lib/og";
import { analyze } from "@/lib/nutrition";
import { ghUser } from "@/lib/github";

export const alt = "A DevNutrition panel for a GitHub developer";
export const size = OG_SIZE;
export const contentType = "image/png";

/* The thumbnail is the developer's own panel, generated per request and then
 * cached — which is what makes a shared link worth clicking. */
export default async function Image({ params }: { params: Promise<{ login: string }> }) {
  const { login } = await params;
  const clean = decodeURIComponent(login);
  const d = analyze(clean, await ghUser(clean));
  return new ImageResponse(<OgPanel d={d} />, { ...size, fonts: await ogFonts() });
}
