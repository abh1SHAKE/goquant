// Websocket for OKX
// This module handles the WebSocket connection to OKX for real-time data updates.

type OrderBookLevel = [string, string];

interface OKXMessage {
	arg: {
		channel: string;
		instId: string;
	};
	data: {
		asks: OrderBookLevel[];
		bids: OrderBookLevel[];
		ts: string;
	}[];
	action?: 'snapshot' | 'update';
}

type OrderBookCallback = (
	bids: OrderBookLevel[], 
	asks: OrderBookLevel[], 
	isSnapshot?: boolean
) => void;

let socket: WebSocket | null = null;

export function connectOKXOrderBook(
	symbol: string,
	onOrderBookUpdate: OrderBookCallback,
	onError?: (err: string) => void
): () => void {
	if (socket) {
		socket.close();
	}

  	socket = new WebSocket('wss://ws.okx.com:8443/ws/v5/public');

	socket.onopen = () => {
		const subscribeMsg = {
			op: 'subscribe',
			args: [
				{
				channel: 'books',
				instId: symbol,
				},
			],
		};

		socket?.send(JSON.stringify(subscribeMsg));
	};

	socket.onmessage = (event) => {
		try {
			const msg: OKXMessage = JSON.parse(event.data);

			if (msg?.arg?.channel === 'books' && msg?.data?.[0]) {
				const { bids, asks } = msg.data[0];
				// Only the very first message is a snapshot, all others are updates
				const isSnapshot = msg.action === 'snapshot';

				onOrderBookUpdate(
					bids, 
					asks,
					isSnapshot
				);
			}
		} catch (err) {
			onError?.('Failed to parse OKX WebSocket data');
			console.error('OKX WS Parse Error:', err);
		}
	};

	socket.onerror = (err) => {
		console.error('OKX WebSocket Error:', err);
		onError?.('WebSocket connection error');
	};

	socket.onclose = () => {
		console.log('OKX WebSocket closed');
	};

	return () => {
		if (socket) {
			const unsubscribeMsg = {
				op: 'unsubscribe',
				args: [
				{
					channel: 'books',
					instId: symbol,
				},
				],
			};
			
			socket.send(JSON.stringify(unsubscribeMsg));
			socket.close();
			socket = null;
		}
	};
}