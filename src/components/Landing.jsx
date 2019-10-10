import React from 'react';
import { Link } from '@reach/router';
import Logo from 'components/Logo';

function MegaButton({ to, title, description, cta, className }) {
  return (
    <Link
      to={to}
      className={`inline-block w-1/2 px-8 py-6 rounded-lg hover:shadow-md ${className || ''}`}
    >
      <h3 className="text-xl uppercase tracking-tight mb-3">{title}</h3>
      <p className="mb-3">{description}</p>
      <p className="text-lg font-bold">{cta} ➜</p>
    </Link>
  );
}

function Landing() {
  return (
    <div className="container mx-auto py-8">
      <p className="text-lg mb-6">
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
      <div className="flex justify-between">
        <MegaButton
          to="/create"
          title="Create a new wallet"
          description="Provide a password and we'll create a new wallet and give you the keystore to access it next time"
          cta="Get started"
          className="mr-6 bg-teal-500 hover:bg-teal-600 text-teal-100"
        />
        <MegaButton
          to="/unlock"
          title="Unlock an existing wallet"
          description="Provide your existing keystore and password to unlock and start using your wallet"
          cta="Access now"
          className="bg-gray-600 hover:bg-gray-700 text-gray-100"
        />
      </div>
    </div>
  );
}

export default Landing;
