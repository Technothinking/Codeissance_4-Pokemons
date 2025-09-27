import React from 'react';

const Input = React.forwardRef(
  ({ label, id, error, className = '', ...props }, ref) => (
    <div className={`flex flex-col mb-2 ${className}`}>
      {label && (
        <label htmlFor={id || props.name} className="font-medium mb-1 text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`border rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-400 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />
      {error && <span className="text-red-600 text-sm mt-1">{error}</span>}
    </div>
  )
);

export default Input;
