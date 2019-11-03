import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { IconWallet } from 'icon-sdk-js';
import { useIconService } from 'components/IconService';

const INITIAL_STATE = {
  wallet: null,
  keystore: null,
  balance: null,
  fullBalance: null,
  stake: {},
  iScore: {},
  delegations: null,
  votingPower: null, // Is this required?
  createWallet: null,
  unlockWallet: null,
  accessLedgerWallet: null,
  unloadWallet: null,
  refreshWallet: null,
  isLoading: false,
};

export const WalletContext = createContext(INITIAL_STATE);

export function useWallet() {
  return useContext(WalletContext);
}

function Wallet({ children }) {
  const { getBalance, getDelegations, getIScore, getStake } = useIconService();
  const [wallet, setWallet] = useState(INITIAL_STATE.wallet);
  const [keystore, setKeystore] = useState(INITIAL_STATE.keystore);
  const [balance, setBalance] = useState(INITIAL_STATE.balance);
  const [fullBalance, setFullBalance] = useState(INITIAL_STATE.fullBalance);
  const [stake, setStake] = useState(INITIAL_STATE.stake);
  const [iScore, setIScore] = useState(INITIAL_STATE.iScore);
  const [delegations, setDelegations] = useState(INITIAL_STATE.delegations);
  const [votingPower, setVotingPower] = useState(INITIAL_STATE.votingPower);
  const [isLoading, setIsLoading] = useState(INITIAL_STATE.isLoading);

  function createWallet(password) {
    const wallet = IconWallet.create();
    const keystore = wallet.store(password);
    setKeystore(keystore);
  }

  function unlockWallet(keystore, password) {
    try {
      const wallet = IconWallet.loadKeystore(keystore, password);
      setWallet(wallet);
      setKeystore(keystore);
      refreshWallet(wallet);
      return true;
    } catch (_error) {
      return false;
    }
  }

  function accessLedgerWallet(wallet) {
    const newWallet = {
      getAddress: () => wallet.address,
      getPath: () => wallet.path,
      isLedgerWallet: () => true,
    };
    setWallet(newWallet);
    refreshWallet(newWallet);
  }

  function unloadWallet() {
    setWallet(null);
    setKeystore(null);
    setBalance(INITIAL_STATE.balance);
    setFullBalance(INITIAL_STATE.fullBalance);
    setIScore(INITIAL_STATE.iScore);
    setStake(INITIAL_STATE.stake);
    setDelegations(INITIAL_STATE.delegations);
    setVotingPower(INITIAL_STATE.votingPower);
  }

  async function refreshWallet(providedWallet) {
    setIsLoading(true);
    const address = (providedWallet || wallet).getAddress();

    const [balance, stake, iScore, { delegations, votingPower }] = await Promise.all([
      getBalance(address),
      getStake(address),
      getIScore(address),
      getDelegations(address),
    ]);
    setBalance(balance);
    setStake(stake);
    setIScore(iScore);
    setDelegations(delegations);
    setVotingPower(votingPower);

    const { staked, unstaking } = stake;
    let fullBalance = balance.plus(staked);
    if (unstaking) fullBalance = fullBalance.plus(unstaking);
    setFullBalance(fullBalance);

    setIsLoading(false);
  }

  return (
    <WalletContext.Provider
      value={{
        wallet,
        keystore,
        balance,
        fullBalance,
        stake,
        iScore,
        delegations,
        votingPower,
        createWallet,
        unlockWallet,
        accessLedgerWallet,
        unloadWallet,
        refreshWallet,
        isLoading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

Wallet.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Wallet;
