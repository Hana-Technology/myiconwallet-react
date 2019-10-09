import React, { useState } from 'react';
import { useTextInput } from 'utils/useTextInput';
import Layout from 'components/Layout';

function CreateWallet() {
  const passwordInput = useTextInput('');
  const confirmPasswordInput = useTextInput('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function handleSubmit(event) {
    event.preventDefault();

    if (validate()) {
      setIsLoading(true);
      console.log('Creating new wallet!', {
        password: passwordInput.value,
        confirmPassword: confirmPasswordInput.value,
      });
      setTimeout(() => setIsLoading(false), 1000);
    }
  }

  function validate() {
    const errors = {};
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!password) errors.password = 'Please enter your password.';
    else if (password.length < 8)
      errors.password = 'Please enter a password that is at least 8 characters long.';

    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password.';
    else if (confirmPassword !== password)
      errors.confirmPassword = 'The passwords you entered are different.';

    setErrors(errors);
    return !errors.password && !errors.confirmPassword;
  }

  return (
    <Layout>
      <h2 className="text-2xl uppercase tracking-tight mb-2">Create a new wallet</h2>
      <form onSubmit={handleSubmit}>
        <p className="mb-4">
          Enter and confirm a password for your wallet then click the 'Create' button. After your
          wallet is successfully created you will be prompted to download the keystore file for your
          wallet.
        </p>
        <fieldset disabled={isLoading}>
          <div>
            <label htmlFor="password">Password</label>
            <input
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
              className={errors.password && 'border border-red-600'}
            />
            {errors.password && <p className="text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
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
              placeholder="eg. s0meth!ngsup3rsecre7"
              className={errors.confirmPassword && 'border border-red-600'}
            />
            {errors.confirmPassword && <p className="text-red-600">{errors.confirmPassword}</p>}
          </div>

          <button type="submit">Creat{isLoading ? 'ing' : 'e'}</button>
        </fieldset>
      </form>
    </Layout>
  );
}

export default CreateWallet;
