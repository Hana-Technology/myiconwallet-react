import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

function AppBanner() {
  return (
    <div className="relative z-50 bg-miw-dark text-center p-3">
      <a
        href="/app"
        className="p-2 bg-miw-primary30 items-center text-white leading-none rounded-full inline-flex"
        role="alert"
      >
        <span className="flex rounded-full bg-miw-primary uppercase px-2 py-1 text-xs font-semibold">
          New
        </span>
        <span className="text-left flex-auto mx-3">
          Check out the new MyIconWallet app on iPhone and Android
        </span>
        <FontAwesomeIcon icon={faAngleRight} className="text-sm" />
      </a>
    </div>
  );
}

export default AppBanner;
