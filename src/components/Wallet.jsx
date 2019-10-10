import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { IconWallet } from 'icon-sdk-js';

const INITIAL_STATE = {
  wallet: null,
  keystore: null,
  createWallet: null,
  unlockWallet: null,
  unloadWallet: null,
};

export const WalletContext = createContext(INITIAL_STATE);

export function useWallet() {
  return useContext(WalletContext);
}

function Wallet({ children }) {
  const [wallet, setWallet] = useState(null);
  const [keystore, setKeystore] = useState(null);

  function createWallet(password) {
    const wallet = IconWallet.create();
    const keystore = wallet.store(password);
    setWallet(wallet);
    setKeystore(keystore);
  }

  function unlockWallet(keystore, password) {
    try {
      const wallet = IconWallet.loadKeystore(keystore, password);
      setWallet(wallet);
      setKeystore(keystore);
      return true;
    } catch (_error) {
      return false;
    }
  }

  function unloadWallet() {
    setWallet(null);
    setKeystore(null);
  }

  return (
    <WalletContext.Provider value={{ wallet, keystore, createWallet, unlockWallet, unloadWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

Wallet.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Wallet;
