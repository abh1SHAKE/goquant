'use client';

export type Venue = 'OKX' | 'ByBit' | 'Deribit';

interface VenueSelectorProps {
    selectedVenue: Venue;
    onVenueChange: (venue: Venue) => void;
}

const venueIcons = {
    OKX: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="mr-2">
            <path fill="#ffffffcc" d="M3 3h6v6H3zm12 6H9v6H3v6h6v-6h6v6h6v-6h-6zm0 0V3h6v6z" />
        </svg>
    ),
    ByBit: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
	        <path fill="#ffffffcc" d="M15.829 13.626V9h.93v4.626zM4.993 15H3v-4.626h1.913c.93 0 1.471.507 1.471 1.3c0 .513-.348.845-.588.955c.287.13.655.423.655 1.04c0 .863-.609 1.33-1.458 1.33m-.154-3.82h-.91v1.065h.91c.395 0 .615-.214.615-.533c0-.317-.22-.532-.615-.532m.06 1.877h-.97v1.137h.97c.42 0 .622-.259.622-.571s-.201-.565-.622-.565zm4.388.046V15h-.923v-1.898l-1.431-2.728h1.01l.889 1.864l.877-1.864h1.01zM13.355 15h-1.993v-4.626h1.913c.93 0 1.47.507 1.47 1.3c0 .513-.347.845-.588.955c.287.13.655.423.655 1.04c0 .863-.608 1.33-1.457 1.33m-.155-3.82h-.91v1.065h.91c.395 0 .616-.214.616-.533c0-.317-.22-.532-.616-.532m.06 1.877h-.97v1.137h.97c.422 0 .622-.259.622-.571s-.2-.565-.622-.565zm6.495-1.876V15h-.929v-3.82h-1.245v-.806H21v.806z" />
        </svg>
    ),
    Deribit: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="mr-2">
            <path fill="#ffffffcc" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8z" />
            <path fill="#ffffffcc" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5s5-2.24 5-5s-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3s3 1.35 3 3s-1.35 3-3 3z" />
        </svg>
    )
};

import React, { useState, useRef, useEffect } from 'react';

export default function VenueSelector({ selectedVenue, onVenueChange }: VenueSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const venues: Venue[] = ['OKX', 'ByBit', 'Deribit'];

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
        <div className="relative font-sora font-semibold w-fit" ref={dropdownRef}>
            <button
                className="min-w-[150px] px-4 py-2 border-gray text-[#ffffffcc] rounded-lg flex justify-between items-center cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                {venueIcons[selectedVenue]}
                {selectedVenue}
                <svg className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="#ffffffcc" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 overflow-hidden border-2 border-[#3e3e3e] bg-dark rounded-lg shadow-lg">
                    {venues.map((venue) => (
                        <div
                            key={venue}
                            className={`p-2 hover:bg-[#202020] text-[#ffffffcc] cursor-pointer ${selectedVenue === venue ? 'bg-[#262626]' : ''}`}
                            onClick={() => {
                                onVenueChange(venue);
                                setIsOpen(false);
                            }}
                        >
                            {venue}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}