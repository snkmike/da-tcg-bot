// src/components/ui/TabButton.jsx
import React from 'react';

export default function TabButton({ active, onClick, icon: Icon, label, isPill }) { // Added isPill prop
  const baseClasses = "flex items-center text-sm font-medium focus:outline-none";
  const pillClasses = `px-4 py-2 rounded-md ${active ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'}`;
  const borderBottomClasses = `pb-2 border-b-2 ${active ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-indigo-600 hover:border-indigo-600'}`;

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isPill ? pillClasses : borderBottomClasses}`}
    >
      {Icon && <span className="mr-2"><Icon size={isPill ? 16 : 20} /></span>} {/* Adjust icon size for pills */}
      {label}
    </button>
  );
}