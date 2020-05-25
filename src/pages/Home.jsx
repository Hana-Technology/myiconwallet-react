import React from 'react';
import AppBanner from 'components/AppBanner';
import Landing from 'components/Landing';
import Layout from 'components/Layout';
import ViewWallet from 'components/ViewWallet';
import { useWallet } from 'components/Wallet';

function HomePage() {
  const { wallet } = useWallet();

  return (
    <>
      {!wallet && <AppBanner />}
      <Layout styleMain={!!wallet}>{wallet ? <ViewWallet /> : <Landing />}</Layout>
    </>
  );
}

export default HomePage;
