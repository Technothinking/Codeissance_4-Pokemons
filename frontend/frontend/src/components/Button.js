import React from 'react';

const Button = ({ children, type = 'button', disabled = false, className = '', ...props }) => (
  <button
    type={type}
    disabled={disabled}
    className={`px-4 py-2 rounded bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 transition ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
