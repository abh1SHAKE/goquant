// // Show fill %age, slippage, market impact, etc.
// // This component displays the simulation summary with various metrics.

'use client';

import { OrderBookLevel } from '@/app/hooks/useOrderBook';

interface SimulationSummaryProps {
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
    simulatedOrder: {
        price: number;
        quantity: number;
        side: 'buy' | 'sell';
    };
}

export default function SimulationSummary({ bids, asks, simulatedOrder }: SimulationSummaryProps) {
    // For buy orders, we look at asks (what we would hit)
    // For sell orders, we look at bids (what we would hit)
    const matchingLevels = simulatedOrder.side === 'buy' ? asks : bids;
    const orderPrice = simulatedOrder.price;
    const orderQuantity = simulatedOrder.quantity;
    
    let cumulativeQuantity = 0;
    let filledQuantity = 0;
    let impactPrice = 0;
    let levelsAffected = 0;
    let wouldRest = false;

    // Market orders get best available price
    if (orderPrice === 0) {
        impactPrice = simulatedOrder.side === 'buy' 
            ? parseFloat(asks[0][0]) 
            : parseFloat(bids[0][0]);
        filledQuantity = Math.min(orderQuantity, parseFloat(matchingLevels[0][1]));
        levelsAffected = 1;
    } 
    // Limit orders
    else {
        for (const [price, size] of matchingLevels) {
            const priceNum = parseFloat(price);
            const sizeNum = parseFloat(size);

            const wouldMatch = simulatedOrder.side === 'buy'
                ? priceNum <= orderPrice
                : priceNum >= orderPrice;

            if (wouldMatch) {
                cumulativeQuantity += sizeNum;
                levelsAffected++;
                
                if (cumulativeQuantity < orderQuantity) {
                    filledQuantity += sizeNum;
                    impactPrice = priceNum;
                } else {
                    const remaining = orderQuantity - filledQuantity;
                    filledQuantity += remaining;
                    impactPrice = priceNum;
                    break;
                }
            }
        }

        wouldRest = filledQuantity === 0 && 
                  ((simulatedOrder.side === 'buy' && orderPrice < parseFloat(asks[0][0])) ||
                   (simulatedOrder.side === 'sell' && orderPrice > parseFloat(bids[0][0])));
    }

    const fillPercentage = orderQuantity > 0 
        ? (filledQuantity / orderQuantity) * 100 
        : 0;

    const midPrice = (parseFloat(asks[0][0]) + parseFloat(bids[0][0])) / 2;
    
    let marketImpact = 0;
    let slippage = 0;
    
    if (filledQuantity > 0) {
        marketImpact = Math.abs((impactPrice - midPrice) / midPrice) * 100;
        slippage = simulatedOrder.side === 'buy'
            ? ((orderPrice > 0 ? orderPrice : impactPrice) - impactPrice) / impactPrice * 100
            : (impactPrice - (orderPrice > 0 ? orderPrice : impactPrice)) / impactPrice * 100;
    }

    return (
        <div className="mt-6 p-4 bg-[#141414] rounded-lg">
            <h3 className="font-sora font-semibold text-lg mb-3 text-[#ffffffcc]">
                Order Impact Analysis
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="text-sm text-[#ffffff99]">Fill Percentage</div>
                    <div className="font-sora font-semibold">
                        {wouldRest ? '0.00% (Resting)' : fillPercentage.toFixed(2) + '%'}
                    </div>
                </div>
                <div>
                    <div className="text-sm text-[#ffffff99]">Market Impact</div>
                    <div className="font-sora font-semibold">
                        {filledQuantity > 0 ? marketImpact.toFixed(4) + '%' : '0.00%'}
                    </div>
                </div>
                <div>
                    <div className="text-sm text-[#ffffff99]">Slippage</div>
                    <div className="font-sora font-semibold">
                        {filledQuantity > 0 ? slippage.toFixed(4) + '%' : '0.00%'}
                    </div>
                </div>
                <div>
                    <div className="text-sm text-[#ffffff99]">Time to Fill</div>
                    <div className="font-sora font-semibold">
                        {wouldRest ? 'Pending' : 
                         levelsAffected > 5 ? '30s+' : 
                         levelsAffected > 2 ? '10-30s' : 'Instant'}
                    </div>
                </div>
            </div>
        </div>
    );
}