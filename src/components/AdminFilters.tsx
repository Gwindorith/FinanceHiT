'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface AdminFiltersProps {
  onFilterChange: (filters: AdminFilters) => void;
  customers: string[];
}

export interface AdminFilters {
  search: string;
  customer: string;
  dateFrom: string;
  dateTo: string;
  taskStatus: string;
}

export default function AdminFilters({ onFilterChange, customers }: AdminFiltersProps) {
  const [filters, setFilters] = useState<AdminFilters>({
    search: '',
    customer: '',
    dateFrom: '',
    dateTo: '',
    taskStatus: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof AdminFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      customer: '',
      dateFrom: '',
      dateTo: '',
      taskStatus: '',
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="card mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search training name..."
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
                {Object.values(filters).filter(v => v !== '').length}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date From
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date To
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Status
            </label>
            <select
              value={filters.taskStatus}
              onChange={(e) => handleFilterChange('taskStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="">All tasks</option>
              <option value="completed">Completed tasks</option>
              <option value="pending">Pending tasks</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
} 