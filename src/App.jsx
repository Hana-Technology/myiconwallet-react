import React from 'react';
import Logo from 'components/Logo';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-gray-100 p-4 pt-3 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-2xl lg:text-3xl whitespace-no-wrap" aria-label="my icon wallet">
            my
            <Logo className="text-cyan mx-1" />
            wallet
          </h1>
        </div>
      </header>
      <main className="flex-1 text-gray-800 py-6">
        <div className="container mx-auto">
          <p className="text-lg">
            Your <Logo iconClassName="text-teal-600" /> wallet goes here!
          </p>
        </div>
      </main>
      <footer className="bg-gray-200 text-gray-600 p-4">
        <div className="container mx-auto text-right text-sm">
          © {new Date().getFullYear()}{' '}
          <a className="hover:text-gray-700" href="https://www.reliantnode.com/">
            ReliantNode
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
