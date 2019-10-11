/**
 * @param {BigNumber} value
 * @returns {string}
 */
export function formatNumber(value, decimalPlaces = 4) {
  return value.toFixed(value.isInteger() ? null : decimalPlaces);
}
