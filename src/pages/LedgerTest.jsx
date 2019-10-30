import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import Transport from '@ledgerhq/hw-transport-webauthn';
import AppIcx from '@ledgerhq/hw-app-icx';
import Button from 'components/Button';
import Layout from 'components/Layout';

function LedgerTestPage() {
  const [address, setAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function getLedgerAddress() {
    setIsLoading(true);
    try {
      const transport = await Transport.create();
      const icx = new AppIcx(transport);
      const { address } = await icx.getAddress(`44'/4801368'/0'`, true, true);
      setAddress(String(address));
    } catch (error) {
      setAddress(null);
      console.error('Failed reading from Ledger device.', error.message);
    }
    setIsLoading(false);
  }

  return (
    <Layout title="Ledger Test">
      <h2 className="text-2xl uppercase tracking-tight">Ledger test</h2>
      <p className="mt-2">
        Click the button to get the ICX wallet address of a connected Ledger device.
      </p>
      <Button type="button" onClick={getLedgerAddress} className="mt-4">
        Get Ledger ICX wallet address
      </Button>
      <p className="mt-4">
        Ledger ICX address:{' '}
        {isLoading ? (
          <FontAwesomeIcon icon={faCircleNotch} spin className="ml-1" />
        ) : address ? (
          <b>{address}</b>
        ) : null}
      </p>
    </Layout>
  );
}

export default LedgerTestPage;
