import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLink, faFlag, faSpinnerThird } from '@fortawesome/pro-duotone-svg-icons';
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

function StakePage() {
  const {
    network: { trackerUrl },
    setStake,
  } = useIconService();
  const {
    fullBalance,
    stake: { staked },
    wallet,
    refreshWallet,
  } = useWallet();
  const [maxStakeable, setMaxStakeable] = useState(null);
  const [newStake, setNewStake] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!(fullBalance && staked)) return void setMaxStakeable(null);
    setNewStake(staked.toNumber());
    setMaxStakeable(fullBalance.minus(WITHHOLD_BALANCE));
  }, [fullBalance, staked]);

  async function handleOnSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    await wait(); // wait to ensure loading state shows

    const confirmation = await swal({
      content: (
        <Alert
          type={ALERT_TYPE_DANGER}
          title="This is your final confirmation"
          text={`Are you sure you want to change your stake to ${newStake} ICX?`}
          className="break-all"
        />
      ),
      buttons: ['Cancel', 'Continue'],
    });
    if (!confirmation) return setIsLoading(false);

    const transactionHash = await setStake(wallet, newStake);
    setTimeout(() => refreshWallet(), 3000); // allow time for transaction before refreshing
    await swal(
      <div>
        <Alert
          type={ALERT_TYPE_SUCCESS}
          title="Set ICX"
          text={`Successfully set stake to ${newStake} ICX`}
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

  function handleNewStakeChange(value) {
    setNewStake(value);
  }

  const stakedAsInt = staked ? staked.integerValue().toNumber() : null;
  const maxStakeableAsInt = maxStakeable ? maxStakeable.integerValue().toNumber() : null;

  return (
    <Layout title="Stake ICX">
      <WalletHeader />
      <h2 className="text-2xl uppercase tracking-tight mt-4 lg:mt-6 mb-2">Stake ICX</h2>
      <div className="sm:flex items-start justify-between">
        <img
          src={financeSvg}
          alt="person leaning on computer with charts"
          className="hidden sm:block sm:order-2 sm:w-1/3 max-w-full flex-none sm:ml-6 sm:-mt-8"
        />

        {wallet ? (
          <form onSubmit={handleOnSubmit} className="sm:order-1 sm:flex-1">
            <p>
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

                <fieldset disabled={isLoading}>
                  <div className="flex items-center justify-between mt-8">
                    <div className="w-32 flex-none">
                      <div className="text-3xl leading-tight">
                        {newStake}
                        <span className="text-base ml-2">ICX</span>
                      </div>
                      <div className="text-sm text-gray-600 uppercase tracking-tight">
                        New stake
                      </div>
                    </div>
                    <div className="w-full">
                      <Slider
                        max={maxStakeableAsInt}
                        labels={{
                          [stakedAsInt]: 'Current',
                        }}
                        tooltip={false}
                        value={newStake}
                        onChange={handleNewStakeChange}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} className="mt-6">
                    <FontAwesomeIcon
                      icon={isLoading ? faSpinnerThird : faFlag}
                      spin={isLoading}
                      fixedWidth
                      className="mr-1"
                    />
                    Set{isLoading ? 'ting' : ''} staked ICX
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
            before you can stake ICX.
          </p>
        )}
      </div>
    </Layout>
  );
}

export default StakePage;
