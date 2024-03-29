import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { WALLET_TYPE } from 'utils/constants';
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
  accessLedgerWallet: null,
  accessICONexWallet: null,
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

  function accessLedgerWallet(wallet) {
    const newWallet = {
      getAddress: () => wallet.address,
      getPath: () => wallet.path,
      type: WALLET_TYPE.LEDGER,
    };
    setWallet(newWallet);
    refreshWallet(newWallet);
  }

  function accessICONexWallet(address) {
    const wallet = {
      getAddress: () => address,
      type: WALLET_TYPE.ICONEX,
    };
    setWallet(wallet);
    refreshWallet(wallet);
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
    setFullBalance(balance.plus(staked).plus(unstaking || 0));

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
        accessLedgerWallet,
        accessICONexWallet,
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
