import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsb } from '@fortawesome/free-brands-svg-icons';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import { navigate } from '@reach/router';
import queryString from 'query-string';
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
  const [unlockMethod, setUnlockMethod] = useState(UNLOCK_METHODS.KEYSTORE);

  function onUnlockWallet() {
    const queryParams = queryString.parse(location.search);
    navigate(queryParams.redirectTo || '/');
  }

  return (
    <Layout title="Unlock Existing Wallet">
      <h2 className="text-2xl uppercase tracking-tight">Unlock existing wallet</h2>
      <div className="sm:flex items-start justify-between">
        <img
          src={authenticationSvg}
          alt="person entering secure website"
          className="hidden sm:block sm:order-2 sm:w-2/5 max-w-full flex-none sm:ml-6 sm:-mt-6"
        />

        <div className="sm:order-1 sm:flex-1">
          <div className="mt-4">
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
