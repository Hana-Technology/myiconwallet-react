import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLink, faSpinnerThird, faSync } from '@fortawesome/pro-duotone-svg-icons';
import { Pie } from 'react-chartjs-2';
import colors from 'utils/colors';
import { formatNumber } from 'utils/formatNumber';
import { useWallet } from 'components/Wallet';

const TRACKER_BASE_URL = 'https://zicon.tracker.solidwallet.io/address';

function ViewWallet() {
  const {
    balance,
    iscore: { iscore, estimatedICX },
    stake: { stake, unstake },
    wallet,
    isLoading,
    refreshWallet,
  } = useWallet();
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!(balance && stake)) return;

    setChartData({
      labels: ['Available', 'Staked', 'Unstaking'],
      datasets: [
        {
          data: [balance.toNumber(), stake.toNumber(), unstake ? unstake.toNumber() : 0],
          backgroundColor: [colors.teal['500'], colors.blue['500'], colors.purple['500']],
          hoverBackgroundColor: [colors.teal['600'], colors.blue['600'], colors.purple['600']],
        },
      ],
    });
  }, [balance, stake, unstake]);

  return (
    wallet && (
      <>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl uppercase tracking-tight">Your wallet</h2>
          <button
            onClick={() => refreshWallet()}
            disabled={isLoading}
            className="bg-gray-100 border border-gray-300 text-gray-700 text-sm uppercase tracking-tight px-2 py-1 rounded hover:bg-gray-200 focus:bg-gray-200 hover:shadow focus:shadow flex-none"
          >
            <FontAwesomeIcon icon={faSync} spin={isLoading} className="mr-2" />
            refresh
          </button>
        </div>

        <div className="mb-2">
          <div className="break-all text-lg">
            {wallet.getAddress()}{' '}
            <a
              href={`${TRACKER_BASE_URL}/${wallet.getAddress()}`}
              title="View on ICON tracker"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faExternalLink} className="ml-1" />
            </a>
          </div>
          <div className="text-sm text-gray-600 uppercase tracking-tight">Address</div>
        </div>

        <div className="sm:flex items-start justify-between">
          <div>
            <div className="mb-2">
              <div className="text-4xl leading-tight">
                {!balance && isLoading ? (
                  <FontAwesomeIcon icon={faSpinnerThird} spin className="ml-1" />
                ) : (
                  balance && (
                    <>
                      {formatNumber(balance)}
                      <span className="text-lg ml-2">ICX</span>
                    </>
                  )
                )}
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-tight">
                Available balance
              </div>
            </div>
            <div className="mb-2">
              <div className="text-4xl leading-tight">
                {!stake && isLoading ? (
                  <FontAwesomeIcon icon={faSpinnerThird} spin className="ml-1" />
                ) : (
                  stake && (
                    <>
                      {formatNumber(stake)}
                      <span className="text-lg ml-2">ICX</span>
                    </>
                  )
                )}
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-tight">Staked</div>
            </div>
            <div>
              <div className="text-4xl leading-tight">
                {!iscore && isLoading ? (
                  <FontAwesomeIcon icon={faSpinnerThird} spin className="ml-1" />
                ) : (
                  iscore && (
                    <>
                      {formatNumber(iscore)}
                      <span className="text-lg ml-2">~{formatNumber(estimatedICX)} ICX</span>
                    </>
                  )
                )}
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-tight">iScore</div>
            </div>
          </div>
          <div className="flex-none mx-auto mt-6 sm:m-0">
            {chartData && <Pie data={chartData} legend={{ position: 'bottom' }} height={200} />}
          </div>
        </div>
      </>
    )
  );
}

export default ViewWallet;
