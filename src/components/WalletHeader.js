import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet } from '@fortawesome/pro-duotone-svg-icons';
import { useIconService } from 'components/IconService';
import { useWallet } from 'components/Wallet';

function WalletHeader() {
  const {
    network: { trackerUrl },
  } = useIconService();
  const { wallet } = useWallet();

  return (
    <div className="bg-blue-600 text-blue-100 shadow-inner py-3 px-6 lg:px-8 -mt-6 -ml-6 -mr-6 lg:-mt-8 lg:-ml-8 lg:-mr-8">
      {wallet && (
        <div className="">
          <a
            href={`${trackerUrl}/address/${wallet.getAddress()}`}
            title="View on ICON tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white focus:text-white"
          >
            <FontAwesomeIcon icon={faWallet} className="mr-1" />
            hx&hellip;{wallet.getAddress().substr(-6)}
          </a>
        </div>
      )}
    </div>
  );
}

export default WalletHeader;