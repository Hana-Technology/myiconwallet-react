import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag, faShareSquare, faVoteYea } from '@fortawesome/pro-duotone-svg-icons';
import { faHamburger } from '@fortawesome/pro-solid-svg-icons';

import { Link, navigate } from '@reach/router';
import Logo from 'components/Logo';
import { useWallet } from 'components/Wallet';

const navLinkBaseClasses =
  'flex h-full text-center hover:text-gray-100 focus:text-gray-100 items-center px-3 py-1 sm:p-1 mx-2 sm:mx-2 my-1 sm:my-0 border-l-2 sm:border-l-0 sm:border-b-2';

function NavLink({ children, to }) {
  return (
    <Link
      to={to}
      getProps={({ isCurrent }) => ({
        className: `${navLinkBaseClasses} ${
          isCurrent ? 'text-gray-100 border-gray-100' : 'text-gray-400 border-gray-800'
        }`,
      })}
    >
      {children}
    </Link>
  );
}

function Header() {
  const { wallet, unloadWallet } = useWallet();
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  function toggleMenu(event) {
    event.preventDefault();
    setMenuIsOpen(!menuIsOpen);
  }

  function handleUnloadWallet(event) {
    event.preventDefault();
    navigate('/');
    unloadWallet();
  }

  return (
    <header className="bg-gray-800 shadow-lg z-10 relative">
      <div className="container mx-auto p-4 pt-3 bg-gray-800 text-gray-100 flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl whitespace-no-wrap" aria-label="my icon wallet">
          <Link to="/" className="select-none">
            my
            <Logo className="text-cyan mx-1" />
            wallet
          </Link>
        </h1>
        <nav>
          <button
            onClick={toggleMenu}
            className="block sm:hidden text-gray-200 hover:text-white focus:text-white p-2"
          >
            <FontAwesomeIcon icon={faHamburger} fixedWidth />
          </button>
          <ul
            className={`absolute sm:static left-0 right-0 bg-gray-800 sm:flex sm:items-stretch sm:justify-start shadow-lg sm:shadow-none pb-3 sm:p-0 slide-down ${
              menuIsOpen ? 'slide-down-in' : ''
            }`}
            style={{ top: '64px', zIndex: '-1' }}
          >
            {wallet ? (
              <>
                <li>
                  <NavLink to="/send">
                    <FontAwesomeIcon icon={faShareSquare} fixedWidth className="mr-1" />
                    Send
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/stake">
                    <FontAwesomeIcon icon={faFlag} fixedWidth className="mr-1" />
                    Stake
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/vote">
                    <FontAwesomeIcon icon={faVoteYea} fixedWidth className="mr-1" />
                    Vote
                  </NavLink>
                </li>
                <li>
                  <button
                    onClick={handleUnloadWallet}
                    className={`${navLinkBaseClasses} text-gray-400 border-gray-800`}
                  >
                    Unload Wallet
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink to="/create">Create Wallet</NavLink>
                </li>
                <li>
                  <NavLink to="/unlock">Unlock</NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
      {menuIsOpen && (
        <div
          className="fixed sm:hidden inset-0 bg-black opacity-25"
          style={{ zIndex: -2 }}
          onClick={toggleMenu}
        ></div>
      )}
    </header>
  );
}

export default Header;
