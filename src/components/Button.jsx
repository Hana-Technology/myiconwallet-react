import React from 'react';
import { Link } from '@reach/router';
import PropTypes from 'prop-types';

function hasDisplayClass(className = '') {
  return (
    className.includes('hidden') ||
    className.includes('block') ||
    className.includes('inline-block') ||
    className.includes('flex')
  );
}

function Button({ className, disabled, href, to, ...props }) {
  const TagName = to ? Link : href ? 'a' : 'button';
  return (
    <TagName
      href={href}
      to={to}
      className={`text-lg font-bold px-4 py-3 rounded hover:shadow focus:shadow ${
        disabled
          ? 'bg-gray-500 text-gray-100'
          : 'bg-teal-500 hover:bg-teal-600 focus:bg-teal-600 text-white'
      } ${hasDisplayClass(className) ? '' : 'inline-block'} ${className || ''}`}
      {...props}
    />
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  href: PropTypes.string,
  to: PropTypes.string,
};

export default Button;
