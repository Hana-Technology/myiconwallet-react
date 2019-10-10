import React from 'react';
import Alert, { ALERT_TYPE_SUCCESS } from 'components/Alert';
import { useWallet } from 'components/Wallet';

function ViewWallet() {
  const { wallet } = useWallet();

  return (
    wallet && (
      <>
        <h2 className="text-2xl uppercase tracking-tight mb-2">Your wallet</h2>
        <Alert
          type={ALERT_TYPE_SUCCESS}
          title={wallet.getAddress()}
          showIcon={false}
          className="break-all mb-8"
        />
        <p>TODO:</p>
        <ul>
          <li>Link to ICON Tracker</li>
          <li>Show ISX and iScore</li>
          <li>Show graphic representation</li>
        </ul>
      </>
    )
  );
}

export default ViewWallet;
