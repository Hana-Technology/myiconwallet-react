import React from 'react';
import PropTypes from 'prop-types';
import Footer from 'components/Footer';
import Header from 'components/Header';

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 text-gray-800 px-4 py-6">
        <div className="container mx-auto">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
