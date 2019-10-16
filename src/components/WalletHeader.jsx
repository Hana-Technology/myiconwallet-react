import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faWallet } from '@fortawesome/pro-duotone-svg-icons';
import { formatNumber } from 'utils/formatNumber';
import { useIconService } from 'components/IconService';
import { useWallet } from 'components/Wallet';

function WalletHeader() {
  const {
    network: { trackerUrl },
  } = useIconService();
  const { fullBalance, isLoading, refreshWallet, wallet } = useWallet();

  return (
    wallet && (
      <div className="bg-blue-600 text-blue-100 shadow-inner py-3 px-6 lg:px-8 -mt-6 -ml-6 -mr-6 lg:-mt-8 lg:-ml-8 lg:-mr-8">
        <div className="flex items-center justify-between">
          <a
            href={`${trackerUrl}/address/${wallet.getAddress()}`}
            title="View on ICON tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-no-wrap hover:text-white focus:text-white"
          >
            <FontAwesomeIcon icon={faWallet} className="mr-2" />
            {wallet.getAddress().substr(0, 6)}&hellip;{wallet.getAddress().substr(-8)}
          </a>
          <button
            onClick={() => refreshWallet()}
            disabled={isLoading}
            className="ml-4 sm:ml-6 whitespace-no-wrap hover:text-white focus:text-white"
          >
            {fullBalance && `${formatNumber(fullBalance, 2)} ICX`}
            <FontAwesomeIcon icon={faSync} spin={isLoading} className="ml-2" />
          </button>
        </div>
      </div>
    )
  );
}

export default WalletHeader;
