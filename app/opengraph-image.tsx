import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/og-fonts";
import { OG_SIZE, OgCover } from "@/lib/og";

export const alt = "DevNutrition — Nutrition Facts for any GitHub developer";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <OgCover
        title="DevNutrition"
        subtitle="Nutrition Facts for any GitHub developer. Caffeine, saturated tech debt, documentation, raw aura — and a letter grade."
      />
    ),
    { ...size, fonts: await ogFonts() },
  );
}
