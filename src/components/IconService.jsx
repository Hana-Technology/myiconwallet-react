import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import IconSDK, { IconBuilder, IconConverter, HttpProvider, SignedTransaction } from 'icon-sdk-js';
import { convertIcxToLoop, convertLoopToIcx } from 'utils/convertIcx';
import { getNetwork, NETWORK_REF_MAINNET, NETWORK_REF_TESTNET } from 'utils/network';

const API_VERSION = IconConverter.toBigNumber(3);
const GOVERNANCE_ADDRESS = 'cx0000000000000000000000000000000000000000';
const GOVERNANCE_SCORE_ADDRESS = 'cx0000000000000000000000000000000000000001';

const INITIAL_STATE = {
  network: getNetwork(NETWORK_REF_TESTNET),
  toggleNetwork: null,
  iconService: null,
  getBalance: null,
  getStake: null,
  getIScore: null,
  claimIScore: null,
  sendIcx: null,
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
   * @typedef {Object} StakeResult
   * @property {BigNumber} stake value as ICX
   * @property {BigNumber} [unstake] value as ICX
   * @property {BigNumber} [remainingBlocks] value as number
   *
   * @function
   * @param {string} address a wallet address
   * @returns {StakeResult}
   */
  async function getStake(address) {
    const builder = new IconBuilder.CallBuilder();
    const getStakeCall = builder
      .to(GOVERNANCE_ADDRESS)
      .method('getStake')
      .params({ address })
      .build();
    const result = await iconService.call(getStakeCall).execute();

    return {
      stake: convertLoopToIcx(IconConverter.toBigNumber(result.stake)),
      unstake: result.unstake ? convertLoopToIcx(IconConverter.toBigNumber(result.unstake)) : null,
      remainingBlocks: result.remainingBlocks
        ? IconConverter.toBigNumber(result.remainingBlocks)
        : null,
    };
  }

  /**
   * @typedef {Object} IScoreResult
   * @property {BigNumber} iScore value as ICX
   * @property {BigNumber} estimatedICX value as ICX
   *
   * @function
   * @param {string} address a wallet address
   * @returns {IScoreResult}
   */
  async function getIScore(address) {
    const builder = new IconBuilder.CallBuilder();
    const queryIScoreCall = builder
      .to(GOVERNANCE_ADDRESS)
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
   * @typedef {Object} Wallet
   *
   * @function
   * @param {Wallet} wallet
   * @returns {Promise<string>}
   */
  function claimIScore(wallet) {
    const builder = new IconBuilder.CallTransactionBuilder();
    const claimIScoreTransaction = builder
      .nid(network.nid)
      .from(wallet.getAddress())
      .to(GOVERNANCE_ADDRESS)
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
   * @param {string} amount
   * @param {string} destinationAddress
   * @returns {Promise<string>}
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

  async function getDefaultStepCost() {
    const builder = new IconBuilder.CallBuilder();
    const getStepCostsCall = builder
      .to(GOVERNANCE_SCORE_ADDRESS)
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
        getIScore,
        claimIScore,
        sendIcx,
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
