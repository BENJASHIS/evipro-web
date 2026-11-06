export const LABEL_WIDTH = 4096;
export const PANEL_CENTERS = { composition: LABEL_WIDTH/2, cbd: LABEL_WIDTH/6, thc: LABEL_WIDTH*5/6 };

export function labelCamera(face) {
  if (!Object.hasOwn(PANEL_CENTERS,face)) throw new Error('Cara de etiqueta desconocida');
  // CylinderGeometry empieza en π; su UV 0,5 coincide con el frente +Z.
  const angle = Math.PI + PANEL_CENTERS[face]/LABEL_WIDTH*2*Math.PI;
  return [7.2*Math.sin(angle),2.3,7.2*Math.cos(angle)];
}

export const shortestTurn = (from,to) => Math.atan2(Math.sin(to-from),Math.cos(to-from));
