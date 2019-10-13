import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSync, faWallet } from '@fortawesome/pro-duotone-svg-icons';
import { Link } from '@reach/router';
import { formatNumber } from 'utils/formatNumber';
import { useIconService } from 'components/IconService';
import { useWallet } from 'components/Wallet';

function WalletHeader() {
  const {
    network: { trackerUrl },
  } = useIconService();
  const { balance, isLoading, refreshWallet, wallet } = useWallet();

  return (
    wallet && (
      <div className="bg-blue-600 text-blue-100 shadow-inner py-3 px-6 lg:px-8 -mt-6 -ml-6 -mr-6 lg:-mt-8 lg:-ml-8 lg:-mr-8">
        <div className="flex items-center justify-between">
          <Link to="/">
            <FontAwesomeIcon icon={faHome} swapOpacity className="text-lg" />
          </Link>
          <div className="w-full flex justify-end ml-4 sm:ml-6">
            <a
              href={`${trackerUrl}/address/${wallet.getAddress()}`}
              title="View on ICON tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-no-wrap hover:text-white focus:text-white"
            >
              <FontAwesomeIcon icon={faWallet} className="hidden sm:inline-block mr-2" />
              hx&hellip;{wallet.getAddress().substr(-8)}
            </a>
            <button
              onClick={() => refreshWallet()}
              disabled={isLoading}
              className="ml-4 sm:ml-6 whitespace-no-wrap hover:text-white focus:text-white"
            >
              {balance && `${formatNumber(balance, 2)} ICX`}
              <FontAwesomeIcon icon={faSync} spin={isLoading} className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    )
  );
}

export default WalletHeader;
