import { formatNumber } from './composition.js';

export const LABEL_WIDTH = 4096;
// Cuatro paneles de 90°: la costura del cilindro (u = 0) cae entre «Qué debe decir» y THC, así ningún panel se parte.
export const LABEL_THETA_START = 3*Math.PI/4;
export const PANEL_CENTERS = { composition: LABEL_WIDTH*5/8, cbd: LABEL_WIDTH*3/8, requisitos: LABEL_WIDTH/8, thc: LABEL_WIDTH*7/8 };
export const PANEL_TEXT_MAX = 960;

export function labelCamera(face) {
  if (!Object.hasOwn(PANEL_CENTERS,face)) throw new Error('Cara de etiqueta desconocida');
  // CylinderGeometry empieza en LABEL_THETA_START; el centro de «composition» queda en el frente +Z.
  const angle = LABEL_THETA_START + PANEL_CENTERS[face]/LABEL_WIDTH*2*Math.PI;
  return [7.2*Math.sin(angle),2.3,7.2*Math.cos(angle)];
}

export const shortestTurn = (from,to) => Math.atan2(Math.sin(to-from),Math.cos(to-from));

export function fitDiagram(width, height) {
  const scale = Math.min(PANEL_TEXT_MAX / width, 676 / height);
  return { width: width * scale, height: height * scale };
}

// Cara frontal de la etiqueta: THC siempre primero (DL-0056).
export const frontLines = (c) => [
  { text: 'COMPOSICIÓN', y: 210, size: 95 },
  { text: `THC ${formatNumber(c.thc)} %`, y: 540, size: 215, bold: true },
  { text: `CBD ${formatNumber(c.cbd)} %`, y: 800, size: 215, bold: true },
  { text: `THC:CBD  ${c.ratio}`, y: 980, size: 75 },
  { text: `THC ${formatNumber(c.thcMgMl)} mg/mL`, y: 1100, size: 90 },
  { text: `CBD ${formatNumber(c.cbdMgMl)} mg/mL`, y: 1210, size: 90 },
  { text: '10 mL', y: 1360, size: 100 },
];

// Cara «Qué debe decir»: mínimo del rotulado de un preparado (NTS 122, 6.7.2) con valores ficticios.
// Texto v01: la redacción final sale de la revisión de Carlos (tarea 11 del plan).
export const REQUISITOS_LINEAS = [
  { text: 'QUÉ DEBE DECIR', y: 145, size: 95, bold: true },
  { text: 'FARMACIA DE EJEMPLO', y: 270, size: 62 },
  { text: 'Preparado N.° 0000', y: 395, size: 62 },
  { text: 'Vía sublingual', y: 520, size: 62 },
  { text: 'ADVERTENCIAS DE USO', y: 645, size: 62 },
  { text: 'Elaborado: DD/MM/AAAA', y: 770, size: 62 },
  { text: 'Q.F. NOMBRE APELLIDO', y: 895, size: 62 },
  { text: 'Conservar bien cerrado, sin luz', y: 1020, size: 62 },
  { text: 'USO INTERNO', y: 1145, size: 62 },
  { text: 'MANTÉNGASE ALEJADO DE LOS NIÑOS', y: 1270, size: 62, bold: true },
];
