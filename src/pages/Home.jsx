import React from 'react';
import Landing from 'components/Landing';
import Layout from 'components/Layout';
import ViewWallet from 'components/ViewWallet';
import { useWallet } from 'components/Wallet';

function HomePage() {
  const { wallet } = useWallet();

  return (
    <Layout showAppBanner={!wallet} styleMain={!!wallet}>
      {wallet ? <ViewWallet /> : <Landing />}
    </Layout>
  );
}

export default HomePage;
