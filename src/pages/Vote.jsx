import React, { useEffect, useState } from 'react';
import { useIconService } from 'components/IconService';
import Layout from 'components/Layout';
import WalletHeader from 'components/WalletHeader';

function VotePage() {
  const { getPReps } = useIconService();
  const [pReps, setPReps] = useState(null);

  useEffect(() => {
    getPReps().then(pReps => setPReps(pReps));
  }, [getPReps]);

  if (pReps) console.log('P-Reps', pReps);

  return (
    <Layout title="Allocate Votes">
      <WalletHeader />
      <h2 className="text-2xl uppercase tracking-tight mt-4 lg:mt-6 mb-2">Allocate votes</h2>
      <p>Coming soon...</p>
    </Layout>
  );
}

export default VotePage;
