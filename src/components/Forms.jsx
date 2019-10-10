import React from 'react';
import PropTypes from 'prop-types';

export function InputGroup({ children, ...props }) {
  return (
    <div className="mb-4" {...props}>
      {children}
    </div>
  );
}
InputGroup.propTypes = {
  children: PropTypes.node.isRequired,
};

export function Label({ children, ...props }) {
  return (
    <label className="block mb-1" {...props}>
      {children}
    </label>
  );
}
Label.propTypes = {
  children: PropTypes.node.isRequired,
};

export function Input({ hasError, ...props }) {
  return (
    <input
      className={`text-lg w-full p-2 rounded border ${
        hasError ? 'bg-red-100 border-red-700' : 'bg-gray-100'
      }`}
      {...props}
    />
  );
}
Input.propTypes = {
  hasError: PropTypes.bool,
};

export function ErrorMessage({ children, ...props }) {
  return (
    <p className="text-red-700" {...props}>
      {children}
    </p>
  );
}
ErrorMessage.propTypes = {
  children: PropTypes.node.isRequired,
};
