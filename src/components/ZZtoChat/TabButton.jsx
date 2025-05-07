// src/components/ui/TabButton.jsx
import React from 'react';

export default function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 ${
        active
          ? 'text-indigo-600 border-indigo-600'
          : 'text-gray-500 border-transparent hover:text-indigo-600 hover:border-indigo-600'
      }`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );
}