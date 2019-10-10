import React from 'react';
import Layout from 'components/Layout';
import Logo from 'components/Logo';

function Home() {
  return (
    <Layout>
      <p className="text-lg">
        Your <Logo iconClassName="text-teal-600" /> wallet goes here!
      </p>
    </Layout>
  );
}

export default Home;