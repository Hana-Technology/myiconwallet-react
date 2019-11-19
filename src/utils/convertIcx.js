import { IconAmount, IconConverter } from 'icon-sdk-js';

/**
 * @param {string|number|BigNumber} value value as loop
 * @returns {BigNumber} value as ICX
 */
export function convertLoopToIcx(value) {
  return IconConverter.toBigNumber(
    IconAmount.of(value, IconAmount.Unit.LOOP).convertUnit(IconAmount.Unit.ICX)
  );
}

/**
 * @param {string|number|BigNumber} value value as ICX
 * @returns {BigNumber} value as loop
 */
export function convertIcxToLoop(value) {
  return IconAmount.of(value, IconAmount.Unit.ICX).toLoop();
}
