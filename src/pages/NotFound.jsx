import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import Button from 'components/Button';
import Layout from 'components/Layout';
import notFoundSvg from 'assets/not_found.svg';

function NotFoundPage() {
  return (
    <Layout title="Page Not Found" showAppBanner>
      <div className="sm:flex items-start justify-between">
        <img
          src={notFoundSvg}
          alt="creatures hiding behind trees"
          className="hidden sm:block sm:order-2 sm:w-2/5 max-w-full flex-none sm:ml-6 mt-2"
        />

        <div className="sm:order-1 sm:flex-1">
          <h2 className="text-2xl uppercase tracking-tight">Page not found</h2>
          <p className="mt-4">Sorry, we couldn't find the page you're looking for.</p>
          <Button to="/" className="mt-6">
            <FontAwesomeIcon icon={faHome} className="mr-2 opacity-75" />
            Back to home
          </Button>
        </div>
      </div>
    </Layout>
  );
}

export default NotFoundPage;
