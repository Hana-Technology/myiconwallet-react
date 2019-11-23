import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import Alert, { ALERT_TYPE_DANGER } from 'components/Alert';
import Button from 'components/Button';
import IconLogo from 'components/Logo';

const ICONEX_RELAY_REQUEST = 'ICONEX_RELAY_REQUEST';
const ICONEX_RELAY_RESPONSE = 'ICONEX_RELAY_RESPONSE';

function UnlockWithICONex({ onUnlockWallet }) {
  const [hasExtension, setHasExtension] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

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
    window.addEventListener(ICONEX_RELAY_RESPONSE, relayEventHandler);

    window.dispatchEvent(
      new CustomEvent(ICONEX_RELAY_REQUEST, {
        detail: { type: 'REQUEST_HAS_ACCOUNT' },
      })
    );

    return () => void window.removeEventListener(ICONEX_RELAY_RESPONSE, relayEventHandler);
  }, []); // eslint-disable-line

  function handleResponseHasAccount({ hasAccount }) {
    setHasExtension(true);
    setHasAccount(hasAccount);
    setIsChecking(false);
  }

  function handleResponseAddress(address) {
    setIsLoading(true);
    console.log('SELECTED WALLET', { address });
    // TODO: call access wallet function, then onUnlockWallet
    setTimeout(() => setIsLoading(false), 2000);
  }

  function getICONexAddress() {
    window.dispatchEvent(
      new CustomEvent(ICONEX_RELAY_REQUEST, {
        detail: { type: 'REQUEST_ADDRESS' },
      })
    );
  }

  return isChecking ? (
    <p>
      <FontAwesomeIcon icon={faCircleNotch} spin className="mr-2" />
      Checking for ICONex extension...
    </p>
  ) : !hasExtension ? (
    <Alert
      type={ALERT_TYPE_DANGER}
      title="Could not find ICONex"
      text="You need to be using the Chrome browser and have the ICONex extension installed."
      className="mt-6"
    />
  ) : !hasAccount ? (
    <Alert
      type={ALERT_TYPE_DANGER}
      title="No ICONex account"
      text="You need to add an account to the ICONex extension."
      className="mt-6"
    />
  ) : (
    <>
      <p>Click the button then choose which wallet from ICONex you would like to use.</p>

      <Button type="button" onClick={getICONexAddress} disabled={isLoading} className="mt-6">
        {isLoading ? (
          <FontAwesomeIcon icon={faCircleNotch} spin className="mr-2 opacity-75" />
        ) : (
          <IconLogo iconOnly={true} className="mr-2 opacity-75" />
        )}
        Get{isLoading && 'ting'} ICONex address
      </Button>
    </>
  );
}

export default UnlockWithICONex;
