import React, { useReducer, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleNotch,
  faExchangeAlt,
  faExternalLinkAlt,
  faFlag,
  faVoteYea,
} from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
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
      return { ...state, isWorking: true };
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

  async function startClaimStakeVote() {
    setHasStarted(true);

    const claimedICX = await handleClaim();
    await handleStake(claimedICX);
    await handleVote(claimedICX);

    setHasFinished(true);
  }

  async function handleClaim() {
    claimDispatch({ type: ACTIONS.SET_WORKING });

    let isFinished = false;
    while (!isFinished) {
      try {
        // TODO: show message for Ledger and ICONex to approve transaction
        const transactionHash = await claimIScore(wallet);
        const transaction = await waitForTransaction(transactionHash, 100);
        const claimedICXAsLoop = transaction.eventLogs.find(({ indexed }) =>
          indexed.includes(ISCORE_CLAIMED_EVENT)
        ).data[1];
        const claimedICX = convertLoopToIcx(claimedICXAsLoop);
        claimDispatch({
          type: ACTIONS.SET_FINISHED,
          payload: { transactionHash, data: { claimedICX } },
        });
        return claimedICX;
      } catch (error) {
        // TODO: show error, give user option to retry?
        claimDispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        isFinished = true;
      }
      await wait();
    }
  }

  async function handleStake(claimedICX) {
    stakeDispatch({ type: ACTIONS.SET_WORKING });

    const stakeAmount = staked.plus(claimedICX);

    let isFinished = false;
    while (!isFinished) {
      try {
        // TODO: show message for Ledger and ICONex to approve transaction
        const transactionHash = await setStake(wallet, stakeAmount);
        await waitForTransaction(transactionHash, 100);
        stakeDispatch({ type: ACTIONS.SET_FINISHED, payload: { transactionHash } });
        return;
      } catch (error) {
        // TODO: show error, give user option to retry?
        stakeDispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        isFinished = true;
      }
      await wait();
    }
  }

  async function handleVote(claimedICX) {
    voteDispatch({ type: ACTIONS.SET_WORKING });

    const votesPerDelegate = claimedICX.dividedBy(delegations.length);
    const delegationsToSet = delegations.map(({ address, value }) => ({
      value: value.plus(votesPerDelegate),
      address,
    }));

    let isFinished = false;
    while (!isFinished) {
      try {
        // TODO: show message for Ledger and ICONex to approve transaction
        const transactionHash = await setDelegations(wallet, delegationsToSet);
        await waitForTransaction(transactionHash, 100);
        voteDispatch({ type: ACTIONS.SET_FINISHED, payload: { transactionHash } });
        return;
      } catch (error) {
        // TODO: show error, give user option to retry?
        voteDispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        isFinished = true;
      }
      await wait();
    }
  }

  function handleClose() {
    refreshWallet();
    onClose();
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} aria-label="Claim-Stake-Vote">
      <h3 className="text-xl uppercase tracking-tight">Claim-Stake-Vote</h3>
      <p className="mt-4">
        Use this feature to claim your current I-Score as ICX, immediately stake the claimed ICX and
        then allocate the votes evenly to your current P-Rep delegations.
      </p>
      <p className="mt-4">
        TODO: can't proceed if no delegations!! Maybe not an issue? Shouldn't have I-Score without
        delegations?
      </p>
      {iScore && staked && delegations && (
        <div className="flex mt-6">
          <div
            className={`w-1/3 p-3 rounded-sm ${
              claim.isFinished ? 'bg-green-100 text-green-900' : 'bg-blue-100 text-blue-900'
            }`}
          >
            <h4 className="text-lg text-center uppercase tracking-tight">
              Claim{claim.isWorking ? 'ing' : claim.isFinished ? 'ed' : ''}
            </h4>
            <div className="text-center my-6">
              <FontAwesomeIcon
                icon={claim.isWorking ? faCircleNotch : faExchangeAlt}
                className="text-3xl opacity-75"
                spin={claim.isWorking}
              />
            </div>
            <p className="mt-4">
              Claim <b>{formatNumber(iScore)}&nbsp;I-Score</b> as an estimated{' '}
              <b>{formatNumber(estimatedICX)}&nbsp;ICX</b>
            </p>
            {claim.isFinished && (
              <div className="mt-4">
                <div className="text-xs text-green-700 uppercase tracking-tight">
                  Transaction hash
                </div>
                <div className="text-sm break-all">
                  {claim.transactionHash}
                  <a
                    href={`${trackerUrl}/transaction/${claim.transactionHash}`}
                    title="View on ICON tracker"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2 opacity-75" />
                  </a>
                </div>
              </div>
            )}
          </div>
          <div
            className={`w-1/3 p-3 ml-2 rounded-sm ${
              stake.isFinished ? 'bg-green-100 text-green-900' : 'bg-blue-100 text-blue-900'
            }`}
          >
            <h4 className="text-lg text-center uppercase tracking-tight">
              Stak{stake.isWorking ? 'ing' : stake.isFinished ? 'ed' : 'e'}
            </h4>
            <div className="text-center my-6">
              <FontAwesomeIcon
                icon={stake.isWorking ? faCircleNotch : faFlag}
                className="text-3xl opacity-75"
                spin={stake.isWorking}
              />
            </div>
            <p className="mt-4">
              Increase stake to{' '}
              <b>{formatNumber(staked.plus(claim.data.claimedICX || estimatedICX))}&nbsp;ICX</b>
            </p>
            {stake.isFinished && (
              <div className="mt-4">
                <div className="text-xs text-green-700 uppercase tracking-tight">
                  Transaction hash
                </div>
                <div className="text-sm break-all">
                  {stake.transactionHash}
                  <a
                    href={`${trackerUrl}/transaction/${stake.transactionHash}`}
                    title="View on ICON tracker"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2 opacity-75" />
                  </a>
                </div>
              </div>
            )}
          </div>
          <div
            className={`w-1/3 p-3 ml-2 rounded-sm ${
              vote.isFinished ? 'bg-green-100 text-green-900' : 'bg-blue-100 text-blue-900'
            }`}
          >
            <h4 className="text-lg text-center uppercase tracking-tight">
              Vot{vote.isWorking ? 'ing' : vote.isFinished ? 'ed' : 'e'}
            </h4>
            <div className="text-center my-6">
              <FontAwesomeIcon
                icon={vote.isWorking ? faCircleNotch : faVoteYea}
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
            {vote.isFinished && (
              <div className="mt-4">
                <div className="text-xs text-green-700 uppercase tracking-tight">
                  Transaction hash
                </div>
                <div className="text-sm break-all">
                  {vote.transactionHash}
                  <a
                    href={`${trackerUrl}/transaction/${vote.transactionHash}`}
                    title="View on ICON tracker"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2 opacity-75" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex flex-row-reverse">
        {hasFinished ? (
          <Button type="button" onClick={handleClose} className="mt-6">
            Close
          </Button>
        ) : (
          <Button
            type="button"
            onClick={startClaimStakeVote}
            disabled={hasStarted}
            className="mt-6"
          >
            Continue
          </Button>
        )}
      </div>
    </BaseModal>
  );
}

ClaimStakeVoteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ClaimStakeVoteModal;
