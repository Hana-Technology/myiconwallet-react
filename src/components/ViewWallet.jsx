import React from 'react';
import { useWallet } from 'components/Wallet';

function ViewWallet() {
  const { wallet } = useWallet();

  return (
    wallet && (
      <p className="text-lg">
        Your wallet address is <b>{wallet.getAddress()}</b>!
      </p>
    )
  );
}

export default ViewWallet;
