import React from 'react';

function App() {
  return (
    <div className="text-center">
      <header className="bg-gray-800 text-gray-100 min-h-screen flex flex-col items-center justify-center">
        <img src={`${process.env.PUBLIC_URL}/logo256.png`} alt="ICON Foundation logo" />
        <h1 className="text-xl md:text-2xl lg:text-3xl">
          My <span className="text-cyan">ICON</span> Wallet
        </h1>
      </header>
    </div>
  );
}

export default App;
