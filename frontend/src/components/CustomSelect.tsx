'use client';

import React, { useState, useRef, useEffect } from 'react';

interface CustomSelectProps<T extends string> {
    options: T[];
    selectedValue: T;
    onValueChange: (value: T) => void;
    renderOption?: (value: T) => React.ReactNode;
    renderSelected?: (value: T) => React.ReactNode;
    className?: string;
}

export function CustomSelect<T extends string>({
    options,
    selectedValue,
    onValueChange,
    renderOption,
    renderSelected,
    className = ''
}: CustomSelectProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative font-sora font-semibold ${className}`} ref={dropdownRef}>
            <button
                type="button"
                className="w-full px-4 py-2 border-gray text-[#ffffffcc] rounded-lg flex justify-between items-center cursor-pointer bg-dark"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center">
                    {renderSelected ? renderSelected(selectedValue) : selectedValue}
                </div>
                <svg 
                    className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="#ffffffcc" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 overflow-hidden border-2 border-[#3e3e3e] bg-dark rounded-lg shadow-lg">
                    {options.map((option) => (
                        <div
                            key={option}
                            className={`p-2 hover:bg-[#202020] text-[#ffffffcc] cursor-pointer flex items-center ${
                                selectedValue === option ? 'bg-[#262626]' : ''
                            }`}
                            onClick={() => {
                                onValueChange(option);
                                setIsOpen(false);
                            }}
                        >
                            {renderOption ? renderOption(option) : option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}