// Table for bids/asks in the order book
// This component displays the order book table with bids and asks.

'use client';

import React, { useMemo } from 'react';
import { Venue } from './VenueSelector';
import SimulationSummary from './SimulationSummary';

type OrderBookLevel = [string, string];

interface Props {
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
    symbol: string;
    venue: Venue;
    simulatedOrder?: {
        price: number;
        quantity: number;
        side: 'buy' | 'sell';
    };
}

export default function OrderBookTable({ bids, asks, symbol, venue, simulatedOrder }: Props) {
    // Get max quantity to calculate depth bar width
    const maxBidSize = useMemo(() => Math.max(...bids.map(b => parseFloat(b[1])), 1), [bids]);
    const maxAskSize = useMemo(() => Math.max(...asks.map(a => parseFloat(a[1])), 1), [asks]);

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

    // Check if a price level should be highlighted
    const isHighlighted = (price: string, side: 'buy' | 'sell') => {
        if (!simulatedOrder) return false;
        const priceNum = parseFloat(price);
        const orderPrice = simulatedOrder.price;

        if (simulatedOrder.side === 'buy') {
            return side === 'sell' && priceNum <= orderPrice;
        } else {
            return side === 'buy' && priceNum >= orderPrice;
        }
    };

    return (
        <div>
            <div className="font-sora font-semibold text-[#ffffffcc] mb-2 text-lg text-right hidden md:block">
                {venue} {formatDisplaySymbol(symbol)}
            </div>
            
            <div className="w-full grid grid-cols-2 text-md p-2 md:p-4 rounded-lg cursor-default font-innertight bg-dark">
                {/* Bids */}
                <div>
                    <div className="text-green-400 text-xl md:text-3xl font-extrabold md:mb-4 mb-2 pl-2 font-gabarito">BIDS</div>
                    <div className="flex flex-col-reverse rounded-lg text-sm md:text-base gap-1">
                        {bids.map(([price, size], idx) => {
                            const widthPercent = (parseFloat(size) / maxBidSize) * 100;
                            const highlighted = isHighlighted(price, 'buy');
                            return (
                                <div 
                                    key={idx} 
                                    className={`relative flex justify-between px-2 h-5 ${highlighted ? 'bg-green-900/50 border border-green-500' : ''}`}
                                >
                                    <div className="absolute right-0 top-0 bottom-0 bg-green-900/20 transition-all duration-500 ease-out" 
                                         style={{ width: `${widthPercent}%` }} />
                                    <span className={`${highlighted ? 'font-bold text-white' : 'text-green-300'}`}>
                                        {price}
                                    </span>
                                    <span className={highlighted ? 'font-bold text-white' : ''}>
                                        {size}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Asks */}
                <div>
                    <div className="text-red-400 text-xl md:text-3xl text-right font-extrabold md:mb-4 mb-2 pr-2 font-gabarito">ASKS</div>
                    <div className="flex flex-col rounded-lg text-sm md:text-base gap-1">
                        {[...asks].reverse().map(([price, size], idx) => {
                            const widthPercent = (parseFloat(size) / maxAskSize) * 100;
                            const highlighted = isHighlighted(price, 'sell');
                            return (
                                <div 
                                    key={idx} 
                                    className={`relative flex justify-between px-2 h-5 ${highlighted ? 'bg-red-900/50 border border-red-500' : ''}`}
                                >
                                    <div className="absolute left-0 top-0 bottom-0 bg-red-900/20 transition-all duration-500 ease-out" 
                                         style={{ width: `${widthPercent}%` }} />
                                    <span className={`${highlighted ? 'font-bold text-white' : 'text-red-300'}`}>
                                        {price}
                                    </span>
                                    <span className={highlighted ? 'font-bold text-white' : ''}>
                                        {size}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Simulation Summary */}
            {simulatedOrder && (
                <SimulationSummary
                    bids={bids}
                    asks={asks}
                    simulatedOrder={simulatedOrder}
                />
            )}
        </div>
    );
}
