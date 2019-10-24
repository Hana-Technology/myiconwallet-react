import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import Button from 'components/Button';
import Layout from 'components/Layout';

function NotFoundPage() {
  return (
    <Layout title="Page Not Found">
      <h2 className="text-2xl uppercase tracking-tight mb-2">Page not found</h2>
      <p>Sorry, we couldn't find the page you're looking for.</p>
      <Button to="/" className="mt-4">
        <FontAwesomeIcon icon={faHome} className="mr-2" />
        Back to home
      </Button>
    </Layout>
  );
}

export default NotFoundPage;
