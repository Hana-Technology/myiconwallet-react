import React from 'react';
import { Link } from '@reach/router';
import Layout from 'components/Layout';

function NotFound() {
  return (
    <Layout>
      <h2 className="text-2xl uppercase tracking-tight mb-2">Page not found</h2>
      <p>
        Sorry, we couldn't find the page you're looking for. Back to{' '}
        <Link to="/" className="text-teal-600 hover:text-teal-800 focus:text-teal-800">
          home
        </Link>
        .
      </p>
    </Layout>
  );
}

export default NotFound;
