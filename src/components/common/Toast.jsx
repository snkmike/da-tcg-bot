import React from 'react';

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 px-4 py-2 rounded shadow z-50">
      {message}
    </div>
  );
}
