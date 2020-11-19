import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import Transport from '@ledgerhq/hw-transport-u2f';
import AppIcx from '@ledgerhq/hw-app-icx';
import IconSDK, {
  IconBuilder,
  IconConverter,
  IconUtil,
  HttpProvider,
  SignedTransaction,
} from 'icon-sdk-js';
import { ICONEX_RELAY, WALLET_TYPE } from 'utils/constants';
import { convertIcxToLoop, convertLoopToIcx } from 'utils/convertIcx';
import { getNetwork, NETWORK_REF_MAINNET, NETWORK_REF_TESTNET } from 'utils/network';
import { wait } from 'utils/wait';

const API_VERSION = IconConverter.toBigNumber(3);
const GOVERNANCE_ADDRESS = 'cx0000000000000000000000000000000000000001';
const SCORE_INSTALL_ADDRESS = 'cx0000000000000000000000000000000000000000';
const NETWORK_REF =
  process.env.NODE_ENV === 'production' ? NETWORK_REF_MAINNET : NETWORK_REF_TESTNET;

const INITIAL_STATE = {
  network: getNetwork(NETWORK_REF),
  changeNetwork: null,
  iconService: null,
  getBalance: null,
  getStake: null,
  getDelegations: null,
  setDelegations: null,
  getIScore: null,
  claimIScore: null,
  sendIcx: null,
  setStake: null,
  getPReps: null,
  waitForTransaction: null,
};
const INITIAL_ICON_PROVIDER = new HttpProvider(INITIAL_STATE.network.apiEndpoint);

export const IconServiceContext = createContext(INITIAL_STATE);

export function useIconService() {
  return useContext(IconServiceContext);
}

function IconService({ children }) {
  const [network, setNetwork] = useState(INITIAL_STATE.network);
  const [iconService, setIconService] = useState(new IconSDK(INITIAL_ICON_PROVIDER));

  /**
   * @param {string} address a wallet address
   * @returns {BigNumber} value as ICX
   */
  async function getBalance(address) {
    const balanceInLoops = await iconService.getBalance(address).execute();
    return convertLoopToIcx(balanceInLoops);
  }

  /**
   * @param {string} address a wallet address
   * @returns {StakeResult}
   */
  async function getStake(address) {
    const builder = new IconBuilder.CallBuilder();
    const getStakeCall = builder
      .to(SCORE_INSTALL_ADDRESS)
      .method('getStake')
      .params({ address })
      .build();
    const result = await iconService.call(getStakeCall).execute();

    return {
      staked: convertLoopToIcx(IconConverter.toBigNumber(result.stake)),
      unstaking: result.unstakes
        ? result.unstakes.reduce(
            (unstaking, { unstake }) =>
              unstaking.plus(convertLoopToIcx(IconConverter.toBigNumber(unstake))),
            IconConverter.toBigNumber(0)
          )
        : null,
    };
  }

  /**
   * @param {string} address a wallet address
   * @returns {Promise<Delegation[]>}
   */
  async function getDelegations(address) {
    const builder = new IconBuilder.CallBuilder();
    const getDelegationCall = builder
      .to(SCORE_INSTALL_ADDRESS)
      .method('getDelegation')
      .params({ address })
      .build();
    const result = await iconService.call(getDelegationCall).execute();

    return {
      delegations: result.delegations.map(({ address, value }) => ({
        address,
        value: convertLoopToIcx(IconConverter.toBigNumber(value)),
      })),
      votingPower: convertLoopToIcx(IconConverter.toBigNumber(result.votingPower)),
    };
  }

  /**
   * @param {Wallet} wallet
   * @param {Delegation[]} delegations
   * @returns {Promise<string>} transaction hash
   */
  async function setDelegations(wallet, delegations) {
    const delegationsToSend = delegations.map(({ address, value }) => ({
      address,
      value: IconConverter.toHex(convertIcxToLoop(value)),
    }));
    const builder = new IconBuilder.CallTransactionBuilder();
    const setDelegationCall = builder
      .nid(network.nid)
      .from(wallet.getAddress())
      .to(SCORE_INSTALL_ADDRESS)
      .method('setDelegation')
      .params({ delegations: delegationsToSend })
      .stepLimit(IconConverter.toBigNumber(1000000))
      .version(API_VERSION)
      .timestamp(Date.now() * 1000)
      .build();
    const signedTransaction = await signTransaction(setDelegationCall, wallet);
    return iconService.sendTransaction(signedTransaction).execute();
  }

  /**
   * @param {string} address a wallet address
   * @returns {IScoreResult}
   */
  async function getIScore(address) {
    const builder = new IconBuilder.CallBuilder();
    const queryIScoreCall = builder
      .to(SCORE_INSTALL_ADDRESS)
      .method('queryIScore')
      .params({ address })
      .build();
    const result = await iconService.call(queryIScoreCall).execute();

    return {
      iScore: convertLoopToIcx(IconConverter.toBigNumber(result.iscore)),
      estimatedICX: convertLoopToIcx(IconConverter.toBigNumber(result.estimatedICX)),
    };
  }

  /**
   * @param {Wallet} wallet
   * @returns {Promise<string>} transaction hash
   */
  async function claimIScore(wallet) {
    const builder = new IconBuilder.CallTransactionBuilder();
    const claimIScoreTransaction = builder
      .nid(network.nid)
      .from(wallet.getAddress())
      .to(SCORE_INSTALL_ADDRESS)
      .value(0)
      .method('claimIScore')
      .stepLimit(IconConverter.toBigNumber(1000000))
      .version(API_VERSION)
      .timestamp(Date.now() * 1000)
      .build();
    const signedTransaction = await signTransaction(claimIScoreTransaction, wallet);
    return iconService.sendTransaction(signedTransaction).execute();
  }

  /**
   * @param {Wallet} wallet
   * @param {string} amount value as ICX
   * @param {string} destinationAddress a wallet address
   * @returns {Promise<string>} transaction hash
   */
  async function sendIcx(wallet, amount, destinationAddress) {
    const stepLimit = await getDefaultStepCost();
    const builder = new IconBuilder.IcxTransactionBuilder();
    const sendIcxTransaction = builder
      .nid(network.nid)
      .from(wallet.getAddress())
      .to(destinationAddress)
      .value(convertIcxToLoop(amount))
      .stepLimit(stepLimit)
      .version(API_VERSION)
      .timestamp(Date.now() * 1000)
      .build();
    const signedTransaction = await signTransaction(sendIcxTransaction, wallet);
    return iconService.sendTransaction(signedTransaction).execute();
  }

  /**
   * @param {Wallet} wallet
   * @param {number} newStake value as ICX
   * @returns {Promise<string>} transaction hash
   */
  async function setStake(wallet, newStake) {
    const builder = new IconBuilder.CallTransactionBuilder();
    const stakeIcxTransaction = builder
      .nid(network.nid)
      .from(wallet.getAddress())
      .to(SCORE_INSTALL_ADDRESS)
      .method('setStake')
      .params({ value: IconConverter.toHex(convertIcxToLoop(newStake)) })
      .stepLimit(IconConverter.toBigNumber(1000000))
      .version(API_VERSION)
      .timestamp(Date.now() * 1000)
      .build();
    const signedTransaction = await signTransaction(stakeIcxTransaction, wallet);
    return iconService.sendTransaction(signedTransaction).execute();
  }

  /**
   * @returns {Promise<PRep[]>}
   */
  async function getPReps() {
    const builder = new IconBuilder.CallBuilder();
    const getPRepsCall = builder
      .to(SCORE_INSTALL_ADDRESS)
      .method('getPReps')
      .build();
    const { preps } = await iconService.call(getPRepsCall).execute();
    return preps;
  }

  async function getDefaultStepCost() {
    const builder = new IconBuilder.CallBuilder();
    const getStepCostsCall = builder
      .to(GOVERNANCE_ADDRESS)
      .method('getStepCosts')
      .build();
    const { default: defaultStepCost } = await iconService.call(getStepCostsCall).execute();
    return defaultStepCost;
  }

  async function signTransaction(transaction, wallet) {
    const rawTransaction = IconConverter.toRawTransaction(transaction);
    if (wallet.type === WALLET_TYPE.LEDGER) {
      const hashKey = IconUtil.generateHashKey(rawTransaction);
      const transport = await Transport.create();
      const icx = new AppIcx(transport);
      const { signedRawTxBase64 } = await icx.signTransaction(wallet.getPath(), hashKey);
      rawTransaction.signature = signedRawTxBase64;
      return {
        getProperties: () => rawTransaction,
        getSignature: () => signedRawTxBase64,
      };
    } else if (wallet.type === WALLET_TYPE.ICONEX) {
      const transactionHash = IconUtil.makeTxHash(rawTransaction);
      return new Promise((resolve, reject) => {
        window.addEventListener(
          ICONEX_RELAY.RESPONSE,
          ({ detail: { type, payload } }) => {
            if (type === 'RESPONSE_SIGNING') {
              rawTransaction.signature = payload;
              resolve({
                getProperties: () => rawTransaction,
                getSignature: () => payload,
              });
            } else if (type === 'CANCEL_SIGNING') {
              reject(
                new Error(
                  'Transaction was rejected in ICONex. Either the Cancel button was clicked or the ICONex popup was closed.'
                )
              );
            } else {
              reject(new Error(`Received unknown ICONex event ${type}.`));
            }
          },
          { once: true }
        );
        window.dispatchEvent(
          new CustomEvent(ICONEX_RELAY.REQUEST, {
            detail: {
              type: 'REQUEST_SIGNING',
              payload: { from: wallet.getAddress(), hash: transactionHash },
            },
          })
        );
      });
    } else {
      return new SignedTransaction(transaction, wallet);
    }
  }

  async function waitForTransaction(txHash, maxAttempts = 10) {
    const MS_BETWEEN_ATTEMPS = 600;

    let count = 0;
    while (true) {
      try {
        let transaction = await iconService.getTransactionResult(txHash).execute();
        return transaction;
      } catch (error) {
        count++;
        if (count === maxAttempts)
          throw new Error(`Gave up waiting for transaction ${txHash}, last error: ${error}`);

        await wait(MS_BETWEEN_ATTEMPS);
      }
    }
  }

  /**
   * @param {('mainnet'|'testnet')} networkRef
   */
  function changeNetwork(networkRef) {
    if (networkRef === network.ref) return;

    const newNetwork = getNetwork(networkRef);
    const iconProvider = new HttpProvider(newNetwork.apiEndpoint);
    setIconService(new IconSDK(iconProvider));
    setNetwork(newNetwork);
  }

  return (
    <IconServiceContext.Provider
      value={{
        network,
        changeNetwork,
        iconService,
        getBalance,
        getStake,
        getDelegations,
        setDelegations,
        getIScore,
        claimIScore,
        sendIcx,
        setStake,
        getPReps,
        waitForTransaction,
      }}
    >
      {children}
    </IconServiceContext.Provider>
  );
}

IconService.propTypes = {
  children: PropTypes.node.isRequired,
};

export default IconService;

/**
 * @typedef {Object} Wallet
 * @property {Function} getAddress
 * @property {Function} [getPath]
 * @property {'keystore'|'ledger'|'iconex'} type
 *
 * @typedef {Object} PRep
 * @property {string} address a wallet address
 * @property {string} name
 * @property {string} city
 * @property {string} country
 *
 * @typedef {Object} Delegation
 * @property {string} address a P-Rep address
 * @property {BigNumber} value vote amount in ICX
 *
 * @typedef {Object} DelegationsResult
 * @property {Delegation[]} delegations
 * @property {BigNumber} votingPower value as ICX
 *
 * @typedef {Object} StakeResult
 * @property {BigNumber} staked value as ICX
 * @property {BigNumber} [unstaking] value as ICX
 *
 * @typedef {Object} IScoreResult
 * @property {BigNumber} iScore value as ICX
 * @property {BigNumber} estimatedICX value as ICX
 */
