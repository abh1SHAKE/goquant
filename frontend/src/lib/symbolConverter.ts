type Venue = "OKX" | "ByBit" | "Deribit";

export function convertSymbolForExchange(symbol: string, venue: Venue): string | null {
    const [base, quote] = symbol.split('-');
    
    switch(venue) {
        case 'ByBit':
            // ByBit only supports certain pairs - BTC/USDT, ETH/USDT, etc.
            if (quote !== 'USD') return null;
            if (!['BTC', 'ETH', 'SOL'].includes(base)) return null;
            return `${base}USDT`; // ByBit uses USDT as quote for these pairs
            
        case 'Deribit':
            // Deribit supports BTC-PERPETUAL and ETH-PERPETUAL
            if (base === 'BTC') return 'BTC-PERPETUAL';
            if (base === 'ETH') return 'ETH-PERPETUAL';
            return null; // Deribit doesn't support SOL
            
        case 'OKX':
        default:
            return symbol; // OKX uses the original format
    }
}