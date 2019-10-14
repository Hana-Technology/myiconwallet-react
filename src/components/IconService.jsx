import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import IconSDK, { IconBuilder, IconConverter, HttpProvider, SignedTransaction } from 'icon-sdk-js';
import { convertIcxToLoop, convertLoopToIcx } from 'utils/convertIcx';
import { getNetwork, NETWORK_REF_MAINNET, NETWORK_REF_TESTNET } from 'utils/network';

const API_VERSION = IconConverter.toBigNumber(3);
const GOVERNANCE_ADDRESS = 'cx0000000000000000000000000000000000000001';
const SCORE_INSTALL_ADDRESS = 'cx0000000000000000000000000000000000000000';

const INITIAL_STATE = {
  network: getNetwork(NETWORK_REF_TESTNET),
  toggleNetwork: null,
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
};

export const IconServiceContext = createContext(INITIAL_STATE);

export function useIconService() {
  return useContext(IconServiceContext);
}

function IconService({ children }) {
  const [network, setNetwork] = useState(INITIAL_STATE.network);
  const [iconProvider, setIconProvider] = useState(new HttpProvider(network.apiEndpoint));
  const [iconService, setIconService] = useState(new IconSDK(iconProvider));

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
      unstaking: result.unstake
        ? convertLoopToIcx(IconConverter.toBigNumber(result.unstake))
        : null,
      remainingBlocks: result.remainingBlocks
        ? IconConverter.toBigNumber(result.remainingBlocks)
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
    const signedTransaction = new SignedTransaction(setDelegationCall, wallet);
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
  function claimIScore(wallet) {
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
    const signedTransaction = new SignedTransaction(claimIScoreTransaction, wallet);
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
    const signedTransaction = new SignedTransaction(sendIcxTransaction, wallet);
    return iconService.sendTransaction(signedTransaction).execute();
  }

  /**
   * @param {Wallet} wallet
   * @param {number} newStake value as ICX
   * @returns {Promise<string>} transaction hash
   */
  function setStake(wallet, newStake) {
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
    const signedTransaction = new SignedTransaction(stakeIcxTransaction, wallet);
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

  function toggleNetwork() {
    const newNetworkRef =
      network.ref === NETWORK_REF_TESTNET ? NETWORK_REF_MAINNET : NETWORK_REF_TESTNET;
    const newNetwork = getNetwork(newNetworkRef);
    const newIconProvider = new HttpProvider(newNetwork.apiEndpoint);
    const newIconService = new IconSDK(iconProvider);
    setNetwork(newNetwork);
    setIconProvider(newIconProvider);
    setIconService(newIconService);
  }

  return (
    <IconServiceContext.Provider
      value={{
        network,
        toggleNetwork,
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
 * @property {BigNumber} [remainingBlocks] value as number
 *
 * @typedef {Object} IScoreResult
 * @property {BigNumber} iScore value as ICX
 * @property {BigNumber} estimatedICX value as ICX
 */
