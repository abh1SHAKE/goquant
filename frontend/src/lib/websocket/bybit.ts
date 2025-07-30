// Websocket for ByBit
// This module handles the WebSocket connection to ByBit for real-time data updates.

import { convertSymbolForExchange
    
 } from "../symbolConverter";
type OrderBookLevel = [string, string];

interface ByBitMessage {
    topic: string;
    type: 'snapshot' | 'delta';
    data: {
        s: string; // Symbol
        b: OrderBookLevel[]; // Bids
        a: OrderBookLevel[]; // Asks
        u: number; // Update ID
        seq: number; // Sequence number
    };
}

type OrderBookCallback = (
    bids: OrderBookLevel[],
    asks: OrderBookLevel[],
    isSnapshot?: boolean
) => void;

let socket: WebSocket | null = null;

export function connectByBitOrderBook(
    symbol: string,
    onOrderBookUpdate: OrderBookCallback,
    onError?: (err: string) => void
): () => void {
    const formattedSymbol = convertSymbolForExchange(symbol, 'ByBit');

    if (socket) {
        socket.close();
    }

    // ByBit WebSocket URL for spot market
    socket = new WebSocket('wss://stream.bybit.com/v5/public/spot');

    socket.onopen = () => {
        const subscribeMsg = {
            op: 'subscribe',
            args: [`orderbook.50.${formattedSymbol}`]
        };

        socket?.send(JSON.stringify(subscribeMsg));
    };

    socket.onmessage = (event) => {
        try {
            const msg: ByBitMessage = JSON.parse(event.data);

            if (msg?.topic?.startsWith('orderbook.50.') && msg?.data) {
                const { b: bids, a: asks } = msg.data;
                const isSnapshot = msg.type === 'snapshot';

                onOrderBookUpdate(
                    bids.map(bid => [bid[0], bid[1]]),
                    asks.map(ask => [ask[0], ask[1]]),
                    isSnapshot
                );
            }
        } catch (err) {
            onError?.('Failed to parse ByBit WebSocket data');
            console.error('ByBit WS Parse Error:', err);
        }
    };

    socket.onerror = (err) => {
        console.error('ByBit WebSocket Error:', err);
        onError?.('WebSocket connection error');
    };

    socket.onclose = () => {
        console.log('ByBit WebSocket closed');
    };

    return () => {
        if (socket) {
            const unsubscribeMsg = {
                op: 'unsubscribe',
                args: [`orderbook.50.${formattedSymbol}`]
            };
            
            socket.send(JSON.stringify(unsubscribeMsg));
            socket.close();
            socket = null;
        }
    };
}