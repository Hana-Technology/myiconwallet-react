import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faExternalLinkAlt, faFlag } from '@fortawesome/free-solid-svg-icons';
import { Link, navigate } from '@reach/router';
import swal from '@sweetalert/with-react';
import { IconConverter } from 'icon-sdk-js';
import Slider from 'react-rangeslider';
import { formatNumber } from 'utils/formatNumber';
import { wait } from 'utils/wait';
import Alert, { ALERT_TYPE_INFO, ALERT_TYPE_DANGER, ALERT_TYPE_SUCCESS } from 'components/Alert';
import Button from 'components/Button';
import { useIconService } from 'components/IconService';
import Layout from 'components/Layout';
import { useWallet } from 'components/Wallet';
import WalletHeader from 'components/WalletHeader';
import financeSvg from 'assets/finance.svg';
import 'react-rangeslider/lib/index.css';

const WITHHOLD_BALANCE = IconConverter.toBigNumber(3);
const ZERO = IconConverter.toBigNumber(0);

function StakePage() {
  const {
    network: { trackerUrl },
    setStake,
    waitForTransaction,
  } = useIconService();
  const {
    delegations,
    fullBalance,
    refreshWallet,
    stake: { staked },
    wallet,
  } = useWallet();
  const [maxStakeable, setMaxStakeable] = useState(null);
  const [useMax, setUseMax] = useState(false);
  const [newStake, setNewStake] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!(fullBalance && staked)) return void setMaxStakeable(null);
    setNewStake(parseFloat(formatNumber(staked, 2)));
    setMaxStakeable(fullBalance.minus(WITHHOLD_BALANCE));
  }, [fullBalance, staked]);

  const delegatedVotes = delegations
    ? delegations.reduce((sum, { value }) => sum.plus(value), ZERO)
    : ZERO;
  const moreVotesThanStake = delegatedVotes.isGreaterThan(newStake);

  async function handleOnSubmit(event) {
    event.preventDefault();
    if (moreVotesThanStake) return;
    setIsLoading(true);
    await wait(); // wait to ensure loading state shows

    const confirmation = await swal({
      content: (
        <Alert
          type={ALERT_TYPE_DANGER}
          title={wallet.isLedgerWallet ? 'Confirm transaction' : 'This is your final confirmation'}
          text={
            <>
              Are you sure you want to change your stake to <b>{newStake} ICX</b>?
            </>
          }
        />
      ),
      buttons: ['Cancel', 'Continue'],
    });
    if (!confirmation) return setIsLoading(false);

    try {
      if (wallet.isLedgerWallet) {
        swal({
          content: (
            <Alert
              type={ALERT_TYPE_INFO}
              title="Confirm transaction on Ledger"
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
      const stakeAmount = useMax ? maxStakeable : newStake;
      const transactionHash = await setStake(wallet, stakeAmount);
      if (wallet.isLedgerWallet) swal.close();

      waitForTransaction(transactionHash)
        .catch(error => console.warn(error))
        .then(() => refreshWallet());

      await swal(
        <div>
          <Alert
            type={ALERT_TYPE_SUCCESS}
            title="Staked ICX"
            text={
              <>
                Successfully set stake to <b>{newStake} ICX</b>
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
      navigate('/');
    } catch (error) {
      swal(
        <Alert type={ALERT_TYPE_DANGER} title="Failed setting staked ICX" text={error.message} />
      );
      setIsLoading(false);
    }
  }

  function handleNewStakeChange(value) {
    if (useMax) return;
    setNewStake(value);
  }

  function handleUseMaxChange(event) {
    const { checked } = event.target;
    setUseMax(checked);

    const newStake = checked ? maxStakeable : staked;
    setNewStake(parseFloat(formatNumber(newStake, 2)));
  }

  const stakedAsInt = staked ? staked.integerValue().toNumber() : null;
  const maxStakeableAsInt = maxStakeable ? maxStakeable.integerValue().toNumber() : null;

  return (
    <Layout title="Stake ICX">
      <WalletHeader />
      <h2 className="text-2xl uppercase tracking-tight mt-4 lg:mt-6">Stake ICX</h2>
      <div className="sm:flex items-start justify-between">
        <img
          src={financeSvg}
          alt="person leaning on computer with charts"
          className="hidden sm:block sm:order-2 sm:w-1/3 max-w-full flex-none sm:ml-6 sm:-mt-6"
        />

        {wallet ? (
          <form onSubmit={handleOnSubmit} className="sm:order-1 sm:flex-1">
            <p className="mt-2">
              Use the slider to adjust your staked ICX. You will be prompted to confirm before the
              transaction is completed.
            </p>
            {staked && maxStakeable ? (
              <>
                <Alert
                  type={ALERT_TYPE_INFO}
                  title={`${formatNumber(staked)} / ${maxStakeableAsInt} ICX`}
                  text="Current / max stake"
                  className="mt-4"
                />

                <fieldset disabled={isLoading} className="mt-8">
                  <div className="flex items-end justify-between">
                    <div className="">
                      <div className="text-3xl leading-tight">
                        {newStake}
                        <span className="text-base ml-2">ICX</span>
                      </div>
                      <div className="text-sm text-gray-600 uppercase tracking-tight">
                        New stake
                      </div>
                    </div>
                    <label htmlFor="sendAll" className="flex items-center justify-end">
                      <input
                        type="checkbox"
                        id="sendAll"
                        name="sendAll"
                        checked={useMax}
                        onChange={handleUseMaxChange}
                        className="mr-2"
                      />
                      <span className="text-sm">Stake maximum?</span>
                    </label>
                  </div>

                  <div className="mt-6">
                    <Slider
                      max={maxStakeableAsInt}
                      labels={{
                        [stakedAsInt]: 'Current',
                      }}
                      tooltip={false}
                      value={newStake}
                      onChange={handleNewStakeChange}
                      className={useMax ? 'disabled' : ''}
                    />
                  </div>

                  {moreVotesThanStake && (
                    <Alert
                      type={ALERT_TYPE_DANGER}
                      title="Unstake ICX with delegated votes"
                      text={`You currently have ${formatNumber(
                        delegatedVotes
                      )} ICX with delegated votes. You need to remove the votes before unstaking.`}
                      className="mt-6"
                    />
                  )}

                  <Button type="submit" disabled={moreVotesThanStake || isLoading} className="mt-6">
                    <FontAwesomeIcon
                      icon={isLoading ? faCircleNotch : faFlag}
                      spin={isLoading}
                      fixedWidth
                      className="mr-1 opacity-75"
                    />
                    Set{isLoading ? 'ting' : ''} staked ICX
                  </Button>
                </fieldset>
              </>
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
              to="/unlock?redirectTo=/stake"
              className="text-teal-600 hover:text-teal-800 focus:text-teal-800"
            >
              unlocked a wallet
            </Link>{' '}
            before you can stake ICX.
          </p>
        )}
      </div>
    </Layout>
  );
}

export default StakePage;
