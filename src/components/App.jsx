import React from 'react';
import { Router } from '@reach/router';
import IconService from 'components/IconService';
import Wallet from 'components/Wallet';
import Home from 'pages/Home';
import CreateWallet from 'pages/CreateWallet';
import UnlockWallet from 'pages/UnlockWallet';
import NotFound from 'pages/NotFound';

function App() {
  return (
    <Wallet>
      <IconService>
        <Router>
          <Home path="/" />
          <CreateWallet path="/create" />
          <UnlockWallet path="/unlock" />
          <NotFound default />
        </Router>
      </IconService>
    </Wallet>
  );
}

export default App;
