import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExternalLink,
  faSpinnerThird,
  faTimes,
  faVoteYea,
} from '@fortawesome/pro-duotone-svg-icons';
import { Link, navigate } from '@reach/router';
import swal from '@sweetalert/with-react';
import { IconConverter } from 'icon-sdk-js';
import Select from 'react-select';
import { formatNumber } from 'utils/formatNumber';
import { wait } from 'utils/wait';
import Alert, { ALERT_TYPE_INFO, ALERT_TYPE_DANGER, ALERT_TYPE_SUCCESS } from 'components/Alert';
import Button from 'components/Button';
import { Input, InputGroup } from 'components/Forms';
import { useIconService } from 'components/IconService';
import Layout from 'components/Layout';
import { useWallet } from 'components/Wallet';
import WalletHeader from 'components/WalletHeader';
import votingSvg from 'assets/voting.svg';

const ZERO = IconConverter.toBigNumber(0);

function sumVotes(delegates) {
  return delegates.reduce((sum, delegate) => sum.plus(delegate.votes), ZERO);
}

function VotePage() {
  const {
    getPReps,
    network: { trackerUrl },
    setDelegations,
  } = useIconService();
  const {
    delegations,
    refreshWallet,
    stake: { stake },
    wallet,
  } = useWallet();
  const [selectedDelegates, setSelectedDelegates] = useState([]);
  const [pRepOptions, setPRepOptions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const tooManyVotes = stake && delegations ? sumVotes(selectedDelegates).gt(stake) : false;

  useEffect(() => {
    getPReps().then(pReps => {
      const pRepOptions = pReps.map(pRep => ({
        value: pRep.address,
        label: `${pRep.name} (${pRep.country})`,
      }));
      setPRepOptions(pRepOptions);
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

    const confirmation = await swal({
      content: (
        <div>
          <Alert
            type={ALERT_TYPE_DANGER}
            title="This is your final confirmation"
            text={`Are you sure you want to save your delegations?`}
            className="break-all"
          />
          <table className="mt-6">
            <thead>
              <tr>
                <th className="text-left text-sm font-normal uppercase tracking-tight">
                  P-Rep candidate
                </th>
                <th className="text-right text-sm font-normal uppercase tracking-tight w-24">
                  Votes
                </th>
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
        </div>
      ),
      buttons: ['Cancel', 'Continue'],
    });
    if (!confirmation) return setIsLoading(false);

    const delegations = selectedDelegates.map(({ value, votes }) => ({
      address: value,
      value: votes,
    }));
    const transactionHash = await setDelegations(wallet, delegations);
    setTimeout(() => refreshWallet(), 3000); // allow time for transaction before refreshing
    await swal(
      <div>
        <Alert
          type={ALERT_TYPE_SUCCESS}
          title="Delegate votes"
          text={`Successfully set vote delegations`}
          className="break-all mb-4"
        />
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
    navigate('/');
  }

  function handleSelectDelegates(selectedPReps) {
    const selectedDelegates = (selectedPReps || []).map(pRep => {
      const delegation = delegations.find(delegation => delegation.address === pRep.value);
      const votes = delegation ? delegation.value : ZERO;
      return { ...pRep, votes };
    });
    setSelectedDelegates(selectedDelegates);
  }

  function createVotesChangeHandler(selectedDelegate) {
    return event => {
      const votesValue = IconConverter.toBigNumber(event.target.value);
      selectedDelegate.votes = votesValue.isNaN() ? ZERO : votesValue;
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
            <p className="mb-8">
              Choose P-Rep candidates that you want to vote for from the dropdown list then set how
              much of your staked ICX to delegate to each. You will be prompted to confirm before
              the transaction is completed.
            </p>
            {stake && delegations && pRepOptions ? (
              <>
                <fieldset disabled={isLoading}>
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
                      placeholder="Find P-Rep candidates..."
                    />
                  </InputGroup>

                  <InputGroup>
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left text-sm font-normal uppercase tracking-tight">
                            P-Rep candidate
                          </th>
                          <th className="text-right text-sm font-normal uppercase tracking-tight w-24">
                            Votes
                          </th>
                          <th>&nbsp;</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDelegates.map(selectedDelegate => (
                          <tr key={selectedDelegate.value}>
                            <td>{selectedDelegate.label}</td>
                            <td>
                              <Input
                                type="text"
                                value={selectedDelegate.votes.toNumber()}
                                onChange={createVotesChangeHandler(selectedDelegate)}
                                className="text-right"
                              ></Input>
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={createRemoveDelegateHandler(selectedDelegate)}
                                title="Remove delegation"
                                className="text-lg ml-2 -mr-3"
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
                      stake
                    )} votes`}
                    text="used / available (staked ICX)"
                    className="mt-6 mb-4"
                  />

                  <Button type="submit" disabled={tooManyVotes || isLoading}>
                    <FontAwesomeIcon
                      icon={isLoading ? faSpinnerThird : faVoteYea}
                      spin={isLoading}
                      fixedWidth
                      className="mr-2"
                    />
                    Sav{isLoading ? 'ing' : 'e'} votes
                  </Button>
                </fieldset>
              </>
            ) : (
              <div className="text-center text-3xl">
                <FontAwesomeIcon icon={faSpinnerThird} spin />
              </div>
            )}
          </form>
        ) : (
          <p className="sm:order-1 sm:flex-1">
            You need to have{' '}
            <Link to="/unlock" className="text-teal-600 hover:text-teal-800 focus:text-teal-800">
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
