// Websocket for Deribit
// This module handles the WebSocket connection to Deribit for real-time data updates.

type OrderBookLevel = [string, string];

interface DeribitMessage {
    method: 'subscription';
    params: {
        channel: string;
        data: {
            bids: OrderBookLevel[];
            asks: OrderBookLevel[];
            type: 'snapshot' | 'change';
            timestamp: number;
        };
    };
}

type OrderBookCallback = (
    bids: OrderBookLevel[],
    asks: OrderBookLevel[],
    isSnapshot?: boolean
) => void;

let socket: WebSocket | null = null;

export function connectDeribitOrderBook(
    symbol: string,
    onOrderBookUpdate: OrderBookCallback,
    onError?: (err: string) => void
): () => void {
    if (socket) {
        socket.close();
    }

    // Deribit WebSocket URL
    socket = new WebSocket('wss://www.deribit.com/ws/api/v2');

    socket.onopen = () => {
        const subscribeMsg = {
            jsonrpc: "2.0",
            method: "public/subscribe",
            id: 42,
            params: {
                channels: [`book.${symbol}.raw`]
            }
        };

        socket?.send(JSON.stringify(subscribeMsg));
    };

    socket.onmessage = (event) => {
        try {
            const msg: DeribitMessage = JSON.parse(event.data);

            if (msg?.method === 'subscription' && 
                msg?.params?.channel?.startsWith('book.') && 
                msg?.params?.data) {
                const { bids, asks } = msg.params.data;
                const isSnapshot = msg.params.data.type === 'snapshot';

                onOrderBookUpdate(
                    bids,
                    asks,
                    isSnapshot
                );
            }
        } catch (err) {
            onError?.('Failed to parse Deribit WebSocket data');
            console.error('Deribit WS Parse Error:', err);
        }
    };

    socket.onerror = (err) => {
        console.error('Deribit WebSocket Error:', err);
        onError?.('WebSocket connection error');
    };

    socket.onclose = () => {
        console.log('Deribit WebSocket closed');
    };

    return () => {
        if (socket) {
            const unsubscribeMsg = {
                jsonrpc: "2.0",
                method: "public/unsubscribe",
                id: 42,
                params: {
                    channels: [`book.${symbol}.raw`]
                }
            };
            
            socket.send(JSON.stringify(unsubscribeMsg));
            socket.close();
            socket = null;
        }
    };
}