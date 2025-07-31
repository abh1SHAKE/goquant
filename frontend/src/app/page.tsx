// Main app entry point
// This file is the main entry point for the Next.js application.

'use client';

import { useState } from 'react';
import { useOrderBook } from './hooks/useOrderBook';
import OrderBookTable from '@/components/OrderBookTable';
import Navbar from '@/components/Navbar';
import { Venue } from '@/components/VenueSelector';
import SymbolSelector from '@/components/SymbolSelector';
import OrderSimulationForm from '@/components/OrderSimulationForm';
import DepthChart from '@/components/DepthChart';

export default function HomePage() {
	const [symbol, setSymbol] = useState('BTC-USD');
	const [venue, setVenue] = useState<Venue>('OKX');

	const [simulatedOrder, setSimulatedOrder] = useState<{
        price: number;
        quantity: number;
        side: 'buy' | 'sell';
    } | null>(null);

  	const { bids, asks, loading, error } = useOrderBook({ venue, symbol });

	return (
		<div className="max-w-7xl mx-auto">
			<div>
				<Navbar venue={venue} onVenueChange={setVenue}/>
			</div>

			<div className="flex flex-col md:flex-row gap-4 md:gap-6">
				<div className="w-full md:w-[35%] bg-transparent md:bg-[#141414] rounded-lg p-2 md:p-4">
					<SymbolSelector selectedSymbol={symbol} onSymbolChange={setSymbol} venue={venue} />

					<OrderSimulationForm 
						venue={venue} 
						onVenueChange={setVenue} 
						symbol={symbol} 
						onSymbolChange={setSymbol} 
						onOrderSubmit={(orderData) => {
							setSimulatedOrder({
								price: parseFloat(orderData.price) || 0,
								quantity: parseFloat(orderData.quantity) || 0,
								side: orderData.side
							});
						}}
					/>
				</div>
				<div className="w-full md:w-[65%]">
					<OrderBookTable bids={bids} asks={asks} symbol={symbol} venue={venue} simulatedOrder={simulatedOrder || undefined} />
				</div>
			</div>

			<div>
				<DepthChart bids={bids} asks={asks}/>
			</div>
		</div>
	);
}
