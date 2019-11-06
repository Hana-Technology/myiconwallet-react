import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsb } from '@fortawesome/free-brands-svg-icons';
import { faKey, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { navigate } from '@reach/router';
import queryString from 'query-string';
import Switch from 'react-switch';
import ReactTooltip from 'react-tooltip';
import colors from 'utils/colors';
import { NETWORK_REF_MAINNET, NETWORK_REF_TESTNET } from 'utils/network';
import { useIconService } from 'components/IconService';
import Layout from 'components/Layout';
import UnlockWithKeystore from 'components/UnlockWithKeystore';
import UnlockWithLedger from 'components/UnlockWithLedger';
import authenticationSvg from 'assets/authentication.svg';

const UNLOCK_METHODS = {
  KEYSTORE: 'keystore',
  LEDGER: 'ledger',
};

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
  const [unlockMethod, setUnlockMethod] = useState(UNLOCK_METHODS.KEYSTORE);

  function onUnlockWallet() {
    const queryParams = queryString.parse(location.search);
    navigate(queryParams.redirectTo || '/');
  }

  function handleChangeNetwork(checked) {
    changeNetwork(checked ? NETWORK_REF_MAINNET : NETWORK_REF_TESTNET);
  }

  return (
    <Layout title="Unlock Existing Wallet">
      <div className="sm:flex items-start justify-between">
        <img
          src={authenticationSvg}
          alt="person entering secure website"
          className="hidden sm:block sm:order-2 sm:w-2/5 max-w-full flex-none sm:ml-6"
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
              onClick={() => setUnlockMethod(UNLOCK_METHODS.KEYSTORE)}
              isActive={unlockMethod === UNLOCK_METHODS.KEYSTORE}
            >
              <FontAwesomeIcon icon={faKey} className="mr-2 opacity-75" />
              With keystore
            </TabButton>
            <TabButton
              onClick={() => setUnlockMethod(UNLOCK_METHODS.LEDGER)}
              isActive={unlockMethod === UNLOCK_METHODS.LEDGER}
              className="ml-2"
            >
              <FontAwesomeIcon icon={faUsb} className="mr-2 opacity-75" />
              With Ledger
            </TabButton>
          </div>

          <div className="mt-6">
            {unlockMethod === UNLOCK_METHODS.KEYSTORE && (
              <UnlockWithKeystore onUnlockWallet={onUnlockWallet} />
            )}
            {unlockMethod === UNLOCK_METHODS.LEDGER && (
              <UnlockWithLedger onUnlockWallet={onUnlockWallet} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default UnlockWalletPage;
