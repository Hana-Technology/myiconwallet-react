import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import IconSDK from 'icon-sdk-js';
const { HttpProvider, IconWallet } = IconSDK;

const NETWORK_MAINNET = 'mainnet';
const NETWORK_TESTNET = 'testnet';

const INITIAL_STATE = {
  network: NETWORK_TESTNET,
  toggleNetwork: null,
  iconService: null,
  wallet: null,
  createWallet: null,
  unloadWallet: null,
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

function IconService({ children }) {
  const [network, setNetwork] = useState(INITIAL_STATE.network);
  const [iconProvider, setIconProvider] = useState(new HttpProvider(getIconProviderUrl(network)));
  const [iconService, setIconService] = useState(new IconSDK(iconProvider));
  const [wallet, setWallet] = useState(null);

  function toggleNetwork() {
    const newNetwork = network === NETWORK_TESTNET ? NETWORK_MAINNET : NETWORK_TESTNET;
    const newIconProvider = new HttpProvider(getIconProviderUrl(newNetwork));
    const newIconService = new IconSDK(newIconProvider);
    setNetwork(newNetwork);
    setIconProvider(newIconProvider);
    setIconService(newIconService);
    unloadWallet();
  }

  function createWallet(password) {
    const wallet = IconWallet.create();
    setWallet(wallet);
    return wallet.store(password);
  }

  function unloadWallet() {
    setWallet(null);
  }

  return (
    <IconServiceContext.Provider
      value={{
        network,
        toggleNetwork,
        iconService,
        wallet,
        createWallet,
        unloadWallet,
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
