import React from 'react';
import Select from 'react-select';
import { ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
import { getCustomSelectStyles, DEFAULT_SORT_OPTIONS } from './utils';

export default function SortFilter({
  sortKey,
  setSortKey,
  sortOrder,
  setSortOrder,
  isDisabled = false,
  sortOptions = DEFAULT_SORT_OPTIONS
}) {
  return (
    <div className="space-y-4">
      <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-2">
        Tri
      </label>
      <div className="flex gap-2">
        <Select
          inputId="sort-select"
          options={sortOptions}
          value={sortOptions.find(opt => opt.value === sortKey)}
          onChange={option => setSortKey(option.value)}
          styles={getCustomSelectStyles()}
          isDisabled={isDisabled}
          className="flex-grow text-sm"
          aria-label="Critère de tri"
        />
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          disabled={isDisabled}
          className={`p-2 rounded-lg border transition-colors ${
            isDisabled
              ? 'border-gray-200 bg-gray-50 text-gray-400'
              : 'border-gray-300 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500'
          }`}
          aria-label={`Trier en ordre ${sortOrder === 'asc' ? 'croissant' : 'décroissant'}`}
        >
          {sortOrder === 'asc' ? (
            <ArrowUpWideNarrow className="w-5 h-5" />
          ) : (
            <ArrowDownWideNarrow className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
