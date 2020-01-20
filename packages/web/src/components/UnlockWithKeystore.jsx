import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faUnlockAlt } from '@fortawesome/free-solid-svg-icons';
import { useTextInput } from '@myiconwallet/shared/utils/useTextInput';
import { wait } from '@myiconwallet/shared/utils/wait';
import {
  ERROR_FAILED_READING_FILE,
  ERROR_INVALID_KEYSTORE,
  readKeystoreFile,
} from 'utils/readKeystoreFile';
import Alert, { ALERT_TYPE_INFO } from 'components/Alert';
import Button from 'components/Button';
import { ErrorMessage, Input, InputGroup, Label } from 'components/Forms';
import { useWallet } from 'components/Wallet';

function UnlockWithKeystore({ onUnlockWallet }) {
  const { unlockWallet } = useWallet();
  const passwordInput = useTextInput('');
  const [keystoreFile, setKeystoreFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleOnSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    await wait(); // wait to ensure loading state shows

    let keystore = null;
    if (keystoreFile) {
      try {
        keystore = await readKeystoreFile(keystoreFile);
      } catch (error) {
        keystore = error;
      }
    }
    const password = passwordInput.value;

    if (validate(keystore, password)) {
      if (unlockWallet(keystore, password)) {
        onUnlockWallet();
      } else {
        setErrors({ password: 'Incorrect password for the provided keystore.' });
      }
    }

    setIsLoading(false);
  }

  function validate(keystore, password) {
    const errors = {};

    if (!keystore) {
      errors.keystoreFile = 'Please choose your keystore file';
    } else if (keystore === ERROR_FAILED_READING_FILE) {
      errors.keystoreFile = 'Failed reading file, please try again with a valid keystore file';
    } else if (keystore === ERROR_INVALID_KEYSTORE) {
      errors.keystoreFile = 'Please choose a valid keystore file';
    }

    if (!password) errors.password = 'Please enter your password';

    setErrors(errors);
    return !errors.password && !errors.keystoreFile;
  }

  return (
    <form onSubmit={handleOnSubmit}>
      <p>Choose your keystore file and enter the wallet password to unlock your wallet.</p>
      <Alert
        type={ALERT_TYPE_INFO}
        text="Your keystore file won't be sent anywhere, it will only stay in your web browser session"
        className="mt-4"
      />

      <fieldset disabled={isLoading}>
        <InputGroup>
          <Label htmlFor="keystoreFile">Keystore file</Label>
          <Input
            type="file"
            id="keystoreFile"
            name="keystoreFile"
            onChange={event => {
              if (errors.keystoreFile) {
                setErrors({ ...errors, keystoreFile: null });
              }
              setKeystoreFile(event.target.files[0]);
            }}
            hasError={!!errors.keystoreFile}
          />
          {errors.keystoreFile && <ErrorMessage>{errors.keystoreFile}</ErrorMessage>}
        </InputGroup>

        <InputGroup>
          <Label htmlFor="password">Enter your password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={passwordInput.value}
            onChange={(...args) => {
              if (errors.password) {
                setErrors({ ...errors, password: null });
              }
              passwordInput.onChange(...args);
            }}
            placeholder="eg. s0meth!ngSup3rSecre7"
            hasError={!!errors.password}
          />
          {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
        </InputGroup>

        <Button type="submit" disabled={isLoading} className="mt-6">
          <FontAwesomeIcon
            icon={isLoading ? faCircleNotch : faUnlockAlt}
            spin={isLoading}
            fixedWidth
            className="mr-1 opacity-75"
          />
          Unlock{isLoading && 'ing'} wallet
        </Button>
      </fieldset>
    </form>
  );
}

export default UnlockWithKeystore;
