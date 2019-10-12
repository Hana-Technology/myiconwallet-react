import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Footer from 'components/Footer';
import Header from 'components/Header';

function Layout({ children, styleMain = true, title }) {
  useEffect(() => {
    document.title = `${title ? `${title} | ` : ''}My ICON Wallet`;
  }, [title]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-100 text-gray-800 px-4">
        {styleMain ? (
          <div className="w-full bg-white max-w-2xl mx-auto mb-4 sm:mb-6 p-6 lg:p-8 shadow-md">
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
