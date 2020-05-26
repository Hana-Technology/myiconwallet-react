import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { navigate } from '@reach/router';
import queryString from 'query-string';
import Switch from 'react-switch';
import ReactTooltip from 'react-tooltip';
import colors from 'utils/colors';
import { WALLET_TYPE } from 'utils/constants';
import { NETWORK_REF_MAINNET, NETWORK_REF_TESTNET } from 'utils/network';
import { useIconService } from 'components/IconService';
import Layout from 'components/Layout';
import LedgerIcon from 'components/LedgerIcon';
import IconLogo from 'components/Logo';
import UnlockWithICONex from 'components/UnlockWithICONex';
import UnlockWithKeystore from 'components/UnlockWithKeystore';
import UnlockWithLedger from 'components/UnlockWithLedger';
import authenticationSvg from 'assets/authentication.svg';

function TabButton({ className, isActive, ...props }) {
  return (
    <button
      className={`font-bold px-3 py-2 rounded hover:shadow focus:shadow ${
        isActive ? 'bg-teal-500 hover:bg-teal-600 text-white' : 'border'
      } ${className || ''}`}
      type="button"
      {...props}
    />
  );
}

function UnlockWalletPage({ location }) {
  const { changeNetwork, network } = useIconService();
  const [unlockMethod, setUnlockMethod] = useState(WALLET_TYPE.KEYSTORE);

  function onUnlockWallet() {
    const queryParams = queryString.parse(location.search);
    navigate(queryParams.redirectTo || '/');
  }

  function handleChangeNetwork(checked) {
    changeNetwork(checked ? NETWORK_REF_MAINNET : NETWORK_REF_TESTNET);
  }

  return (
    <Layout title="Unlock Existing Wallet" showAppBanner>
      <div className="sm:flex items-start justify-between">
        <img
          src={authenticationSvg}
          alt="person entering secure website"
          className="hidden sm:block sm:order-2 sm:w-2/5 max-w-full flex-none sm:ml-6 mt-2"
        />

        <div className="sm:order-1 sm:flex-1">
          <div className="flex items-start justify-between">
            <h2 className="text-2xl uppercase tracking-tight">Unlock existing wallet</h2>

            <label className="text-right ml-3 mt-1">
              <div className="text-xs whitespace-no-wrap">
                Mainnet
                <button
                  type="button"
                  data-tip="Switch on to connect to mainnet, off connects to testnet"
                  className="text-gray-500 ml-1"
                >
                  <FontAwesomeIcon icon={faQuestionCircle} />
                </button>
                <ReactTooltip
                  place="top"
                  effect="solid"
                  multiline={true}
                  event="click mouseenter"
                  eventOff="click mouseleave"
                  clickable={true}
                />
              </div>
              <Switch
                checked={network.ref === NETWORK_REF_MAINNET}
                onChange={handleChangeNetwork}
                onColor={colors.green['600']}
                offColor={colors.gray['400']}
                height={24}
                width={45}
                checkedIcon={false}
                uncheckedIcon={false}
              ></Switch>
            </label>
          </div>

          <div className="mt-3">
            <TabButton
              onClick={() => setUnlockMethod(WALLET_TYPE.KEYSTORE)}
              isActive={unlockMethod === WALLET_TYPE.KEYSTORE}
            >
              <FontAwesomeIcon icon={faKey} className="mr-2 opacity-75" />
              Keystore
            </TabButton>
            <TabButton
              onClick={() => setUnlockMethod(WALLET_TYPE.LEDGER)}
              isActive={unlockMethod === WALLET_TYPE.LEDGER}
              className="ml-2"
            >
              <LedgerIcon className="mr-1 opacity-75" />
              Ledger
            </TabButton>
            <TabButton
              onClick={() => setUnlockMethod(WALLET_TYPE.ICONEX)}
              isActive={unlockMethod === WALLET_TYPE.ICONEX}
              className="ml-2"
            >
              <IconLogo iconOnly={true} className="mr-2 opacity-75" />
              ICONex
            </TabButton>
          </div>

          <div className="mt-6">
            {unlockMethod === WALLET_TYPE.KEYSTORE && (
              <UnlockWithKeystore onUnlockWallet={onUnlockWallet} />
            )}
            {unlockMethod === WALLET_TYPE.LEDGER && (
              <UnlockWithLedger onUnlockWallet={onUnlockWallet} />
            )}
            {unlockMethod === WALLET_TYPE.ICONEX && (
              <UnlockWithICONex onUnlockWallet={onUnlockWallet} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default UnlockWalletPage;
