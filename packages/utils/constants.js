import { convertLoopToIcx } from '@myiconwallet/utils/convertIcx';
import { IconConverter } from 'icon-sdk-js';

export const WALLET_TYPE = {
  KEYSTORE: 'keystore',
  LEDGER: 'ledger',
  ICONEX: 'iconex',
};

export const ICONEX_RELAY = {
  REQUEST: 'ICONEX_RELAY_REQUEST',
  RESPONSE: 'ICONEX_RELAY_RESPONSE',
};

export const WITHHOLD_BALANCE = IconConverter.toBigNumber(3);
export const ZERO = IconConverter.toBigNumber(0);

export const TRANSACTION_FEE = convertLoopToIcx(Math.pow(10, 15));

export const PASSWORD_COMPLEXITY_REGEXP = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[?!:;.,%+-/*=<>{}()[\]`"'~_^\\|@#$&]).{8,}$/;
