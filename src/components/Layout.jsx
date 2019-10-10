import React from 'react';
import PropTypes from 'prop-types';
import Footer from 'components/Footer';
import Header from 'components/Header';

function Layout({ children, styleMain = true }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-100 text-gray-800 px-4">
        {styleMain ? (
          <div className="w-full bg-white max-w-2xl mx-auto mb-4 sm:mb-6 px-4 py-6 md:p-6 lg:p-8 shadow-md">
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
};

export default Layout;
