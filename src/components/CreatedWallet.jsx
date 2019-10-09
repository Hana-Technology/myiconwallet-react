import React from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';

function CreatedWallet({ keystoreFile }) {
  const keystoreData = encodeURIComponent(JSON.stringify(keystoreFile));
  const keystoreDataUri = `data:application/json;charset=utf-8,${keystoreData}`;

  return (
    <>
      <p className="mb-4">
        Your new wallet has been created with address <b>{keystoreFile.address}</b>
      </p>
      <p className="mb-4">
        You should download your keystore now and keep it somewhere private. Also make sure that you
        remember the password to your keystore so that you can continue using it.
      </p>
      <p>
        <Button href={keystoreDataUri} download="iconwallet.keystore">
          Download wallet keystore
        </Button>
      </p>
    </>
  );
}

CreatedWallet.propTypes = {
  keystoreFile: PropTypes.object.isRequired,
};

export default CreatedWallet;
