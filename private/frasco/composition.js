// Aritmética de presentación en % m/v; no contiene decisiones clínicas.
const validNumber = (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0;
export const formatNumber = (n) => Number(n.toPrecision(5)).toString();

export function composition(cbd, thc) {
  if (![cbd, thc].every(n => validNumber(n) && n <= 100)) {
    throw new Error('Introduce porcentajes entre 0 y 100 % m/v.');
  }
  const minimum = Math.min(cbd, thc);
  let ratio = 'No definido';
  if (minimum > 0) {
    const a = thc/minimum, b = cbd/minimum;
    if (![a, b].every(Number.isFinite)) throw new Error('La diferencia de concentraciones excede la precisión del visor.');
    ratio = `${formatNumber(a)}:${formatNumber(b)}`;
  } else if (cbd || thc) {
    ratio = thc ? '1:0' : '0:1';
  }
  return { cbd, thc, total: cbd+thc, cbdMgMl: cbd*10, thcMgMl: thc*10, ratio };
}

export function fromRatio(total, thcParts, cbdParts) {
  if (!validNumber(total) || total === 0 || total > 200 || ![thcParts, cbdParts].every(validNumber)) {
    throw new Error('Para aplicar un ratio, introduce partes no negativas y una concentración total positiva.');
  }
  const scale = Math.max(thcParts, cbdParts);
  if (!scale) throw new Error('El ratio 0:0 no está definido.');
  const thcFraction = (thcParts/scale)/(thcParts/scale+cbdParts/scale);
  const cbdFraction = (cbdParts/scale)/(thcParts/scale+cbdParts/scale);
  if ((thcParts > 0 && total*thcFraction === 0) || (cbdParts > 0 && total*cbdFraction === 0)) {
    throw new Error('El ratio excede la precisión del visor.');
  }
  return composition(total*cbdFraction, total*thcFraction);
}
