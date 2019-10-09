import React, { useState } from 'react';
import CreateWallet from 'components/CreateWallet';
import CreatedWallet from 'components/CreatedWallet';
import Layout from 'components/Layout';

function CreateWalletPage() {
  const [isCreated, setIsCreated] = useState(false);
  const [keystoreFile, setKeystoreFile] = useState(null);

  function handleOnCreateWallet(keystoreFile) {
    setKeystoreFile(keystoreFile);
    setIsCreated(true);
  }

  return (
    <Layout>
      <h2 className="text-2xl uppercase tracking-tight mb-2">
        Create{isCreated && 'd'} a new wallet
      </h2>
      {isCreated ? (
        <CreatedWallet keystoreFile={keystoreFile} />
      ) : (
        <CreateWallet onCreateWallet={handleOnCreateWallet} />
      )}
    </Layout>
  );
}

export default CreateWalletPage;
