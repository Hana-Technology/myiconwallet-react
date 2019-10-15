import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLink, faShareSquare, faSpinnerThird } from '@fortawesome/pro-duotone-svg-icons';
import { Link, navigate } from '@reach/router';
import swal from '@sweetalert/with-react';
import { IconConverter } from 'icon-sdk-js';
import { convertLoopToIcx } from 'utils/convertIcx';
import { formatNumber } from 'utils/formatNumber';
import { useTextInput } from 'utils/useTextInput';
import { wait } from 'utils/wait';
import Alert, { ALERT_TYPE_INFO, ALERT_TYPE_DANGER, ALERT_TYPE_SUCCESS } from 'components/Alert';
import Button from 'components/Button';
import { ErrorMessage, Input, InputGroup, Label } from 'components/Forms';
import { useIconService } from 'components/IconService';
import Layout from 'components/Layout';
import { useWallet } from 'components/Wallet';
import WalletHeader from 'components/WalletHeader';
import transferMoneySvg from 'assets/transfer_money.svg';

const TRANSACTION_FEE = convertLoopToIcx(Math.pow(10, 15));

function SendPage() {
  const {
    network: { trackerUrl },
    sendIcx,
  } = useIconService();
  const { balance, wallet, refreshWallet } = useWallet();
  const amountInput = useTextInput('');
  const addressInput = useTextInput('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasFocusedInput, setHasFocusedInput] = useState(false);

  async function handleOnSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    await wait(); // wait to ensure loading state shows

    const amount = amountInput.value;
    const address = addressInput.value;
    if (!validate(amount, address)) return setIsLoading(false);

    const confirmation = await swal({
      content: (
        <Alert
          type={ALERT_TYPE_DANGER}
          title="This is your final confirmation"
          text={`Are you sure you want to send ${amount} ICX to ${address}?`}
          className="break-all"
        />
      ),
      buttons: ['Cancel', 'Continue'],
    });
    if (!confirmation) return setIsLoading(false);

    const transactionHash = await sendIcx(wallet, amount, address);
    setTimeout(() => refreshWallet(), 4000); // allow time for transaction before refreshing
    await swal(
      <div>
        <Alert
          type={ALERT_TYPE_SUCCESS}
          title="Sent ICX"
          text={`Successfully sent ${amount} ICX to ${address}`}
          className="break-all"
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
    navigate('/');
  }

  function validate(amount, address) {
    const errors = {};

    const parsedAmount = IconConverter.toBigNumber(amount);
    if (!amount) {
      errors.amount = 'Please enter an amount';
    } else if (parsedAmount.isNaN() || parsedAmount.isLessThanOrEqualTo(0)) {
      errors.amount = 'Please enter a valid ICX amount';
    } else if (parsedAmount.isGreaterThan(balance.minus(TRANSACTION_FEE))) {
      errors.amount = `You have entered an amount more than your available balance + ${TRANSACTION_FEE.toString()} transaction fee`;
    }

    if (!address) {
      errors.address = 'Please enter an address';
    } else if (!/^hx[a-zA-Z0-9]{40}$/.test(address)) {
      errors.address = 'Please enter a valid ICON wallet address';
    }

    setErrors(errors);
    return !errors.amount && !errors.address;
  }

  function handleRefFocus(element) {
    if (element && !hasFocusedInput) {
      element.focus();
      setHasFocusedInput(true);
    }
  }

  return (
    <Layout title="Send ICX">
      <WalletHeader />
      <h2 className="text-2xl uppercase tracking-tight mt-4 lg:mt-6 mb-2">Send ICX</h2>
      <div className="sm:flex items-start justify-between">
        <img
          src={transferMoneySvg}
          alt="person sending money online"
          className="hidden sm:block sm:order-2 sm:w-1/3 max-w-full flex-none sm:ml-6 sm:-mt-8"
        />

        {wallet ? (
          <form onSubmit={handleOnSubmit} className="sm:order-1 sm:flex-1">
            <p>
              Choose an amount in ICX and a destination address. You will be prompted to confirm
              before the transaction is finalised.
            </p>
            {balance && (
              <Alert
                type={ALERT_TYPE_INFO}
                title={`${formatNumber(balance)} ICX`}
                text="Available balance"
                className="mt-4"
              />
            )}

            <fieldset disabled={isLoading}>
              <InputGroup>
                <Label htmlFor="amount">Amount in ICX</Label>
                <Input
                  type="text"
                  id="amount"
                  name="amount"
                  value={amountInput.value}
                  onChange={(...args) => {
                    if (errors.amount) {
                      setErrors({ ...errors, amount: null });
                    }
                    amountInput.onChange(...args);
                  }}
                  placeholder="eg. 42"
                  hasError={!!errors.amount}
                  ref={handleRefFocus}
                />
                {errors.amount && <ErrorMessage>{errors.amount}</ErrorMessage>}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="address">Destination address</Label>
                <Input
                  type="text"
                  id="address"
                  name="address"
                  value={addressInput.value}
                  onChange={(...args) => {
                    if (errors.address) {
                      setErrors({ ...errors, address: null });
                    }
                    addressInput.onChange(...args);
                  }}
                  placeholder="eg. hx9d8a8376e7db9f00478feb9a46f44f0d051aab57"
                  hasError={!!errors.address}
                />
                {errors.address && <ErrorMessage>{errors.address}</ErrorMessage>}
              </InputGroup>

              <Button type="submit" disabled={isLoading}>
                <FontAwesomeIcon
                  icon={isLoading ? faSpinnerThird : faShareSquare}
                  spin={isLoading}
                  fixedWidth
                  className="mr-1"
                />
                Send{isLoading ? 'ing' : ''} ICX
              </Button>
            </fieldset>
          </form>
        ) : (
          <p className="sm:order-1 sm:flex-1">
            You need to have{' '}
            <Link to="/unlock" className="text-teal-600 hover:text-teal-800 focus:text-teal-800">
              unlocked a wallet
            </Link>{' '}
            before you can send ICX.
          </p>
        )}
      </div>
    </Layout>
  );
}

export default SendPage;
