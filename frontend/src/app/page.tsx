// Main app entry point
// This file is the main entry point for the Next.js application.

'use client';

import { useState } from 'react';
import { useOrderBook } from './hooks/useOrderBook';
import OrderBookTable from '@/components/OrderBookTable';
import Navbar from '@/components/Navbar';
import { Venue } from '@/components/VenueSelector';
import SymbolSelector from '@/components/SymbolSelector';

export default function HomePage() {
	const [symbol, setSymbol] = useState('BTC-USD');
	const [venue, setVenue] = useState<Venue>('OKX');

  	const { bids, asks, loading, error } = useOrderBook({ venue, symbol });

	return (
		<div className="max-w-7xl mx-auto">
			<div>
				<Navbar venue={venue} onVenueChange={setVenue}/>
			</div>

			<div className="flex flex-col md:flex-row gap-4 md:gap-6">
				<div className="w-full md:w-[30%]">
					<SymbolSelector selectedSymbol={symbol} onSymbolChange={setSymbol} venue={venue} />
				</div>
				<div className="w-full md:w-[70%]">
					<OrderBookTable bids={bids} asks={asks} />
				</div>
			</div>
		</div>
	);
}
