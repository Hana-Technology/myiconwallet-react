import React, { useEffect, useReducer, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleNotch,
  faExchangeAlt,
  faExclamationTriangle,
  faExternalLinkAlt,
  faFlag,
  faVoteYea,
} from '@fortawesome/free-solid-svg-icons';
import { useIconService } from '@myiconwallet/components/IconService';
import { WALLET_TYPE } from '@myiconwallet/utils/constants';
import { convertLoopToIcx } from '@myiconwallet/utils/convertIcx';
import { formatNumber } from '@myiconwallet/utils/formatNumber';
import { wait } from '@myiconwallet/utils/wait';
import BigNumber from 'bignumber.js';
import PropTypes from 'prop-types';
import BaseModal from 'components/modals/Base';
import Alert, { ALERT_TYPE_DANGER, ALERT_TYPE_INFO, ALERT_TYPE_SUCCESS } from 'components/Alert';
import Button from 'components/Button';
import { useWallet } from 'components/Wallet';

const ISCORE_CLAIMED_EVENT = 'IScoreClaimed(int,int)';

const INITIAL_STATE = {
  isWorking: false,
  isFinished: false,
  transactionHash: null,
  data: {},
  error: null,
};

const ACTIONS = {
  SET_INITIAL: 'SET INITIAL',
  SET_WORKING: 'SET WORKING',
  SET_FINISHED: 'SET FINISHED',
  SET_ERROR: 'SET ERROR',
};

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_INITIAL:
      return INITIAL_STATE;
    case ACTIONS.SET_WORKING:
      return { ...state, isWorking: true, error: null };
    case ACTIONS.SET_FINISHED:
      const { data = {}, transactionHash } = action.payload;
      return { ...state, isWorking: false, isFinished: true, transactionHash, data };
    case ACTIONS.SET_ERROR:
      return { ...state, isWorking: false, error: action.payload };
    default:
      throw new Error(`Unknown action "${action.type}"`);
  }
}

function ClaimStakeVoteModal({ isOpen, onClose }) {
  const {
    claimIScore,
    network: { trackerUrl },
    setDelegations,
    setStake,
    waitForTransaction,
  } = useIconService();
  const {
    delegations,
    iScore: { iScore, estimatedICX },
    refreshWallet,
    stake: { staked },
    wallet,
  } = useWallet();
  const [hasStarted, setHasStarted] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [claim, claimDispatch] = useReducer(reducer, INITIAL_STATE);
  const [stake, stakeDispatch] = useReducer(reducer, INITIAL_STATE);
  const [vote, voteDispatch] = useReducer(reducer, INITIAL_STATE);

  useEffect(() => {
    if (isOpen) {
      setHasStarted(false);
      setHasFinished(false);
      claimDispatch({ type: ACTIONS.SET_INITIAL });
      stakeDispatch({ type: ACTIONS.SET_INITIAL });
      voteDispatch({ type: ACTIONS.SET_INITIAL });
    }
  }, [isOpen]);

  async function handleClaim() {
    setHasStarted(true);
    claimDispatch({ type: ACTIONS.SET_WORKING });

    let claimedICX;
    try {
      const transactionHash = await claimIScore(wallet);
      const transaction = await waitForTransaction(transactionHash, 100);
      const claimedICXAsLoop = transaction.eventLogs.find(({ indexed }) =>
        indexed.includes(ISCORE_CLAIMED_EVENT)
      ).data[1];
      claimedICX = convertLoopToIcx(claimedICXAsLoop);
      claimDispatch({
        type: ACTIONS.SET_FINISHED,
        payload: { transactionHash, data: { claimedICX } },
      });
    } catch (error) {
      claimDispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return;
    }

    handleStake(claimedICX);
  }

  async function handleStake(claimedICX) {
    stakeDispatch({ type: ACTIONS.SET_WORKING });

    const stakeAmount = staked.plus(claimedICX);

    try {
      const transactionHash = await setStake(wallet, stakeAmount);
      await waitForTransaction(transactionHash, 100);
      stakeDispatch({ type: ACTIONS.SET_FINISHED, payload: { transactionHash } });
    } catch (error) {
      stakeDispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return;
    }

    handleVote(claimedICX);
  }

  async function handleVote(claimedICX) {
    voteDispatch({ type: ACTIONS.SET_WORKING });

    const votesPerDelegate = claimedICX
      .dividedBy(delegations.length)
      .toFixed(4, BigNumber.ROUND_DOWN);
    const delegationsToSet = delegations.map(({ address, value }) => ({
      value: value.plus(votesPerDelegate),
      address,
    }));

    try {
      const transactionHash = await setDelegations(wallet, delegationsToSet);
      await waitForTransaction(transactionHash, 100);
      voteDispatch({ type: ACTIONS.SET_FINISHED, payload: { transactionHash } });
    } catch (error) {
      voteDispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return;
    }

    setHasFinished(true);
  }

  async function handleClose() {
    onClose();
    await wait(500);
    refreshWallet();
  }

  function getIcon(step, defaultIcon) {
    switch (true) {
      case step.error !== null:
        return faExclamationTriangle;
      case step.isWorking:
        return faCircleNotch;
      default:
        return defaultIcon;
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      wide={true}
      aria-label="Convert-Stake-Vote"
      buttons={
        <>
          {!hasFinished &&
            (claim.error || stake.error || vote.error ? (
              <Button
                type="button"
                onClick={() =>
                  claim.error
                    ? handleClaim()
                    : stake.error
                    ? handleStake(claim.data.claimedICX)
                    : handleVote(claim.data.claimedICX)
                }
                className="ml-4"
              >
                Retry {claim.error ? 'convert' : stake.error ? 'stake' : 'vote'}
              </Button>
            ) : (
              <Button type="button" onClick={handleClaim} disabled={hasStarted} className="ml-4">
                Continue
              </Button>
            ))}
          <Button type="button" onClick={handleClose} muted={!hasFinished}>
            {hasFinished ? 'Ok' : 'Cancel'}
          </Button>
        </>
      }
    >
      <p>
        Use this feature to convert your current I-Score to ICX, immediately stake the claimed ICX
        and then allocate the votes evenly to your current P-Rep delegations.
      </p>
      {iScore && staked && delegations && (
        <div className="sm:flex mt-6">
          <div className="sm:w-1/3 p-3 bg-gray-100 rounded-sm shadow-md">
            <h3 className="text-xl text-center uppercase tracking-tight">
              <FontAwesomeIcon
                icon={getIcon(claim, faExchangeAlt)}
                className="opacity-75 mr-3"
                spin={claim.isWorking}
              />
              Convert{claim.isWorking ? 'ing' : claim.isFinished ? 'ed' : ''}
            </h3>
            <Alert
              type={claim.isFinished ? ALERT_TYPE_SUCCESS : ALERT_TYPE_INFO}
              className="mt-4"
              text={
                <>
                  Converting <b>{formatNumber(iScore)}&nbsp;I-Score</b> to an estimated{' '}
                  <b>{formatNumber(estimatedICX)}&nbsp;ICX</b>
                </>
              }
            />
            <ErrorMessage error={claim.error} />
            <ConfirmTransaction isWorking={claim.isWorking} walletType={wallet.type} />
            <TransactionResult
              isFinished={claim.isFinished}
              transactionHash={claim.transactionHash}
              trackerUrl={trackerUrl}
            />
          </div>

          <div className="sm:w-1/3 p-3 mt-3 sm:mt-0 sm:ml-3 bg-gray-100 rounded-sm shadow-md">
            <h4 className="text-xl text-center uppercase tracking-tight">
              <FontAwesomeIcon
                icon={getIcon(stake, faFlag)}
                className="opacity-75 mr-3"
                spin={stake.isWorking}
              />
              Stak{stake.isWorking ? 'ing' : stake.isFinished ? 'ed' : 'e'}
            </h4>
            <Alert
              type={stake.isFinished ? ALERT_TYPE_SUCCESS : ALERT_TYPE_INFO}
              className="mt-4"
              text={
                <>
                  Increasing your stake by{' '}
                  <b>{formatNumber(claim.data.claimedICX || estimatedICX)}&nbsp;ICX</b> to{' '}
                  <b>{formatNumber(staked.plus(claim.data.claimedICX || estimatedICX))}&nbsp;ICX</b>
                </>
              }
            />
            <ErrorMessage error={stake.error} />
            <ConfirmTransaction isWorking={stake.isWorking} walletType={wallet.type} />
            <TransactionResult
              isFinished={stake.isFinished}
              transactionHash={stake.transactionHash}
              trackerUrl={trackerUrl}
            />
          </div>

          <div className="sm:w-1/3 p-3 mt-3 sm:mt-0 sm:ml-3 bg-gray-100 rounded-sm shadow-md">
            <h4 className="text-xl text-center uppercase tracking-tight">
              <FontAwesomeIcon
                icon={getIcon(vote, faVoteYea)}
                className="opacity-75 mr-3"
                spin={vote.isWorking}
              />
              Vot{vote.isWorking ? 'ing' : vote.isFinished ? 'ed' : 'e'}
            </h4>
            <Alert
              type={vote.isFinished ? ALERT_TYPE_SUCCESS : ALERT_TYPE_INFO}
              className="mt-4"
              text={
                <>
                  Increasing your votes to each of your <b>{delegations.length} delegate(s)</b> by{' '}
                  <b>
                    {formatNumber(
                      (claim.data.claimedICX || estimatedICX).dividedBy(delegations.length)
                    )}
                    &nbsp;ICX
                  </b>
                </>
              }
            />
            <ErrorMessage error={vote.error} />
            <ConfirmTransaction isWorking={vote.isWorking} walletType={wallet.type} />
            <TransactionResult
              isFinished={vote.isFinished}
              transactionHash={vote.transactionHash}
              trackerUrl={trackerUrl}
            />
          </div>
        </div>
      )}
    </BaseModal>
  );
}

ClaimStakeVoteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ClaimStakeVoteModal;

function ErrorMessage({ error }) {
  return error ? (
    <Alert type={ALERT_TYPE_DANGER} className="mt-4" title="Error" text={error} />
  ) : null;
}

function TransactionResult({ isFinished, trackerUrl, transactionHash }) {
  return isFinished ? (
    <div className="mt-4">
      <div className="text-xs text-gray-600 uppercase tracking-tight">Transaction hash</div>
      <div className="text-sm break-all">
        {transactionHash}
        <a
          href={`${trackerUrl}/transaction/${transactionHash}`}
          title="View on ICON tracker"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2 opacity-75" />
        </a>
      </div>
    </div>
  ) : null;
}

function ConfirmTransaction({ isWorking, walletType }) {
  return isWorking && walletType !== WALLET_TYPE.KEYSTORE ? (
    <div className="mt-4">
      <div className="text-xs text-gray-600 uppercase tracking-tight">Confirm transaction</div>
      <div className="text-sm">
        {walletType === WALLET_TYPE.LEDGER ? (
          <>
            Make sure your Ledger device is connected and unlocked with the <b>ICON</b> app running.
            You will need to confirm the transaction on your Ledger.
          </>
        ) : (
          <>
            Enter your wallet password and click the <i>Confirm</i> button in the <b>ICONex</b>{' '}
            popup to confirm the transaction.
          </>
        )}
      </div>
    </div>
  ) : null;
}
