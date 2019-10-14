import { IconConverter } from 'icon-sdk-js';
import { endsWith, trimEnd } from 'lodash-es';

// See BigNumber.js rounding modes
// https://mikemcl.github.io/bignumber.js/#constructor-properties
const ROUNDING_MODE = 1;

/**
 * @param {BigNumber} value
 * @returns {string}
 */
export function formatNumber(value, decimalPlaces = 4) {
  if (value.isInteger()) return value.toFixed(null);

  const minimumValue = IconConverter.toBigNumber(`0.${'0'.repeat(decimalPlaces)}1`);
  if (value.isLessThan(minimumValue)) return '~0';

  const result = trimEnd(value.toFixed(decimalPlaces, ROUNDING_MODE), '0');
  return `${result}${endsWith(result, '.') ? '0' : ''}`;
}
