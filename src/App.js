import React from 'react';
import logo from './logo.svg';

function App() {
  return (
    <div className="text-center">
      <header className="bg-gray-800 text-white text-sm sm:text-base md:text-lg lg:text-xl min-h-screen flex flex-col items-center justify-center">
        <img src={logo} style={{ height: '40vmin' }} alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="text-teal-400"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
