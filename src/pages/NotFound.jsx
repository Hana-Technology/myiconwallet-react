import React from 'react';
import Button from 'components/Button';
import Layout from 'components/Layout';

function NotFoundPage() {
  return (
    <Layout title="Page Not Found">
      <h2 className="text-2xl uppercase tracking-tight mb-2">Page not found</h2>
      <p className="mb-4">Sorry, we couldn't find the page you're looking for.</p>
      <Button to="/">Back to home</Button>
    </Layout>
  );
}

export default NotFoundPage;
