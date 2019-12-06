import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { ICONEX_RELAY } from 'utils/constants';
import Alert, { ALERT_TYPE_DANGER } from 'components/Alert';
import Button from 'components/Button';
import IconLogo from 'components/Logo';
import { useWallet } from 'components/Wallet';

function UnlockWithICONex({ onUnlockWallet }) {
  const { accessICONexWallet } = useWallet();
  const [hasExtension, setHasExtension] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  function relayEventHandler(event) {
    const { type, payload } = event.detail;
    switch (type) {
      case 'RESPONSE_HAS_ACCOUNT':
        return handleResponseHasAccount(payload);
      case 'RESPONSE_ADDRESS':
        return handleResponseAddress(payload);
      default:
        console.warn(`No handler setup for event ${type}`);
    }
  }

  useEffect(() => {
    setIsChecking(true);
    setTimeout(() => setIsChecking(false), 2000);
    window.addEventListener(ICONEX_RELAY.RESPONSE, relayEventHandler);

    window.dispatchEvent(
      new CustomEvent(ICONEX_RELAY.REQUEST, {
        detail: { type: 'REQUEST_HAS_ACCOUNT' },
      })
    );

    return () => void window.removeEventListener(ICONEX_RELAY.RESPONSE, relayEventHandler);
  }, []); // eslint-disable-line

  function handleResponseHasAccount({ hasAccount }) {
    setHasExtension(true);
    setHasAccount(hasAccount);
    setIsChecking(false);
  }

  function handleResponseAddress(address) {
    accessICONexWallet(address);
    onUnlockWallet();
  }

  function getICONexAddress() {
    window.dispatchEvent(
      new CustomEvent(ICONEX_RELAY.REQUEST, {
        detail: { type: 'REQUEST_ADDRESS' },
      })
    );
  }

  return (
    <>
      {isChecking ? (
        <p>
          <FontAwesomeIcon icon={faCircleNotch} spin className="mr-2" />
          Checking for ICONex extension...
        </p>
      ) : !hasExtension ? (
        <Alert
          type={ALERT_TYPE_DANGER}
          title="Could not find ICONex"
          text={
            <>
              You need to be using the <b>Chrome</b> browser and have the{' '}
              <a
                href="https://chrome.google.com/webstore/detail/iconex/flpiciilemghbmfalicajoolhkkenfel"
                title="ICONex on Chrome Web Store"
                target="_blank"
                rel="noopener noreferrer"
                className="font-normal underline"
              >
                ICONex extension
              </a>{' '}
              installed.
            </>
          }
          className="mt-6"
        />
      ) : !hasAccount ? (
        <Alert
          type={ALERT_TYPE_DANGER}
          title="No ICONex account"
          text={
            <>
              You need to add an account to the <b>ICONex extension</b>.
            </>
          }
          className="mt-6"
        />
      ) : (
        <p>
          Click the <i>Get ICONex wallet</i> button then choose a wallet from the ICONex popup and
          click the <i>Confirm</i> button.
        </p>
      )}
      <Button
        type="button"
        onClick={getICONexAddress}
        disabled={isChecking || !hasExtension || !hasAccount}
        className="mt-6"
      >
        <IconLogo iconOnly={true} className="mr-2 opacity-75" />
        Get ICONex wallet
      </Button>
    </>
  );
}

export default UnlockWithICONex;
