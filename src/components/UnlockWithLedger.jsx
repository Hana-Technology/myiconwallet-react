import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import Transport from '@ledgerhq/hw-transport-webauthn';
import AppIcx from '@ledgerhq/hw-app-icx';
import Button from 'components/Button';

const BASE_PATH = `44'/4801368'/0'/0'`;

function UnlockWithLedger({ onUnlockWallet }) {
  const [icx, setIcx] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Setup transport and icx, attempt to connect to Ledger immediately
    setIsLoading(true);
    Transport.create().then(transport => {
      transport.setDebugMode(false);
      const icx = new AppIcx(transport);
      setIcx(icx);
      return connectToLedger(icx);
    });
  }, []);

  async function connectToLedger(icx) {
    setIsLoading(true);
    try {
      await icx.getAddress(`${BASE_PATH}/0'`, false, true);
      setIsConnected(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed connecting to Ledger.', error.message);
      setIsConnected(false);
      setIsLoading(false);
    }
  }

  return (
    <>
      {isLoading ? (
        <>
          <FontAwesomeIcon icon={faCircleNotch} spin className="text-xl align-middle mr-2" />
          Connecting to Ledger...
        </>
      ) : isConnected ? (
        <p>Table of Ledger addresses goes here....</p>
      ) : (
        <>
          <p>
            Connect your Ledger device and make sure the <b>ICON</b> app is running.
          </p>
          <Button type="button" onClick={() => connectToLedger(icx)} className="mt-4">
            Connect to Ledger
          </Button>
        </>
      )}
    </>
  );
}

export default UnlockWithLedger;
