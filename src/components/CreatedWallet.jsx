import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faUnlockAlt } from '@fortawesome/pro-duotone-svg-icons';
import Alert, { ALERT_TYPE_SUCCESS, ALERT_TYPE_WARN } from 'components/Alert';
import Button from 'components/Button';
import { useWallet } from 'components/Wallet';
import buildingBlocksSvg from 'assets/building_blocks.svg';

function CreatedWallet() {
  const { keystore } = useWallet();
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const keystoreData = encodeURIComponent(JSON.stringify(keystore));
  const keystoreFileUri = `data:application/json;charset=utf-8,${keystoreData}`;

  function handleFileDownloadClick(event) {
    setHasDownloaded(true);
    // IE and Edge won't download the data: URL, need to use this IE/Edge-specific method
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      event.preventDefault();
      const json = JSON.stringify(keystore);
      const blob = new Blob([json], { type: 'application/json' });
      window.navigator.msSaveOrOpenBlob(blob, 'iconwallet.keystore');
    }
  }

  return (
    keystore && (
      <>
        <div className="sm:flex items-start justify-between">
          <div className="sm:pr-5">
            <p>Your new wallet has been created with address:</p>
            <Alert
              type={ALERT_TYPE_SUCCESS}
              text={keystore.address}
              showIcon={false}
              className="break-all mt-2"
            />
          </div>
          <img
            src={buildingBlocksSvg}
            alt="person building with blocks"
            className="hidden sm:block w-1/4 max-w-full flex-none -mt-6 mr-1"
          />
        </div>

        <p className="mt-6">
          Download your keystore file now and keep it somewhere safe. You will need your keystore
          file to access your wallet, but if anyone else finds it you can lose your funds.
        </p>
        <Alert
          type={ALERT_TYPE_WARN}
          title="Don't forget your password"
          text="There is no way to recover your wallet if you forget the password or if you lose your keystore file."
          className="mt-6"
        />

        <div className="sm:flex justify-between mt-6">
          <Button
            href={keystoreFileUri}
            download="iconwallet.keystore"
            className="block text-center sm:text-left"
            onClick={handleFileDownloadClick}
          >
            <FontAwesomeIcon icon={faDownload} fixedWidth className="mr-1" />
            Download keystore
          </Button>
          <Button
            to="/unlock"
            className="block text-center sm:text-right mt-3 sm:mt-0 sm:ml-3"
            disabled={!hasDownloaded}
            onClick={event => {
              if (!hasDownloaded) event.preventDefault();
            }}
          >
            <FontAwesomeIcon icon={faUnlockAlt} fixedWidth className="mr-1" />
            Unlock your wallet
          </Button>
        </div>
      </>
    )
  );
}

export default CreatedWallet;
