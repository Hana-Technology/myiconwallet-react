import React from 'react';
import PropTypes from 'prop-types';

function Button({ children, className, disabled, href, ...props }) {
  const TagName = href ? 'a' : 'button';
  return (
    <TagName
      href={href}
      className={`inline-block text-lg mt-2 px-3 py-2 rounded hover:shadow-md ${
        disabled ? 'bg-gray-500 text-gray-100' : 'bg-teal-500 text-teal-100'
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
};

export default Button;
