// Aritmética de presentación en % m/v; no contiene decisiones clínicas.
const validNumber = (n) => typeof n === "number" && Number.isFinite(n) && n >= 0;
export const formatNumber = (n) => Number(n.toPrecision(5)).toString();

export function composition(cbd, thc) {
  if (![cbd, thc].every(n => validNumber(n) && n <= 100)) {
    throw new Error("Enter percentages between 0 and 100% w/v.");
  }
  const minimum = Math.min(cbd, thc);
  let ratio = "Undefined";
  if (minimum > 0) {
    const a = thc/minimum, b = cbd/minimum;
    if (![a, b].every(Number.isFinite)) throw new Error("The concentration difference exceeds the precision of the viewer.");
    ratio = `${formatNumber(a)}:${formatNumber(b)}`;
  } else if (cbd || thc) {
    ratio = thc ? "1:0" : "0:1";
  }
  return { cbd, thc, total: cbd+thc, cbdMgMl: cbd*10, thcMgMl: thc*10, ratio };
}

export function fromRatio(total, thcParts, cbdParts) {
  if (!validNumber(total) || total === 0 || total > 200 || ![thcParts, cbdParts].every(validNumber)) {
    throw new Error("To apply a ratio, enter non-negative parts and a positive total concentration.");
  }
  const scale = Math.max(thcParts, cbdParts);
  if (!scale) throw new Error("The ratio 0:0 is undefined.");
  const thcFraction = (thcParts/scale)/(thcParts/scale+cbdParts/scale);
  const cbdFraction = (cbdParts/scale)/(thcParts/scale+cbdParts/scale);
  if ((thcParts > 0 && total*thcFraction === 0) || (cbdParts > 0 && total*cbdFraction === 0)) {
    throw new Error("The ratio exceeds the precision of the viewer.");
  }
  return composition(total*cbdFraction, total*thcFraction);
}
