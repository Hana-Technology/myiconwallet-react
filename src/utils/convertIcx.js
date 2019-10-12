import { IconAmount } from 'icon-sdk-js';

export const ICX_LOOP_RATIO = Math.pow(10, 18);

/**
 * @param {BigNumber} value value as loop
 * @returns {BigNumber} value as ICX
 */
export function convertLoopToIcx(value) {
  return value.dividedBy(ICX_LOOP_RATIO);
}

/**
 * @param {string|number|BigNumber} value value as ICX
 * @returns {BigNumber} value as loop
 */
export function convertIcxToLoop(value) {
  return IconAmount.of(value, IconAmount.Unit.ICX).toLoop();
}
