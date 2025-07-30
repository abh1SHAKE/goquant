// Websocket for Deribit
// This module handles the WebSocket connection to Deribit for real-time data updates.

type OrderBookLevel = [string, string];

interface DeribitMessage {
    jsonrpc: string;
    method?: string;
    params?: {
        channel: string;
        data: {
            bids: OrderBookLevel[];
            asks: OrderBookLevel[];
            change_id: number;
            timestamp: number;
        };
    };
    error?: {
        code: number;
        message: string;
    };
    id?: number;
}

type OrderBookCallback = (
    bids: OrderBookLevel[],
    asks: OrderBookLevel[],
    isSnapshot?: boolean
) => void;

export function connectDeribitOrderBook(
    symbol: string,
    onOrderBookUpdate: OrderBookCallback,
    onError?: (err: string) => void
): () => void {
    // Convert symbol to Deribit format
    let formattedSymbol: string;
    if (symbol === 'BTC-USD') formattedSymbol = 'BTC-PERPETUAL';
    else if (symbol === 'ETH-USD') formattedSymbol = 'ETH-PERPETUAL';
    else {
        onError?.(`Deribit does not support symbol ${symbol}`);
        return () => {}; // Return empty cleanup function
    }

    // Public orderbook channel (20 levels, 100ms updates)
    const channel = `book.${formattedSymbol}.none.20.100ms`;
    let socket: WebSocket | null = new WebSocket('wss://www.deribit.com/ws/api/v2');

    socket.onopen = () => {
        console.log('Deribit WebSocket connected');
        const subscribeMsg = {
            jsonrpc: "2.0",
            method: "public/subscribe",
            id: 42,
            params: {
                channels: [channel]
            }
        };
        socket?.send(JSON.stringify(subscribeMsg));
    };

    socket.onmessage = (event) => {
        try {
            const msg: DeribitMessage = JSON.parse(event.data);

            // Handle subscription response
            if (msg.id === 42) {
                if (msg.error) {
                    onError?.(`Deribit subscription failed: ${msg.error.message}`);
                }
                return;
            }

            // Handle order book updates
            if (msg.method === 'subscription' && msg.params?.channel === channel) {
                const { bids, asks } = msg.params.data;
                // Deribit's public feed doesn't provide snapshots, always treat as updates
                onOrderBookUpdate(bids, asks, false);
            }
        } catch (err) {
            onError?.('Failed to parse Deribit WebSocket data');
            console.error('Deribit WS Parse Error:', err);
        }
    };

    socket.onerror = (error) => {
        console.error('Deribit WebSocket error:', error);
        onError?.('WebSocket connection error');
    };

    socket.onclose = () => {
        console.log('Deribit WebSocket closed');
    };

    return () => {
        if (socket) {
            console.log('Cleaning up Deribit WebSocket');
            try {
                const unsubscribeMsg = {
                    jsonrpc: "2.0",
                    method: "public/unsubscribe",
                    id: 42,
                    params: {
                        channels: [channel]
                    }
                };
                socket.send(JSON.stringify(unsubscribeMsg));
                socket.close();
            } catch (e) {
                console.error('Deribit cleanup error:', e);
            } finally {
                socket = null;
            }
        }
    };
}