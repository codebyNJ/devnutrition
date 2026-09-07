import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./theme.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono-face", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevNutrition // AI Profile Analysis",
  description:
    "Scan any GitHub handle and receive its nutritional truth. Certified by the Federal Dev Administration.",
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
      <body className="primitive-showcase min-h-full bg-page font-sans text-ink">{children}</body>
    </html>
  );
}
