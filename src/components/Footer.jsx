import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-200 text-gray-600 p-4">
      <div className="container mx-auto text-right text-sm">
        © {new Date().getFullYear()}{' '}
        <a className="hover:text-gray-700 focus:text-gray-700" href="https://www.reliantnode.com/">
          ReliantNode
        </a>
      </div>
    </footer>
  );
}

export default Footer;
