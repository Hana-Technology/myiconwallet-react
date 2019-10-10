import React, { useState } from 'react';
import { useTextInput } from 'utils/useTextInput';
import Button from 'components/Button';
import { ErrorMessage, Input, InputGroup, Label } from 'components/Forms';
import Layout from 'components/Layout';

function UnlockWallet() {
  const passwordInput = useTextInput('');
  const [keystoreFile, setKeystoreFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  function handleOnSubmit(event) {
    event.preventDefault();
    if (validate()) {
      setIsLoading(true);
      console.log('Unlock wallet!', { keystoreFile, password: passwordInput.value });
      setTimeout(() => setIsLoading(false), 1000);
    }
  }

  function validate() {
    const errors = {};

    if (!keystoreFile) errors.keystoreFile = 'Please choose your keystore file.';
    if (!passwordInput.value) errors.password = 'Please enter your password.';

    setErrors(errors);
    return !errors.password && !errors.keystoreFile;
  }

  return (
    <Layout>
      <h2 className="text-2xl uppercase tracking-tight mb-2">Unlock an existing wallet</h2>
      <p className="mb-4">
        Choose your keystore file and enter the wallet password to unlock your wallet. Your keystore
        file won't be sent anywhere, it will only stay in your web browser session.
      </p>
      <form onSubmit={handleOnSubmit}>
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
              placeholder="eg. s0meth!ngsup3rsecre7"
              hasError={!!errors.password}
            />
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </InputGroup>

          <Button type="submit" disabled={isLoading}>
            Unlock{isLoading ? 'ing' : ''} wallet
          </Button>
        </fieldset>
      </form>
    </Layout>
  );
}

export default UnlockWallet;
