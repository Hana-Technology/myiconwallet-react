import React from 'react';
import { Link } from '@reach/router';
import Logo from 'components/Logo';

function NavLink({ children, to }) {
  return (
    <Link
      to={to}
      getProps={({ isCurrent }) => ({
        className: `flex h-full text-center items-center p-1 mx-2 border-b-2 ${
          isCurrent ? 'text-gray-100 border-gray-100' : 'text-gray-400 border-gray-800'
        }`,
      })}
    >
      {children}
    </Link>
  );
}
function Header() {
  return (
    <header className="bg-gray-800 text-gray-100 p-4 pt-3 shadow-lg">
      <div className="container mx-auto flex justify-between">
        <h1 className="text-2xl lg:text-3xl whitespace-no-wrap" aria-label="my icon wallet">
          <Link to="/">
            my
            <Logo className="text-cyan mx-1" />
            wallet
          </Link>
        </h1>
        <nav className="flex items-stretch justify-start">
          <ul>
            <NavLink to="/create">Create Wallet</NavLink>
          </ul>
          <ul>
            <NavLink to="/unlock">Unlock</NavLink>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
