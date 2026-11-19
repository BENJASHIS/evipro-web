import { formatNumber } from "./composition-en.js";

export const LABEL_WIDTH = 4096;
export const PANEL_CENTERS = { composition: LABEL_WIDTH/2, cbd: LABEL_WIDTH/6, thc: LABEL_WIDTH*5/6 };

export function labelCamera(face) {
  if (!Object.hasOwn(PANEL_CENTERS,face)) throw new Error("Cara de etiqueta desconocida");
  // CylinderGeometry empieza en π; su UV 0,5 coincide con el frente +Z.
  const angle = Math.PI + PANEL_CENTERS[face]/LABEL_WIDTH*2*Math.PI;
  return [7.2*Math.sin(angle),2.3,7.2*Math.cos(angle)];
}

export const shortestTurn = (from,to) => Math.atan2(Math.sin(to-from),Math.cos(to-from));

export function fitDiagram(width, height) {
  const scale = Math.min(1300 / width, 676 / height);
  return { width: width * scale, height: height * scale };
}

// Cara frontal de la etiqueta: THC siempre primero (DL-0056).
export const frontLines = (c) => [
  { text: "COMPOSITION", y: 210, size: 95 },
  { text: `THC ${formatNumber(c.thc)} %`, y: 540, size: 215, bold: true },
  { text: `CBD ${formatNumber(c.cbd)} %`, y: 800, size: 215, bold: true },
  { text: `THC:CBD  ${c.ratio}`, y: 980, size: 75 },
  { text: `THC ${formatNumber(c.thcMgMl)} mg/mL`, y: 1100, size: 90 },
  { text: `CBD ${formatNumber(c.cbdMgMl)} mg/mL`, y: 1210, size: 90 },
  { text: "10 mL", y: 1360, size: 100 },
];
