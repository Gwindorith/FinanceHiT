'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import MultiSelect from './MultiSelect';

interface InvoiceFiltersProps {
  onFilterChange: (filters: InvoiceFilters) => void;
  customers: string[];
  months: { value: string; label: string }[];
  years: number[];
}

export interface InvoiceFilters {
  search: string;
  customer: string;
  months: string[];
  years: number[];
  minAmount: string;
  maxAmount: string;
}

export default function InvoiceFilters({ onFilterChange, customers, months, years }: InvoiceFiltersProps) {
  const [filters, setFilters] = useState<InvoiceFilters>({
    search: '',
    customer: '',
    months: [],
    years: [],
    minAmount: '',
    maxAmount: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof InvoiceFilters, value: string | string[] | number[]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      customer: '',
      months: [],
      years: [],
      minAmount: '',
      maxAmount: '',
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = (() => {
    return filters.search !== '' || 
           filters.customer !== '' || 
           filters.months.length > 0 || 
           filters.years.length > 0 || 
           filters.minAmount !== '' || 
           filters.maxAmount !== '';
  })();

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search !== '') count++;
    if (filters.customer !== '') count++;
    if (filters.months.length > 0) count++;
    if (filters.years.length > 0) count++;
    if (filters.minAmount !== '') count++;
    if (filters.maxAmount !== '') count++;
    return count;
  };

  return (
    <div className="card mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search training name, invoice number..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-3 py-2 rounded-lg border ${
              showFilters || hasActiveFilters
                ? 'bg-primary-50 border-primary-200 text-primary-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                {getActiveFilterCount()}
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer
            </label>
            <select
              value={filters.customer}
              onChange={(e) => handleFilterChange('customer', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="">All customers</option>
              {customers.map((customer) => (
                <option key={customer} value={customer}>
                  {customer}
                </option>
              ))}
            </select>
          </div>

          <div>
            <MultiSelect
              options={months}
              value={filters.months}
              onChange={(value) => handleFilterChange('months', value as string[])}
              placeholder="Select months..."
              label="Months"
            />
          </div>

          <div>
            <MultiSelect
              options={years}
              value={filters.years}
              onChange={(value) => handleFilterChange('years', value as number[])}
              placeholder="Select years..."
              label="Years"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Amount (€)
            </label>
            <input
              type="number"
              placeholder="0"
              value={filters.minAmount}
              onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Amount (€)
            </label>
            <input
              type="number"
              placeholder="∞"
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
} 