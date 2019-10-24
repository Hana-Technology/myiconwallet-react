import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faWallet } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { useTextInput } from 'utils/useTextInput';
import { wait } from 'utils/wait';
import Button from 'components/Button';
import { ErrorMessage, Input, InputGroup, Label } from 'components/Forms';
import { useWallet } from 'components/Wallet';
import securitySvg from 'assets/security.svg';

const PASSWORD_COMPLEXITY_REGEXP = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[a-zA-Z\d#$@!%&*?]*/;

function CreateWallet({ onCreateWallet }) {
  const { createWallet } = useWallet();
  const passwordInput = useTextInput('');
  const confirmPasswordInput = useTextInput('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    await wait(); // wait to ensure loading state shows

    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    if (validate(password, confirmPassword)) {
      createWallet(password);
      onCreateWallet();
    } else {
      setIsLoading(false);
    }
  }

  function validate(password, confirmPassword) {
    const errors = {};

    if (!password) {
      errors.password = 'Please enter your password';
    } else if (password.length < 8) {
      errors.password = 'Please enter a password that is at least 8 characters long';
    } else if (!PASSWORD_COMPLEXITY_REGEXP.test(password)) {
      errors.password =
        'Please enter a password containing uppercase and lowercase character(s), number(s) and special character(s)';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'The passwords you entered are different';
    }

    setErrors(errors);
    return !errors.password && !errors.confirmPassword;
  }

  return (
    <div className="sm:flex items-start justify-between">
      <img
        src={securitySvg}
        alt="website security with guard"
        className="hidden sm:block sm:order-2 sm:w-1/3 max-w-full flex-none sm:ml-6 sm:-mt-8"
      />

      <form onSubmit={handleSubmit} className="sm:order-1 sm:flex-1">
        <p>
          Enter and confirm a password for your wallet. After your wallet is created you will be
          prompted to download the keystore file for your new wallet.
        </p>

        <fieldset disabled={isLoading}>
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

          <InputGroup>
            <Label htmlFor="confirmPassword">Confirm your password</Label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPasswordInput.value}
              onChange={(...args) => {
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: null });
                }
                confirmPasswordInput.onChange(...args);
              }}
              placeholder="eg. s0meth!ngSup3rSecre7"
              hasError={!!errors.confirmPassword}
            />
            {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
          </InputGroup>

          <Button type="submit" disabled={isLoading} className="mt-6">
            <FontAwesomeIcon
              icon={isLoading ? faCircleNotch : faWallet}
              spin={isLoading}
              fixedWidth
              className="mr-1"
            />
            Creat{isLoading ? 'ing' : 'e'} wallet
          </Button>
        </fieldset>
      </form>
    </div>
  );
}

CreateWallet.propTypes = {
  onCreateWallet: PropTypes.func.isRequired,
};

export default CreateWallet;
