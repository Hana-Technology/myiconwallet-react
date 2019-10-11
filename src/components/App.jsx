import React from 'react';
import { Router } from '@reach/router';
import IconService from 'components/IconService';
import Wallet from 'components/Wallet';
import Home from 'pages/Home';
import CreateWallet from 'pages/CreateWallet';
import UnlockWallet from 'pages/UnlockWallet';
import Stake from 'pages/Stake';
import Vote from 'pages/Vote';
import NotFound from 'pages/NotFound';

function App() {
  return (
    <IconService>
      <Wallet>
        <Router>
          <Home path="/" />
          <CreateWallet path="/create" />
          <UnlockWallet path="/unlock" />
          <Stake path="/stake" />
          <Vote path="/vote" />
          <NotFound default />
        </Router>
      </Wallet>
    </IconService>
  );
}

export default App;
