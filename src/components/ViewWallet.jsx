import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExchange,
  faExternalLink,
  faSpinnerThird,
  faShareSquare,
  faSignIn,
  faSync,
  faVoteYea,
} from '@fortawesome/pro-duotone-svg-icons';
import swal from '@sweetalert/with-react';
import { Pie } from 'react-chartjs-2';
import colors from 'utils/colors';
import { formatNumber } from 'utils/formatNumber';
import Button from 'components/Button';
import { useIconService } from 'components/IconService';
import { useWallet } from 'components/Wallet';

const EMPTY_CHART_DATA = {
  datasets: [
    {
      data: [100],
      backgroundColor: [colors.gray['200']],
      hoverBackgroundColor: [colors.gray['200']],
    },
  ],
};
const EMPTY_CHART_OPTIONS = { events: [] };

function ViewWallet() {
  const {
    claimIScore,
    network: { trackerUrl },
  } = useIconService();
  const {
    balance,
    stake: { stake, unstake },
    iScore: { iScore, estimatedICX },
    wallet,
    isLoading,
    refreshWallet,
  } = useWallet();
  const [chartData, setChartData] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    if (!(balance && stake)) return void setChartData(null);
    if (balance.isZero() && stake.isZero()) return void setIsEmpty(true);

    const chartLabels = ['Available', 'Staked'];
    const chartDataset = {
      data: [balance.toNumber(), stake.toNumber()],
      backgroundColor: [colors.teal['500'], colors.blue['500']],
      hoverBackgroundColor: [colors.teal['600'], colors.blue['600']],
    };
    if (unstake) {
      chartLabels.push('Unstaking');
      chartDataset.data.push(unstake.toNumber());
      chartDataset.backgroundColor.push(colors.purple['500']);
      chartDataset.hoverBackgroundColor.push(colors.purple['600']);
    }

    setChartData({ labels: chartLabels, datasets: [chartDataset] });
    setIsEmpty(false);
  }, [balance, stake, unstake]);

  async function handleClaimIScore() {
    setIsClaiming(true);
    if (
      await swal({
        content: (
          <p>
            Continue converting {formatNumber(iScore)} I-Score to an estimated{' '}
            {formatNumber(estimatedICX)} ICX?
          </p>
        ),
        buttons: ['Cancel', 'Continue'],
      })
    ) {
      const transactionHash = await claimIScore(wallet);
      await swal(
        <div>
          <p className="mb-4">Successfully converted I-Score to ICX</p>
          <p className="break-all">
            Transaction:
            <br />
            {transactionHash}
            <a
              href={`${trackerUrl}/transaction/${transactionHash}`}
              title="View on ICON tracker"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faExternalLink} className="ml-1" />
            </a>
          </p>
        </div>
      );
      refreshWallet();
    }
    setIsClaiming(false);
  }

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
              href={`${trackerUrl}/address/${wallet.getAddress()}`}
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
                {!iScore && isLoading ? (
                  <FontAwesomeIcon icon={faSpinnerThird} spin className="ml-1" />
                ) : (
                  iScore && (
                    <>
                      {formatNumber(iScore)}
                      <span className="text-lg ml-2">~{formatNumber(estimatedICX)} ICX</span>
                    </>
                  )
                )}
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-tight">
                I-Score
                {iScore && !iScore.isZero() && (
                  <button
                    onClick={handleClaimIScore}
                    disabled={isClaiming}
                    className="bg-gray-100 border border-gray-300 uppercase tracking-tight text-gray-700 px-2 py-px rounded hover:bg-gray-200 focus:bg-gray-200 hover:shadow focus:shadow ml-4"
                  >
                    <FontAwesomeIcon icon={faExchange} className="mr-2" />
                    Convert to ICX
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex-none mx-auto mt-6 sm:m-0">
            {(isEmpty || chartData) && (
              <Pie
                data={isEmpty ? EMPTY_CHART_DATA : chartData}
                legend={{ position: 'bottom' }}
                options={isEmpty ? EMPTY_CHART_OPTIONS : {}}
                height={200}
              />
            )}
          </div>
        </div>

        <div className="sm:flex justify-between mt-6">
          <Button to="/send" className="text-center block sm:w-1/3 ">
            <FontAwesomeIcon icon={faShareSquare} className="mr-2" />
            Send ICX
          </Button>
          <Button to="/stake" className="text-center block sm:w-1/3 sm:ml-2 text-center">
            <FontAwesomeIcon icon={faSignIn} className="mr-2" />
            Stake ICX
          </Button>
          <Button to="/vote" className="text-center block sm:w-1/3 sm:ml-2 text-center">
            <FontAwesomeIcon icon={faVoteYea} className="mr-2" />
            Voting
          </Button>
        </div>
      </>
    )
  );
}

export default ViewWallet;
