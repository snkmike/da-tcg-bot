// src/components/SetResult.jsx
import React from 'react';

export default function SetResult({ set }) {
  return (
    <tr key={set.id} className="border-b border-gray-200">
      <td className="px-4 py-3">{set.name}</td>
      <td className="px-4 py-3">{set.game}</td>
      <td className="px-4 py-3">{set.avgPrice}€</td>
      <td className="px-4 py-3">
        <span className={set.performance.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
          {set.performance}
        </span>
      </td>
      <td className="px-4 py-3">{set.topCard}</td>
    </tr>
  );
}
