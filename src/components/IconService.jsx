import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import IconSDK, { IconBuilder, IconConverter, HttpProvider } from 'icon-sdk-js';

const NETWORK_MAINNET = 'mainnet';
const NETWORK_TESTNET = 'testnet';
const GOVERNANCE_ADDRESS = 'cx0000000000000000000000000000000000000000';
const ICX_LOOP_RATIO = Math.pow(10, 18);

const INITIAL_STATE = {
  network: NETWORK_TESTNET,
  toggleNetwork: null,
  iconService: null,
  getBalance: null,
  getIscore: null,
  getStake: null,
};

function getIconProviderUrl(network) {
  switch (network) {
    case NETWORK_MAINNET:
      return process.env.REACT_APP_ICON_PROVIDER_MAINNET;
    case NETWORK_TESTNET:
    default:
      return process.env.REACT_APP_ICON_PROVIDER_TESTNET;
  }
}

export const IconServiceContext = createContext(INITIAL_STATE);

export function useIconService() {
  return useContext(IconServiceContext);
}

/**
 * @param {BigNumber} value value as loops
 * @returns {BigNumber} value as ICX
 */
function convertLoopsToICX(value) {
  return value.dividedBy(ICX_LOOP_RATIO);
}

function IconService({ children }) {
  const [network, setNetwork] = useState(INITIAL_STATE.network);
  const [iconProvider, setIconProvider] = useState(new HttpProvider(getIconProviderUrl(network)));
  const [iconService, setIconService] = useState(new IconSDK(iconProvider));

  /**
   * @param {string} address a wallet address
   * @returns {BigNumber} value as ICX
   */
  async function getBalance(address) {
    const balanceInLoops = await iconService.getBalance(address).execute();
    return convertLoopsToICX(balanceInLoops);
  }

  /**
   * @typedef {Object} IscoreResult
   * @property {BigNumber} iscore value as ICX
   * @property {BigNumber} estimatedICX value as ICX
   *
   * @function
   * @param {string} address a wallet address
   * @returns {IscoreResult}
   */
  async function getIscore(address) {
    const builder = new IconBuilder.CallBuilder();
    const queryIScoreCall = builder
      .to(GOVERNANCE_ADDRESS)
      .method('queryIScore')
      .params({ address })
      .build();
    const result = await iconService.call(queryIScoreCall).execute();

    return {
      iscore: convertLoopsToICX(IconConverter.toBigNumber(result.iscore)),
      estimatedICX: convertLoopsToICX(IconConverter.toBigNumber(result.estimatedICX)),
    };
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
      stake: convertLoopsToICX(IconConverter.toBigNumber(result.stake)),
      unstake: result.unstake ? convertLoopsToICX(IconConverter.toBigNumber(result.unstake)) : null,
      remainingBlocks: result.remainingBlocks
        ? IconConverter.toBigNumber(result.remainingBlocks)
        : null,
    };
  }

  function toggleNetwork() {
    const newNetwork = network === NETWORK_TESTNET ? NETWORK_MAINNET : NETWORK_TESTNET;
    const newIconProvider = new HttpProvider(getIconProviderUrl(newNetwork));
    const newIconService = new IconSDK(newIconProvider);
    setNetwork(newNetwork);
    setIconProvider(newIconProvider);
    setIconService(newIconService);
  }

  return (
    <IconServiceContext.Provider
      value={{ network, toggleNetwork, iconService, getBalance, getIscore, getStake }}
    >
      {children}
    </IconServiceContext.Provider>
  );
}

IconService.propTypes = {
  children: PropTypes.node.isRequired,
};

export default IconService;
