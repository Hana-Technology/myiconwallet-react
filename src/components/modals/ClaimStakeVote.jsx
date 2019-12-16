import React, { useReducer, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleNotch,
  faExchangeAlt,
  faExclamationTriangle,
  faExternalLinkAlt,
  faFlag,
  faVoteYea,
} from '@fortawesome/free-solid-svg-icons';
import BigNumber from 'bignumber.js';
import PropTypes from 'prop-types';
import { WALLET_TYPE } from 'utils/constants';
import { convertLoopToIcx } from 'utils/convertIcx';
import { formatNumber } from 'utils/formatNumber';
import { wait } from 'utils/wait';
import BaseModal from 'components/modals/Base';
import Button from 'components/Button';
import { useIconService } from 'components/IconService';
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
  SET_WORKING: 'SET WORKING',
  SET_FINISHED: 'SET FINISHED',
  SET_ERROR: 'SET ERROR',
};

function reducer(state, action) {
  switch (action.type) {
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

  async function handleClaim() {
    setHasStarted(true);
    claimDispatch({ type: ACTIONS.SET_WORKING });

    let claimedICX;
    try {
      // TODO: show message for Ledger and ICONex to approve transaction
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
      // TODO: show message for Ledger and ICONex to approve transaction
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
      // TODO: show message for Ledger and ICONex to approve transaction
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

  function getColours(step) {
    switch (true) {
      case step.error !== null:
        return 'bg-red-100 text-red-900';
      case step.isFinished:
        return 'bg-green-100 text-green-900';
      default:
        return 'bg-blue-100 text-blue-900';
    }
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
      aria-label="Claim-Stake-Vote"
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
                Retry {claim.error ? 'claim' : stake.error ? 'stake' : 'vote'}
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
        Use this feature to claim your current I-Score as ICX, immediately stake the claimed ICX and
        then allocate the votes evenly to your current P-Rep delegations.
      </p>
      {iScore && staked && delegations && (
        <div className="flex mt-6">
          <div className={`w-1/3 p-3 rounded-sm ${getColours(claim)}`}>
            <h4 className="text-lg text-center uppercase tracking-tight">
              Claim{claim.isWorking ? 'ing' : claim.isFinished ? 'ed' : ''}
            </h4>
            <div className="text-center my-6">
              <FontAwesomeIcon
                icon={getIcon(claim, faExchangeAlt)}
                className="text-3xl opacity-75"
                spin={claim.isWorking}
              />
            </div>
            <p className="mt-4">
              Claim <b>{formatNumber(iScore)}&nbsp;I-Score</b> as an estimated{' '}
              <b>{formatNumber(estimatedICX)}&nbsp;ICX</b>
            </p>
            <ErrorMessage error={claim.error} />
            <ConfirmTransaction isWorking={claim.isWorking} walletType={wallet.type} />
            <TransactionResult
              isFinished={claim.isFinished}
              transactionHash={claim.transactionHash}
              trackerUrl={trackerUrl}
            />
          </div>

          <div className={`w-1/3 p-3 ml-2 rounded-sm ${getColours(stake)}`}>
            <h4 className="text-lg text-center uppercase tracking-tight">
              Stak{stake.isWorking ? 'ing' : stake.isFinished ? 'ed' : 'e'}
            </h4>
            <div className="text-center my-6">
              <FontAwesomeIcon
                icon={getIcon(stake, faFlag)}
                className="text-3xl opacity-75"
                spin={stake.isWorking}
              />
            </div>
            <p className="mt-4">
              Increase stake to{' '}
              <b>{formatNumber(staked.plus(claim.data.claimedICX || estimatedICX))}&nbsp;ICX</b>
            </p>
            <ErrorMessage error={stake.error} />
            <ConfirmTransaction isWorking={stake.isWorking} walletType={wallet.type} />
            <TransactionResult
              isFinished={stake.isFinished}
              transactionHash={stake.transactionHash}
              trackerUrl={trackerUrl}
            />
          </div>

          <div className={`w-1/3 p-3 ml-2 rounded-sm ${getColours(vote)}`}>
            <h4 className="text-lg text-center uppercase tracking-tight">
              Vot{vote.isWorking ? 'ing' : vote.isFinished ? 'ed' : 'e'}
            </h4>
            <div className="text-center my-6">
              <FontAwesomeIcon
                icon={getIcon(vote, faVoteYea)}
                className="text-3xl opacity-75"
                spin={vote.isWorking}
              />
            </div>
            <p className="mt-4">
              Add{' '}
              <b>
                {formatNumber(
                  (claim.data.claimedICX || estimatedICX).dividedBy(delegations.length)
                )}
                &nbsp;votes
              </b>{' '}
              to each of your <b>{delegations.length} delegation(s)</b>
            </p>
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
    <div className="mt-4">
      <div className="text-xs text-red-700 uppercase tracking-tight">Error</div>
      <div className="text-sm">{error}</div>
    </div>
  ) : null;
}

function TransactionResult({ isFinished, trackerUrl, transactionHash }) {
  return isFinished ? (
    <div className="mt-4">
      <div className="text-xs text-green-700 uppercase tracking-tight">Transaction hash</div>
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
      <div className="text-xs text-blue-700 uppercase tracking-tight">Confirm transaction</div>
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
