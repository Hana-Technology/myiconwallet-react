import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleNotch,
  faExchangeAlt,
  faExternalLinkAlt,
  faFlag,
  faRetweet,
  faShareSquare,
  faVoteYea,
} from '@fortawesome/free-solid-svg-icons';
import { useIconService } from '@myiconwallet/components/IconService';
import colors from '@myiconwallet/utils/colors';
import { WALLET_TYPE } from '@myiconwallet/utils/constants';
import { formatNumber } from '@myiconwallet/utils/formatNumber';
import swal from '@sweetalert/with-react';
import { Pie } from 'react-chartjs-2';
import ReactTooltip from 'react-tooltip';
import { COPY_TOOLTIPS, copyToClipboard } from 'utils/copyToClipboard';
import Alert, { ALERT_TYPE_DANGER, ALERT_TYPE_INFO, ALERT_TYPE_SUCCESS } from 'components/Alert';
import Button from 'components/Button';
import { useWallet } from 'components/Wallet';
import WalletHeader from 'components/WalletHeader';
import ClaimStakeVoteModal from 'components/modals/ClaimStakeVote';

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
    waitForTransaction,
  } = useIconService();
  const {
    balance,
    delegations,
    fullBalance,
    stake: { staked, unstaking },
    iScore: { iScore, estimatedICX },
    wallet,
    isLoading,
    refreshWallet,
  } = useWallet();
  const [copyTooltip, setCopyTooltip] = useState(COPY_TOOLTIPS.INITIAL);
  const [chartData, setChartData] = useState(null);
  const [isChartEmpty, setIsChartEmpty] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const copyTooltipRef = useRef(null);

  useEffect(() => {
    if (!(balance && staked)) return void setChartData(null);
    if (balance.isZero() && staked.isZero()) return void setIsChartEmpty(true);

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
    setIsChartEmpty(false);
  }, [balance, staked, unstaking]);

  async function handleClaimIScore() {
    setIsClaiming(true);
    const confirmation = await swal({
      content: (
        <Alert
          type={ALERT_TYPE_INFO}
          title="Convert I-Score"
          text={
            <>
              Continue converting <b>{formatNumber(iScore)} I-Score</b> to an estimated{' '}
              <b>{formatNumber(estimatedICX)} ICX</b>?
            </>
          }
        />
      ),
      buttons: ['Cancel', 'Continue'],
    });
    if (!confirmation) return setIsClaiming(false);

    try {
      if (wallet.type !== WALLET_TYPE.KEYSTORE) {
        swal({
          content: (
            <Alert
              type={ALERT_TYPE_INFO}
              title={`Confirm transaction ${
                wallet.type === WALLET_TYPE.LEDGER ? 'on Ledger' : 'in ICONex'
              }`}
              text={
                <>
                  Make sure your Ledger device is connected and unlocked with the <b>ICON</b> app
                  running. You will need to confirm the transaction on your Ledger.
                </>
              }
            />
          ),
          buttons: false,
          closeOnClickOutside: false,
          closeOnEsc: false,
        });
      }
      const transactionHash = await claimIScore(wallet);
      if (wallet.type !== WALLET_TYPE.KEYSTORE) swal.close();

      waitForTransaction(transactionHash)
        .catch(error => console.warn(error))
        .then(() => refreshWallet());

      swal(
        <div>
          <Alert
            type={ALERT_TYPE_SUCCESS}
            title="Converted I-Score"
            text={
              <>
                Successfully converted <b>{formatNumber(iScore)} I-Score</b> to ICX
              </>
            }
          />
          <div className="mt-4">
            <div className="break-all">
              {transactionHash}
              <a
                href={`${trackerUrl}/transaction/${transactionHash}`}
                title="View on ICON tracker"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-1 opacity-75" />
              </a>
            </div>
            <div className="text-sm text-gray-600 uppercase tracking-tight">Transaction hash</div>
          </div>
        </div>
      );
    } catch (error) {
      swal(
        <Alert type={ALERT_TYPE_DANGER} title="Failed converting I-Score" text={error.message} />
      );
    }
    setIsClaiming(false);
  }

  function copyAddressToClipboard() {
    const address = wallet.getAddress();
    copyToClipboard(address);

    // Update and re-show the tooltip
    ReactTooltip.hide(copyTooltipRef.current);
    setCopyTooltip(COPY_TOOLTIPS.COPIED);
    setTimeout(() => ReactTooltip.show(copyTooltipRef.current));
    setTimeout(() => setCopyTooltip(COPY_TOOLTIPS.INITIAL), 2000);
  }

  return (
    wallet && (
      <>
        <WalletHeader />
        <h2 className="text-2xl uppercase tracking-tight mt-4 lg:mt-6">Your wallet</h2>

        <div className="mt-2">
          <div className="break-all text-lg">
            <button
              onClick={copyAddressToClipboard}
              data-tip={copyTooltip}
              ref={copyTooltipRef}
              className="hover:text-black"
            >
              {wallet.getAddress()}
              <ReactTooltip place="right" effect="solid" />
            </button>
            <a
              href={`${trackerUrl}/address/${wallet.getAddress()}`}
              title="View on ICON tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2"
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-1 opacity-75" />
            </a>
          </div>
          <div className="text-sm text-gray-600 uppercase tracking-tight">Address</div>
        </div>

        <div className="sm:flex items-start justify-between mt-6">
          <div>
            <div>
              <div className="text-4xl leading-tight">
                {!fullBalance && isLoading ? (
                  <FontAwesomeIcon icon={faCircleNotch} spin className="ml-1" />
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
                  <FontAwesomeIcon icon={faCircleNotch} spin className="ml-1" />
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
                  <FontAwesomeIcon icon={faCircleNotch} spin className="ml-1" />
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
                  <>
                    <button
                      onClick={handleClaimIScore}
                      disabled={isClaiming}
                      className="bg-gray-100 border border-gray-300 uppercase tracking-tight text-gray-700 px-2 py-px rounded hover:bg-gray-200 focus:bg-gray-200 hover:shadow focus:shadow ml-4"
                    >
                      <FontAwesomeIcon icon={faExchangeAlt} className="mr-2 opacity-75" />
                      Convert to ICX
                    </button>
                    {delegations && delegations.length > 0 && (
                      <button
                        onClick={() => setIsCSVModalOpen(true)}
                        className="bg-gray-100 border border-gray-300 uppercase tracking-tight text-gray-700 px-2 py-px rounded hover:bg-gray-200 focus:bg-gray-200 hover:shadow focus:shadow ml-4"
                      >
                        <FontAwesomeIcon icon={faRetweet} className="mr-2 opacity-75" />
                        Convert-Stake-Vote
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex-none mx-auto mt-6 sm:m-0">
            {(isChartEmpty || chartData) && (
              <Pie
                data={isChartEmpty ? EMPTY_CHART_DATA : chartData}
                legend={{ position: 'bottom' }}
                options={isChartEmpty ? EMPTY_CHART_OPTIONS : {}}
                height={200}
              />
            )}
          </div>
        </div>

        <div className="sm:flex justify-between mt-8">
          <Button to="/send" className="block text-center sm:w-1/3 ">
            <FontAwesomeIcon icon={faShareSquare} className="mr-2 opacity-75" />
            Send ICX
          </Button>
          <Button to="/stake" className="block text-center sm:w-1/3 mt-3 sm:mt-0 sm:ml-2">
            <FontAwesomeIcon icon={faFlag} className="mr-2 opacity-75" />
            Stake ICX
          </Button>
          <Button to="/vote" className="block text-center sm:w-1/3 mt-3 sm:mt-0 sm:ml-2">
            <FontAwesomeIcon icon={faVoteYea} className="mr-2 opacity-75" />
            Voting
          </Button>
        </div>

        <ClaimStakeVoteModal isOpen={isCSVModalOpen} onClose={() => setIsCSVModalOpen(false)} />
      </>
    )
  );
}

export default ViewWallet;
