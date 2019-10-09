import React from 'react';
import { Router } from '@reach/router';
import Home from 'pages/Home';
import CreateWallet from 'pages/CreateWallet';
import UnlockWallet from 'pages/UnlockWallet';
import NotFound from 'pages/NotFound';

function App() {
  return (
    <Router>
      <Home path="/" />
      <CreateWallet path="/create" />
      <UnlockWallet path="/unlock" />
      <NotFound default />
    </Router>
  );
}

export default App;
