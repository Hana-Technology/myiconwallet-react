import React from 'react';
import { Link } from '@reach/router';
import Logo from 'components/Logo';

function Landing() {
  return (
    <>
      <p className="text-lg">
        Welcome to my
        <Logo className="text-teal-600 mx-px" />
        wallet! You'll need to{' '}
        <Link to="/create" className="text-teal-600 hover:text-teal-800 focus:text-teal-800">
          create a new wallet
        </Link>{' '}
        or{' '}
        <Link to="/unlock" className="text-teal-600 hover:text-teal-800 focus:text-teal-800">
          unlock an existing wallet
        </Link>{' '}
        before you continue.
      </p>
      <p className="text-lg">
        <Link to="/create">Create a new wallet</Link>
      </p>
      <p className="text-lg">
        <Link to="/unlock">Unlock an existing wallet</Link>
      </p>
    </>
  );
}

export default Landing;
