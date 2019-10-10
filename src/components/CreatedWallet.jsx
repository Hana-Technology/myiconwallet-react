import React from 'react';
import Button from 'components/Button';
import { useWallet } from 'components/Wallet';

function CreatedWallet() {
  const { keystore, wallet } = useWallet();
  const keystoreData = encodeURIComponent(JSON.stringify(keystore));
  const keystoreFileUri = `data:application/json;charset=utf-8,${keystoreData}`;

  return (
    wallet && (
      <>
        <p className="mb-2">Your new wallet has been created with address:</p>
        <div className="inline-block break-all bg-teal-100 text-teal-800 text-lg font-bold p-2 mb-4 border border-teal-200 rounded">
          {wallet.getAddress()}
        </div>
        <p className="mb-4">
          You should download your keystore file now and keep it somewhere private. Also make sure
          that you remember the password to your keystore, there is no way to recover your wallet if
          you forget the password!
        </p>
        <p>
          <Button href={keystoreFileUri} download="iconwallet.keystore">
            Download wallet keystore
          </Button>
        </p>
      </>
    )
  );
}

export default CreatedWallet;
