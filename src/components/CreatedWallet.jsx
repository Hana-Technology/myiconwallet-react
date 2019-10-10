import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/pro-duotone-svg-icons';
import { faLongArrowRight } from '@fortawesome/pro-solid-svg-icons';
import Alert, { ALERT_TYPE_SUCCESS, ALERT_TYPE_WARN } from 'components/Alert';
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
        <Alert
          type={ALERT_TYPE_SUCCESS}
          title={wallet.getAddress()}
          showIcon={false}
          className="break-all mb-8"
        />
        <p className="mb-2">
          You should download your keystore file now and keep it somewhere private.
        </p>
        <Button href={keystoreFileUri} download="iconwallet.keystore" className="mb-8">
          <FontAwesomeIcon icon={faDownload} fixedWidth className="mr-1" />
          Download wallet keystore
        </Button>
        <Alert
          type={ALERT_TYPE_WARN}
          title="Don't forget your password"
          text="There is no way to recover your wallet if you forget the password"
          className="mb-8"
        />
        <divc className="flex flex-row-reverse">
          <Button to="/">
            View your wallet
            <FontAwesomeIcon icon={faLongArrowRight} fixedWidth className="text-sm ml-2" />
          </Button>
        </divc>
      </>
    )
  );
}

export default CreatedWallet;
