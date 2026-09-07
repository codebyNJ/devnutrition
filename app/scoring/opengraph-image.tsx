import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/og-fonts";
import { OG_SIZE, OgCover } from "@/lib/og";

export const alt = "How DevNutrition scores a GitHub developer";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <OgCover
        title="How it scores"
        subtitle="Which numbers come from a real GitHub profile, which are invented, and exactly how the letter grade is calculated."
      />
    ),
    { ...size, fonts: await ogFonts() },
  );
}
