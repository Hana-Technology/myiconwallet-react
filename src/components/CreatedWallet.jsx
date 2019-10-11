import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/pro-duotone-svg-icons';
import { faLongArrowRight } from '@fortawesome/pro-solid-svg-icons';
import Alert, { ALERT_TYPE_SUCCESS, ALERT_TYPE_WARN } from 'components/Alert';
import Button from 'components/Button';
import { useWallet } from 'components/Wallet';
import buildingBlocksSvg from 'assets/building_blocks.svg';

function CreatedWallet() {
  const { keystore, wallet } = useWallet();
  const keystoreData = encodeURIComponent(JSON.stringify(keystore));
  const keystoreFileUri = `data:application/json;charset=utf-8,${keystoreData}`;

  return (
    wallet && (
      <>
        <div className="sm:flex items-start justify-between mb-6">
          <div className="sm:pr-5">
            <p className="mb-2">Your new wallet has been created with address:</p>
            <Alert
              type={ALERT_TYPE_SUCCESS}
              text={wallet.getAddress()}
              showIcon={false}
              className="break-all"
            />
          </div>
          <img
            src={buildingBlocksSvg}
            alt="person building with blocks"
            className="hidden sm:block w-1/4 max-w-full flex-none -mt-6 mr-1"
          />
        </div>

        <p className="mb-6">
          You should download your keystore file now and keep it somewhere private.
        </p>
        <Alert
          type={ALERT_TYPE_WARN}
          title="Don't forget your password"
          text="There is no way to recover your wallet if you forget the password"
          className="mb-6"
        />

        <div className="sm:flex justify-between">
          <Button
            href={keystoreFileUri}
            download="iconwallet.keystore"
            className="block sm:inline-block"
          >
            <FontAwesomeIcon icon={faDownload} fixedWidth className="mr-1" />
            Download keystore
          </Button>
          <Button to="/" className="block sm:inline-block text-right sm:ml-2">
            View your wallet
            <FontAwesomeIcon icon={faLongArrowRight} fixedWidth className="text-sm ml-2" />
          </Button>
        </div>
      </>
    )
  );
}

export default CreatedWallet;
