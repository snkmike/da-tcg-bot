import React from 'react';

export default function PriceFilter({
  setMinPrice,
  setMaxPrice,
  isDisabled = false,
  minValue = 0,
  maxValue = 1000
}) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="min-price" className="block text-sm font-medium text-gray-700 mb-2">
          Prix minimum (€)
        </label>
        <input
          id="min-price"
          type="number"
          min="0"
          step="0.01"
          placeholder="0"
          defaultValue={minValue}
          onChange={e => setMinPrice(e.target.value)}
          className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={isDisabled}
        />
      </div>

      <div>
        <label htmlFor="max-price" className="block text-sm font-medium text-gray-700 mb-2">
        Prix maximum (€)
        </label>
        <input
          id="max-price"
          type="number"
          min="0"
          step="0.01"
          placeholder="1000"
          defaultValue={maxValue}
          onChange={e => setMaxPrice(e.target.value)}
          className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={isDisabled}
        />
      </div>
    </div>
  );
}
