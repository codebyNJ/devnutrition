import type { Nutrition } from "./nutrition";
import { n } from "./nutrition";

export const shareText = (d: Nutrition) =>
  `@${d.login} nutrition facts: ${n(d.caffeine)}mg caffeine, ${n(d.debt)}% saturated tech debt, ` +
  `${d.docs}% documentation, ${d.aura}% raw aura. #DevNutrition`;

/* html2canvas-pro rather than html2canvas: foundation.css is authored in
 * oklch(), which the original chokes on. Loaded lazily so it stays out of the
 * first paint. */
export async function renderPng(node: HTMLElement): Promise<Blob> {
  const { default: html2canvas } = await import("html2canvas-pro");
  const canvas = await html2canvas(node, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
  if (!blob) throw new Error("canvas produced no image");
  return blob;
}

export const canShareFiles = (file: File) =>
  typeof navigator !== "undefined" &&
  typeof navigator.canShare === "function" &&
  navigator.canShare({ files: [file] });

export const toFile = (blob: Blob, login: string) =>
  new File([blob], `devnutrition-${login}.png`, { type: "image/png" });

export function saveFile(blob: Blob, login: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `devnutrition-${login}.png`;
  a.click();
  /* revoke on the next frame; revoking immediately cancels the download in
   * some browsers */
  requestAnimationFrame(() => URL.revokeObjectURL(url));
}

export const openXIntent = (text: string) =>
  window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank", "noopener");

/* The X web intent cannot carry an image, so the phone path is the OS share
 * sheet (which hands the real PNG to the X app) and the desktop path is
 * "save the PNG, open the composer". Returns which one ran so the UI can say
 * so honestly. */
export async function shareLabel(
  blob: Blob,
  d: Nutrition,
): Promise<"shared" | "dismissed" | "downloaded"> {
  const text = shareText(d);
  const file = toFile(blob, d.login);

  if (canShareFiles(file)) {
    try {
      await navigator.share({ files: [file], text });
      return "shared";
    } catch (err) {
      /* the user backing out of the sheet is not a failure */
      if (err instanceof DOMException && err.name === "AbortError") return "dismissed";
    }
  }

  saveFile(blob, d.login);
  openXIntent(text);
  return "downloaded";
}
