// Symbol input selector component
// This component allows users to select a trading symbol from a list.

'use client';

import { Venue } from './VenueSelector';
import React, { useState, useRef, useEffect } from 'react';

interface SymbolSelectorProps {
    selectedSymbol: string;
    onSymbolChange: (symbol: string) => void;
    venue: Venue;
}

const ALL_SYMBOLS = ['BTC-USD', 'ETH-USD', 'SOL-USD'];

const symbolIcons = {
    'BTC-USD': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="#ffffffcc" d="M8 13v4H6v2h3v2h2v-2h2v2h2v-2.051c1.968-.249 3.5-1.915 3.5-3.949c0-1.32-.65-2.484-1.64-3.213A3.98 3.98 0 0 0 18 9c0-1.858-1.279-3.411-3-3.858V3h-2v2h-2V3H9v2H6v2h2zm6.5 4H10v-4h4.5c1.103 0 2 .897 2 2s-.897 2-2 2M10 7h4c1.103 0 2 .897 2 2s-.897 2-2 2h-4z" />
        </svg>
    ),
    'ETH-USD': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="none" stroke="#ffffffcc" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m19 12l-5.76 2.579c-.611.28-.917.421-1.24.421s-.629-.14-1.24-.421L5 12m14 0c0-.532-.305-1-.917-1.936L14.58 4.696C13.406 2.9 12.82 2 12 2s-1.406.899-2.58 2.696l-3.503 5.368C5.306 11 5 11.468 5 12m14 0c0 .532-.305 1-.917 1.936l-3.503 5.368C13.406 21.1 12.82 22 12 22s-1.406-.899-2.58-2.696l-3.503-5.368C5.306 13 5 12.532 5 12" />
        </svg>
    ),
    'SOL-USD': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="#ffffffcc" d="M18.413 7.901a.62.62 0 0 1-.411.164H3.58c-.512 0-.77-.585-.416-.928l2.368-2.284a.6.6 0 0 1 .41-.169h14.479c.517 0 .77.59.41.934zm0 11.257a.6.6 0 0 1-.411.158H3.58c-.512 0-.77-.58-.416-.923l2.368-2.289a.6.6 0 0 1 .41-.163h14.479c.517 0 .77.585.41.928zm0-8.685a.6.6 0 0 0-.411-.157H3.58c-.512 0-.77.58-.416.922l2.368 2.29a.62.62 0 0 0 .41.163h14.479c.517 0 .77-.585.41-.928z" />
        </svg>
    )
};

export default function SymbolSelector({ selectedSymbol, onSymbolChange, venue }: SymbolSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter symbols based on venue
    const getAvailableSymbols = () => {
        if (venue === 'Deribit') {
            return ALL_SYMBOLS.filter(symbol => symbol !== 'SOL-USD');
        }
        return ALL_SYMBOLS;
    };

    const availableSymbols = getAvailableSymbols();

    // Ensure selected symbol is available for current venue
    useEffect(() => {
        if (!availableSymbols.includes(selectedSymbol)) {
            onSymbolChange(availableSymbols[0]);
        }
    }, [venue, selectedSymbol, availableSymbols, onSymbolChange]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatDisplaySymbol = (symbol: string) => {
        switch(venue) {
            case 'ByBit':
                return symbol.replace('-', '');
            case 'Deribit':
                if (symbol === 'BTC-USD') return 'BTC-PERPETUAL';
                if (symbol === 'ETH-USD') return 'ETH-PERPETUAL';
                return symbol;
            default:
                return symbol;
        }
    };

    return (
        <div className="relative bg-transparent md:bg-[#141414] rounded-lg font-sora font-semibold p-2 md:p-4 w-full">
            <label className="block text-lg mb-2 text-[#ffffffcc]">Symbol</label>
            <div className="relative" ref={dropdownRef}>
                <button
                    className="w-full min-w-[150px] px-4 py-2 border-gray text-[#ffffffcc] rounded-lg flex justify-between items-center cursor-pointer bg-dark"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        {symbolIcons[selectedSymbol as keyof typeof symbolIcons]}
                        <span className="truncate">{formatDisplaySymbol(selectedSymbol)}</span>
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
                        {availableSymbols.map((symbol) => (
                            <div
                                key={symbol}
                                className={`p-3 hover:bg-[#202020] text-[#ffffffcc] cursor-pointer flex items-center ${
                                    selectedSymbol === symbol ? 'bg-[#262626]' : ''
                                }`}
                                onClick={() => {
                                    onSymbolChange(symbol);
                                    setIsOpen(false);
                                }}
                            >
                                {symbolIcons[symbol as keyof typeof symbolIcons]}
                                <span className="truncate ml-2">{formatDisplaySymbol(symbol)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}