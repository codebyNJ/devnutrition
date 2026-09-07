import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/og-fonts";
import { OG_SIZE, OgCover } from "@/lib/og";

export const alt = "Duel — compare two GitHub developers panel against panel";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <OgCover
        title="Duel"
        subtitle="Two handles, two panels, one inspector's verdict. Compare any two GitHub developers stat by stat."
      />
    ),
    { ...size, fonts: await ogFonts() },
  );
}
