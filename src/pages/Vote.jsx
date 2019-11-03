import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleNotch,
  faExternalLinkAlt,
  faTimes,
  faVoteYea,
} from '@fortawesome/free-solid-svg-icons';
import { Link, navigate } from '@reach/router';
import swal from '@sweetalert/with-react';
import { IconConverter } from 'icon-sdk-js';
import Select from 'react-select';
import { shuffle } from 'lodash-es';
import { formatNumber } from 'utils/formatNumber';
import { wait } from 'utils/wait';
import Alert, { ALERT_TYPE_INFO, ALERT_TYPE_DANGER, ALERT_TYPE_SUCCESS } from 'components/Alert';
import Button from 'components/Button';
import { InputGroup } from 'components/Forms';
import { useIconService } from 'components/IconService';
import Layout from 'components/Layout';
import { useWallet } from 'components/Wallet';
import WalletHeader from 'components/WalletHeader';
import votingSvg from 'assets/voting.svg';

const ZERO = IconConverter.toBigNumber(0);

function sumVotes(delegates) {
  return delegates.reduce((sum, delegate) => {
    const votes = IconConverter.toBigNumber(delegate.votes);
    return sum.plus(votes.isNaN() ? ZERO : votes);
  }, ZERO);
}

function VotePage() {
  const {
    getPReps,
    network: { trackerUrl },
    setDelegations,
    waitForTransaction,
  } = useIconService();
  const {
    delegations,
    refreshWallet,
    stake: { staked },
    wallet,
  } = useWallet();
  const [selectedDelegates, setSelectedDelegates] = useState([]);
  const [pRepOptions, setPRepOptions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const tooManyVotes = staked && delegations ? sumVotes(selectedDelegates).gt(staked) : false;
  const selectedMaxDelegates = selectedDelegates.length === 10;

  useEffect(() => {
    getPReps().then(pReps => {
      const pRepOptions = pReps.map(pRep => ({
        value: pRep.address,
        label: `${pRep.name} (${pRep.country})`,
      }));
      setPRepOptions(shuffle(pRepOptions));
    });
  }, [getPReps]);

  useEffect(() => {
    if (!(delegations && pRepOptions)) return;
    const selectedDelegates = [];
    pRepOptions.forEach(pRep => {
      const delegation = delegations.find(delegation => delegation.address === pRep.value);
      if (delegation) {
        selectedDelegates.push({ ...pRep, votes: delegation.value });
      }
    });
    setSelectedDelegates(selectedDelegates);
  }, [delegations, pRepOptions]);

  async function handleOnSubmit(event) {
    event.preventDefault();
    if (tooManyVotes) return;
    setIsLoading(true);
    await wait(); // wait to ensure loading state shows

    // If clearing delegations, get the current delegations and set their values to ZERO
    // Passing an empty array of delegations _should_ work, but doesn't seem to
    const isClearingDelegations = selectedDelegates.length === 0;
    const delegationsToSet = isClearingDelegations
      ? delegations.map(({ address }) => ({ address, value: ZERO }))
      : selectedDelegates.map(({ value, votes }) => ({
          address: value,
          value: votes,
        }));

    const confirmation = await swal({
      content: (
        <div>
          <Alert
            type={ALERT_TYPE_DANGER}
            title={
              wallet.isLedgerWallet ? 'Confirm transaction' : 'This is your final confirmation'
            }
            text={`Are you sure you want to ${
              isClearingDelegations ? 'clear' : 'save'
            } your delegations?`}
          />
          {!isClearingDelegations && (
            <table className="w-full mt-6">
              <thead>
                <tr className="text-gray-600 text-sm uppercase tracking-tight">
                  <th className="text-left font-normal">P-Rep candidate</th>
                  <th className="text-right font-normal w-24">Votes</th>
                </tr>
              </thead>
              <tbody>
                {selectedDelegates.map(selectedDelegate => (
                  <tr key={selectedDelegate.value}>
                    <td>{selectedDelegate.label}</td>
                    <td className="text-right">{selectedDelegate.votes.toNumber()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {wallet.isLedgerWallet && (
            <Alert
              type={ALERT_TYPE_INFO}
              text={
                <>
                  Make sure your Ledger device is connected and unlocked with the <b>ICON</b> app
                  running. You will need to confirm the transaction on your Ledger.
                </>
              }
              className="mt-6"
            />
          )}
        </div>
      ),
      buttons: ['Cancel', 'Continue'],
    });
    if (!confirmation) return setIsLoading(false);

    try {
      const transactionHash = await setDelegations(wallet, delegationsToSet);
      waitForTransaction(transactionHash)
        .catch(error => console.warn(error))
        .then(() => refreshWallet());

      await swal(
        <div>
          <Alert
            type={ALERT_TYPE_SUCCESS}
            title="Delegate votes"
            text={`Successfully set vote delegations`}
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
      navigate('/');
    } catch (error) {
      swal(<Alert type={ALERT_TYPE_DANGER} title="Failed delegating votes" text={error.message} />);
      setIsLoading(false);
    }
  }

  function handleSelectDelegates(selectedPReps) {
    const selectedDelegates = (selectedPReps || []).map(pRep => {
      const delegation = delegations.find(delegation => delegation.address === pRep.value);
      const votes = delegation ? delegation.value : ZERO;
      return { ...pRep, votes };
    });
    setSelectedDelegates(selectedDelegates);
  }

  function createVotesChangeHandler(selectedDelegate, parseValue) {
    return event => {
      let votesValue = event.target.value;
      if (parseValue) {
        votesValue = IconConverter.toBigNumber(event.target.value);
      }
      selectedDelegate.votes = parseValue && votesValue.isNaN() ? ZERO : votesValue;

      const index = selectedDelegates.findIndex(
        delegate => delegate.value === selectedDelegate.value
      );
      setSelectedDelegates([
        ...selectedDelegates.slice(0, index),
        selectedDelegate,
        ...selectedDelegates.slice(index + 1),
      ]);
    };
  }

  function createRemoveDelegateHandler(selectedDelegate) {
    return () => {
      const index = selectedDelegates.findIndex(
        delegate => delegate.value === selectedDelegate.value
      );
      setSelectedDelegates([
        ...selectedDelegates.slice(0, index),
        ...selectedDelegates.slice(index + 1),
      ]);
    };
  }

  return (
    <Layout title="Allocate Votes">
      <WalletHeader />
      <h2 className="text-2xl uppercase tracking-tight mt-4 lg:mt-6 mb-2">Delegate votes</h2>
      <div className="sm:flex items-start justify-between">
        <img
          src={votingSvg}
          alt="people with giant voting ballots"
          className="hidden sm:block sm:order-2 sm:w-1/3 max-w-full flex-none sm:ml-6 sm:-mt-8"
        />

        {wallet ? (
          <form onSubmit={handleOnSubmit} className="sm:order-1 sm:flex-1">
            <p>
              Delegated votes on Icon are what keeps the network secure and community development
              funded. To find out what P-Reps are contributing to Icon you can read their{' '}
              <a
                href="https://icon.community/iconsensus/candidates/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-800 focus:text-teal-800"
              >
                P-Rep proposals
              </a>{' '}
              and follow{' '}
              <a
                href="https://twitter.com/TheIconistNews"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-800 focus:text-teal-800"
              >
                The Iconist
              </a>{' '}
              for the latest updates.
            </p>
            <p className="mt-4">
              To vote, choose (up to 10) P-Rep candidates from the dropdown list then set how much
              of your staked ICX to delegate to each. You will be prompted to confirm before the
              transaction is finalised.
            </p>
            {staked && delegations && pRepOptions ? (
              <fieldset disabled={isLoading} className="mt-4">
                <InputGroup>
                  <Select
                    id="selectedDelegates"
                    name="selectedDelegates"
                    options={pRepOptions}
                    value={selectedDelegates}
                    onChange={handleSelectDelegates}
                    isMulti
                    isClearable={false}
                    controlShouldRenderValue={false}
                    placeholder={
                      selectedMaxDelegates
                        ? 'Selected 10 P-Rep candidates'
                        : 'Find P-Rep candidates…'
                    }
                    isDisabled={selectedMaxDelegates}
                    className="text-lg"
                  />
                </InputGroup>

                <InputGroup>
                  <table className="w-full">
                    <thead>
                      <tr className="text-gray-600 text-sm uppercase tracking-tight">
                        <th className="text-left font-normal">P-Rep candidate</th>
                        <th className="text-right font-normal w-24">Votes</th>
                        <th>&nbsp;</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDelegates.map(selectedDelegate => (
                        <tr key={selectedDelegate.value}>
                          <td>{selectedDelegate.label}</td>
                          <td>
                            <input
                              type="text"
                              value={selectedDelegate.votes}
                              onChange={createVotesChangeHandler(selectedDelegate, false)}
                              onBlur={createVotesChangeHandler(selectedDelegate, true)}
                              className="text-lg text-right w-full px-2 py-1 my-px rounded border bg-gray-100"
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={createRemoveDelegateHandler(selectedDelegate)}
                              title="Remove delegation"
                              className="text-gray-700 hover:text-gray-800 focus:text-gray-800 ml-2 -mr-1"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </InputGroup>

                <Alert
                  type={tooManyVotes ? ALERT_TYPE_DANGER : ALERT_TYPE_INFO}
                  title={`${formatNumber(sumVotes(selectedDelegates))} / ${formatNumber(
                    staked
                  )} votes`}
                  text="used / available (staked ICX)"
                  className="mt-6"
                />

                <Button type="submit" disabled={tooManyVotes || isLoading} className="mt-6">
                  <FontAwesomeIcon
                    icon={isLoading ? faCircleNotch : faVoteYea}
                    spin={isLoading}
                    fixedWidth
                    className="mr-2 opacity-75"
                  />
                  Sav{isLoading ? 'ing' : 'e'} votes
                </Button>
              </fieldset>
            ) : (
              <div className="text-center text-3xl mt-4">
                <FontAwesomeIcon icon={faCircleNotch} spin />
              </div>
            )}
          </form>
        ) : (
          <p className="sm:order-1 sm:flex-1">
            You need to have{' '}
            <Link
              to="/unlock?redirectTo=/vote"
              className="text-teal-600 hover:text-teal-800 focus:text-teal-800"
            >
              unlocked a wallet
            </Link>{' '}
            before you can allocate votes.
          </p>
        )}
      </div>
    </Layout>
  );
}

export default VotePage;
