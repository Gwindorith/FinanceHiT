'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface MultiSelectProps {
  options: { value: string; label: string }[] | number[];
  value: string[] | number[];
  onChange: (value: string[] | number[]) => void;
  placeholder?: string;
  label?: string;
}

export default function MultiSelect({ options, value, onChange, placeholder = "Select options...", label }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (optionValue: string | number) => {
    if (typeof optionValue === 'string') {
      const stringValue = value as string[];
      const newValue = stringValue.includes(optionValue)
        ? stringValue.filter(v => v !== optionValue)
        : [...stringValue, optionValue];
      onChange(newValue);
    } else {
      const numberValue = value as number[];
      const newValue = numberValue.includes(optionValue)
        ? numberValue.filter(v => v !== optionValue)
        : [...numberValue, optionValue];
      onChange(newValue);
    }
  };

  const removeItem = (itemToRemove: string | number) => {
    if (typeof itemToRemove === 'string') {
      const stringValue = value as string[];
      onChange(stringValue.filter(v => v !== itemToRemove));
    } else {
      const numberValue = value as number[];
      onChange(numberValue.filter(v => v !== itemToRemove));
    }
  };

  const getDisplayValue = (optionValue: string | number) => {
    if (typeof optionValue === 'string') {
      const option = (options as { value: string; label: string }[]).find(opt => opt.value === optionValue);
      return option ? option.label : optionValue;
    }
    return optionValue.toString();
  };

  const selectedItems = value.map(v => getDisplayValue(v));

  const checkIsSelected = (optionValue: string | number) => {
    if (typeof optionValue === 'string') {
      return (value as string[]).includes(optionValue);
    } else {
      return (value as number[]).includes(optionValue);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div
        className="min-h-[42px] border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-gray-400 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between p-2">
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {selectedItems.length > 0 ? (
              selectedItems.map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                >
                  {item}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(value[index]);
                    }}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-500 hover:bg-blue-200 hover:text-blue-700 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.length > 0 ? (
            options.map((option, index) => {
              const optionValue = typeof option === 'object' ? option.value : option;
              const optionLabel = typeof option === 'object' ? option.label : option.toString();
                             const isSelected = checkIsSelected(optionValue);
              
              return (
                <div
                  key={index}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 text-gray-900' : 'text-gray-900'
                  }`}
                  onClick={() => handleToggle(optionValue)}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    {optionLabel}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-3 py-2 text-gray-500">No options available</div>
          )}
        </div>
      )}
    </div>
  );
} 