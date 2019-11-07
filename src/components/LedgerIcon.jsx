import React from 'react';
import PropTypes from 'prop-types';

function LedgerIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 557.238 558.933"
      role="logo"
      aria-label="Ledger hardware wallet logo"
      className={`fill-current inline align-middle pt-px ${className || ''}`}
      style={{ height: '1.4em' }}
    >
      <path d="M349.17 15.335h-183v245.6h245.6v-181.7c.1-34.5-28.1-63.9-62.6-63.9zm-239.2 0h-30.7c-34.5 0-64 28.1-64 64v30.7h94.7zm-94.7 152.2h94.7v94.7h-94.7zm301.9 245.6h30.7c34.5 0 64-28.1 64-64v-30.6h-94.7zm-151-94.6h94.7v94.7h-94.7zm-150.9 0v30.7c0 34.5 28.1 64 64 64h30.7v-94.7z" />
    </svg>
  );
}

LedgerIcon.propTypes = {
  className: PropTypes.string,
};

export default LedgerIcon;
