import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Footer from 'components/Footer';
import Header from 'components/Header';

function Layout({ children, styleMain = true, title }) {
  useEffect(() => {
    document.title = `${title ? `${title} | ` : ''}MyIconWallet`;
  }, [title]);

  return (
    <div className="flex flex-col min-h-screen font-sans font-light">
      <Header />
      <main className="flex-1 bg-gray-100 text-gray-800 sm:px-4">
        {styleMain ? (
          <div className="w-full bg-white max-w-4xl mx-auto mb-10 sm:mt-6 sm:mb-16 p-6 lg:p-8 shadow-2xl overflow-hidden sm:rounded">
            {children}
          </div>
        ) : (
          children
        )}
      </main>
      <Footer />
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  styleMain: PropTypes.bool,
  title: PropTypes.string,
};

export default Layout;
