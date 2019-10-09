import React from 'react';
import Logo from 'components/Logo';

function App() {
  return (
    <div className="text-center">
      <header className="bg-gray-800 text-gray-100 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-xl md:text-2xl lg:text-3xl whitespace-no-wrap">
          my
          <Logo className="text-cyan mx-px md:mx-1" />
          wallet
        </h1>
      </header>
    </div>
  );
}

export default App;
