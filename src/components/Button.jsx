import React from 'react';
import { Link } from '@reach/router';
import PropTypes from 'prop-types';

function Button({ children, className, disabled, href, to, ...props }) {
  const TagName = to ? Link : href ? 'a' : 'button';
  return (
    <TagName
      href={href}
      to={to}
      className={`inline-block text-lg font-bold mt-2 px-4 py-2 rounded hover:shadow focus:shadow ${
        disabled
          ? 'bg-gray-500 text-gray-100'
          : 'bg-teal-500 hover:bg-teal-600 focus:bg-teal-600 text-teal-100'
      } ${className || ''}`}
      {...props}
    >
      {children}
    </TagName>
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
