export const gcd = (a, b) => (b > Number.EPSILON ? gcd(b, a % b) : a);
export function toFraction(string) {
  const decimal = Number.parseFloat(string);
  if (Number.isInteger(decimal)) {
    return {
      numerator: decimal,
      denominator: 1,
      decimal,
    };
  }
  const int = Number.parseInt(string, 10);
  const places = (decimal - int).toString(10).length - 2;
  let denominator = Math.abs(10 ** places);
  let numerator = decimal * denominator;
  const divisor = gcd(numerator, denominator);
  denominator /= divisor;
  numerator /= divisor;
  return { numerator, denominator, decimal };
}

export function toDecimal(value) {
  if (!value || typeof value !== 'object') return 0;
  const { decimal, numerator, denominator } = value;
  return decimal || numerator / denominator;
}
