import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLockAlt, faUnlockAlt, faWallet } from '@fortawesome/pro-duotone-svg-icons';
import { faLongArrowRight } from '@fortawesome/pro-solid-svg-icons';
import { Link } from '@reach/router';
import connectedWorldSvg from 'assets/connected_world.svg';

function MegaButton({ to, title, description, cta, icon, className }) {
  return (
    <Link
      to={to}
      className={`block sm:inline-block sm:w-1/2 px-8 py-6 rounded-lg shadow-xl hover:shadow-2xl ${className ||
        ''} mega-button`}
    >
      <h3 className="text-xl uppercase tracking-tight">
        <FontAwesomeIcon icon={icon} className="mr-2" />
        {title}
      </h3>
      <p className="mt-3">{description}</p>
      <p className="text-lg font-bold mt-3">
        {cta}
        <FontAwesomeIcon icon={faLongArrowRight} fixedWidth className="text-sm ml-2" />
      </p>
    </Link>
  );
}

function Landing() {
  return (
    <div className="container mx-auto pt-8 pb-12">
      <div className="sm:flex items-center justify-center max-w-6xl mx-auto">
        <div className="p-4 pt-0 sm:p-6 sm:pt-4 lg:pr-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl leading-tight">
            An <span className="text-teal-500">Icon</span> web wallet — by the{' '}
            <span className="text-teal-500">community</span>, for the community.
          </h2>
          <p className="text-lg mt-10">
            <FontAwesomeIcon icon={faLockAlt} className="mr-1" /> <b>MyIconWallet</b> is safe. Your
            private key never leaves the browser.
          </p>
          <p className="text-lg mt-2">
            Use your existing wallet from ICONex or create a new one. All wallets are compatible
            with ICONex.
          </p>
        </div>
        <img
          src={connectedWorldSvg}
          alt="world map with network lines"
          className="hidden sm:block w-0 md:w-1/2 max-w-full flex-none pr-6"
        />
      </div>
      <div className="sm:flex justify-between max-w-4xl mx-auto mt-8 sm:mt-12 px-4 sm:px-6">
        <MegaButton
          to="/create"
          title="Create a wallet"
          description="Enter a password to create a new wallet and download the keystore to access it next time"
          cta="Get started"
          icon={faWallet}
          className="bg-teal-500 hover:bg-teal-600 text-teal-100"
        />
        <MegaButton
          to="/unlock"
          title="Unlock a wallet"
          description="Provide your existing keystore and password to unlock and start using your wallet"
          cta="Access now"
          icon={faUnlockAlt}
          className="mt-6 sm:mt-0 sm:ml-6 bg-blue-600 hover:bg-blue-700 text-blue-100"
        />
      </div>
    </div>
  );
}

export default Landing;
