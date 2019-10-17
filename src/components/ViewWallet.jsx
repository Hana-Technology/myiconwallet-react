import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExchange,
  faExternalLink,
  faFlag,
  faSpinnerThird,
  faShareSquare,
  faVoteYea,
} from '@fortawesome/pro-duotone-svg-icons';
import swal from '@sweetalert/with-react';
import { Pie } from 'react-chartjs-2';
import colors from 'utils/colors';
import { formatNumber } from 'utils/formatNumber';
import Alert, { ALERT_TYPE_INFO, ALERT_TYPE_SUCCESS } from 'components/Alert';
import Button from 'components/Button';
import { useIconService } from 'components/IconService';
import { useWallet } from 'components/Wallet';
import WalletHeader from 'components/WalletHeader';

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
    fullBalance,
    stake: { staked, unstaking },
    iScore: { iScore, estimatedICX },
    wallet,
    isLoading,
    refreshWallet,
  } = useWallet();
  const [chartData, setChartData] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    if (!(balance && staked)) return void setChartData(null);
    if (balance.isZero() && staked.isZero()) return void setIsEmpty(true);

    const chartLabels = ['Available', 'Staked'];
    const chartDataset = {
      data: [balance.toNumber(), staked.toNumber()],
      backgroundColor: [colors.teal['500'], colors.blue['500']],
      hoverBackgroundColor: [colors.teal['600'], colors.blue['600']],
    };
    if (unstaking) {
      chartLabels.push('Unstaking');
      chartDataset.data.push(unstaking.toNumber());
      chartDataset.backgroundColor.push(colors.purple['500']);
      chartDataset.hoverBackgroundColor.push(colors.purple['600']);
    }

    setChartData({ labels: chartLabels, datasets: [chartDataset] });
    setIsEmpty(false);
  }, [balance, staked, unstaking]);

  async function handleClaimIScore() {
    setIsClaiming(true);
    const confirmation = await swal({
      content: (
        <Alert
          type={ALERT_TYPE_INFO}
          title="Convert I-Score"
          text={`Continue converting ${formatNumber(iScore)} I-Score to an estimated ${formatNumber(
            estimatedICX
          )} ICX?`}
        />
      ),
      buttons: ['Cancel', 'Continue'],
    });
    if (!confirmation) return setIsClaiming(false);

    const transactionHash = await claimIScore(wallet);
    await swal(
      <div>
        <Alert
          type={ALERT_TYPE_SUCCESS}
          title="Converted I-Score"
          text={`Successfully converted ${formatNumber(iScore)} I-Score to ICX`}
        />
        <p className="break-all mt-4">
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

  return (
    wallet && (
      <>
        <WalletHeader />
        <h2 className="text-2xl uppercase tracking-tight mt-4 lg:mt-6">Your wallet</h2>

        <div className="mt-2">
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

        <div className="sm:flex items-start justify-between mt-6">
          <div>
            <div>
              <div className="text-4xl leading-tight">
                {!fullBalance && isLoading ? (
                  <FontAwesomeIcon icon={faSpinnerThird} spin className="ml-1" />
                ) : (
                  fullBalance && (
                    <>
                      {formatNumber(fullBalance, 6)}
                      <span className="text-lg ml-2">ICX</span>
                    </>
                  )
                )}
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-tight">Full balance</div>
            </div>
            <div className="mt-2">
              <div className="text-2xl leading-tight">
                {!balance && isLoading ? (
                  <FontAwesomeIcon icon={faSpinnerThird} spin className="ml-1" />
                ) : (
                  balance && (
                    <>
                      {formatNumber(balance, 2)}
                      <span className="text-base ml-2">ICX</span>
                    </>
                  )
                )}
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-tight">Available</div>
            </div>
            <div className="mt-6">
              <div className="text-2xl leading-tight">
                {!iScore && isLoading ? (
                  <FontAwesomeIcon icon={faSpinnerThird} spin className="ml-1" />
                ) : (
                  iScore && (
                    <>
                      {formatNumber(iScore)}
                      <span className="text-base ml-4">~{formatNumber(estimatedICX)} ICX</span>
                    </>
                  )
                )}
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-tight">
                I-Score
                {iScore && iScore.isGreaterThan('0.00001') && (
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

        <div className="sm:flex justify-between mt-8">
          <Button to="/send" className="text-center block sm:w-1/3 ">
            <FontAwesomeIcon icon={faShareSquare} className="mr-2" />
            Send ICX
          </Button>
          <Button to="/stake" className="text-center block sm:w-1/3 sm:ml-2 text-center">
            <FontAwesomeIcon icon={faFlag} className="mr-2" />
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
