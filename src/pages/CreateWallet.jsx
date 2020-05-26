import React, { useState } from 'react';
import CreateWallet from 'components/CreateWallet';
import CreatedWallet from 'components/CreatedWallet';
import Layout from 'components/Layout';

function CreateWalletPage() {
  const [isCreated, setIsCreated] = useState(false);

  function handleOnCreateWallet() {
    setIsCreated(true);
  }

  return (
    <Layout title="Create a New Wallet" showAppBanner={!isCreated}>
      <h2 className="text-2xl uppercase tracking-tight">Create{isCreated && 'd'} a new wallet</h2>
      {isCreated ? <CreatedWallet /> : <CreateWallet onCreateWallet={handleOnCreateWallet} />}
    </Layout>
  );
}

export default CreateWalletPage;
