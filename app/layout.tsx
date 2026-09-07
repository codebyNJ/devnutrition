import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./theme.css";
import { REPO_URL, SITE_URL } from "@/lib/nutrition";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono-face", subsets: ["latin"] });

const DESCRIPTION =
  "Scan any GitHub handle and get a Nutrition Facts panel for that developer — " +
  "caffeine, saturated tech debt, documentation, raw aura, and a letter grade " +
  "built from real public profile data. Free, no sign-in, shareable as an image.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DevNutrition — Nutrition Facts for any GitHub developer",
    /* every child page reads as itself first, brand second */
    template: "%s — DevNutrition",
  },
  description: DESCRIPTION,
  applicationName: "DevNutrition",
  keywords: [
    "github profile analyzer",
    "developer nutrition label",
    "github stats generator",
    "nutrition facts generator",
    "github profile card",
    "developer grade",
    "compare github profiles",
  ],
  authors: [{ name: "codebyNJ", url: "https://github.com/codebyNJ" }],
  creator: "codebyNJ",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "DevNutrition",
    url: SITE_URL,
    title: "DevNutrition — Nutrition Facts for any GitHub developer",
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    /* the large card is what makes the generated panel worth generating */
    card: "summary_large_image",
    title: "DevNutrition — Nutrition Facts for any GitHub developer",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  category: "technology",
};

/* Structured data: what this is, that it costs nothing, and where the source
 * lives. Answer engines quote this far more readily than they infer it. */
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "DevNutrition",
  url: SITE_URL,
  description: DESCRIPTION,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any (web)",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  isAccessibleForFree: true,
  codeRepository: REPO_URL,
  author: { "@type": "Person", name: "codebyNJ", url: "https://github.com/codebyNJ" },
  featureList: [
    "Generate a Nutrition Facts panel for any GitHub handle",
    "Letter grade from followers, public repositories and account age",
    "Compare two developers side by side",
    "Download or share the panel as an image",
  ],
};

/* Runs before first paint, so the page never flashes the wrong theme on
 * reload. Stored choice wins; otherwise follow the OS, defaulting to dark. */
const NO_FLASH = `
try {
  var t = localStorage.getItem("devnutrition-theme");
  if (t !== "light" && t !== "dark") {
    t = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  document.documentElement.classList.toggle("dark", t === "dark");
  document.documentElement.style.colorScheme = t;
} catch (e) {
  document.documentElement.classList.add("dark");
}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    /* The class is owned by NO_FLASH below, which runs before hydration —
       suppressHydrationWarning tells React that difference is intentional. */
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
      </head>
      <body className="primitive-showcase min-h-full bg-page font-sans text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        {children}
      </body>
    </html>
  );
}
