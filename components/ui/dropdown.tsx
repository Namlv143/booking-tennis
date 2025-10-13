"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownOption {
  label: string;
  value: any;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: any;
  onChange: (option: DropdownOption) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Dropdown({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select an option...", 
  className,
  disabled = false 
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Find the selected option
  const selectedOption = options.find(option => 
    JSON.stringify(option.value) === JSON.stringify(value)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleSelect = (option: DropdownOption) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full cursor-pointer flex items-center justify-between px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
          disabled && "bg-gray-50 text-gray-400 cursor-not-allowed",
          isOpen && "border-blue-500 ring-2 ring-blue-500"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={cn(
          "block truncate",
          !selectedOption && "text-gray-500"
        )}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown 
          className={cn(
            "ml-2 h-4 w-4 text-gray-400 transition-transform duration-200",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="py-1" role="listbox">
            {options.map((option, index) => {
              const isSelected = JSON.stringify(option.value) === JSON.stringify(value);
              
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors flex items-center justify-between",
                    isSelected && "bg-blue-50 text-blue-600"
                  )}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="block truncate">{option.label}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dropdown;
