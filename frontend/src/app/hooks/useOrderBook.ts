// Shared hook for managing orderbook data

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { connectOKXOrderBook } from "@/lib/websocket/okx";
import { throttle } from "lodash";
import { connectByBitOrderBook } from "@/lib/websocket/bybit";
import { connectDeribitOrderBook } from "@/lib/websocket/deribit";

type OrderBookLevel = [string, string]; 

type Venue = "OKX" | "ByBit" | "Deribit";

interface UseOrderBookOptions {
    venue: Venue;
    symbol: string;
}

function updateOrderBookMap(
    existingMap: Map<string, number>,
    newLevels: OrderBookLevel[],
    isSnapshot: boolean,
    isBid: boolean
): OrderBookLevel[] {
    // For snapshots, replace the entire map with new data
    if (isSnapshot) {
        existingMap.clear();
        
        // Add all new levels to the map
        for (const [price, sizeStr] of newLevels) {
            const size = parseFloat(sizeStr);
            if (size > 0 && !isNaN(size)) {
                existingMap.set(price, size);
            }
        }
    } else {
        // For incremental updates, merge with existing data
        for (const [price, sizeStr] of newLevels) {
            const size = parseFloat(sizeStr);
            
            if (size === 0 || isNaN(size)) {
                existingMap.delete(price);
            } else {
                existingMap.set(price, size);
            }
        }
    }

    // Convert map to sorted array and return top 15
    const sorted = Array.from(existingMap.entries())
        .sort((a, b) => {
            const pa = parseFloat(a[0]);
            const pb = parseFloat(b[0]);
            return isBid ? pb - pa : pa - pb; // Bids: high to low, Asks: low to high
        })
        .slice(0, 15)
        .map(([price, size]) => [price, size.toFixed(2)] as OrderBookLevel);

    return sorted;
}

export function useOrderBook({ venue, symbol }: UseOrderBookOptions) {
    const [bids, setBids] = useState<OrderBookLevel[]>([]);
    const [asks, setAsks] = useState<OrderBookLevel[]>([]);
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const bidMap = useRef<Map<string, number>>(new Map());
    const askMap = useRef<Map<string, number>>(new Map());
    const cleanupRef = useRef<(() => void) | null>(null);
    
    // Debug counters
    const updateCountRef = useRef({ 
        bids: 0, 
        asks: 0, 
        snapshots: 0,
        updates: 0 
    });

    const updateOrderBook = useCallback(() => {
        // Generate current state from maps
        const newBids = updateOrderBookMap(bidMap.current, [], false, true);
        const newAsks = updateOrderBookMap(askMap.current, [], false, false);
        
        setBids(newBids);
        setAsks(newAsks);
        
        // Debug log to monitor map health
        // console.log('OrderBook state:', {
        //     bidMapSize: bidMap.current.size,
        //     askMapSize: askMap.current.size,
        //     outputBids: newBids.length,
        //     outputAsks: newAsks.length,
        //     snapshots: updateCountRef.current.snapshots,
        //     updates: updateCountRef.current.updates
        // });
    }, []);

    const throttledUpdate = useRef(
        throttle(updateOrderBook, 100, { 
            leading: true, 
            trailing: true 
        })
    );

    useEffect(() => {
        throttledUpdate.current.cancel();
        throttledUpdate.current = throttle(updateOrderBook, 50, { 
            leading: true, 
            trailing: true 
        });
    }, [updateOrderBook]);

    useEffect(() => {
        setLoading(true);
        setError(null);
        setConnected(false);
        
        // Clear the maps and counters
        bidMap.current.clear();
        askMap.current.clear();
        updateCountRef.current = { bids: 0, asks: 0, snapshots: 0, updates: 0 };

        const handleUpdate = (
            newBids: OrderBookLevel[],
            newAsks: OrderBookLevel[],
            isSnapshot: boolean = false
        ) => {
            if (isSnapshot) {
                updateCountRef.current.snapshots++;
                // console.log(`📸 SNAPSHOT #${updateCountRef.current.snapshots}:`, {
                //     inputBids: newBids.length,
                //     inputAsks: newAsks.length
                // });
            } else {
                updateCountRef.current.updates++;
                // console.log(`🔄 UPDATE #${updateCountRef.current.updates}:`, {
                //     inputBids: newBids.length,
                //     inputAsks: newAsks.length
                // });
            }

            let hasChanges = false;

            // Process bids
            if (newBids && newBids.length > 0) {
                updateOrderBookMap(bidMap.current, newBids, isSnapshot, true);
                updateCountRef.current.bids++;
                hasChanges = true;
            }

            // Process asks  
            if (newAsks && newAsks.length > 0) {
                updateOrderBookMap(askMap.current, newAsks, isSnapshot, false);
                updateCountRef.current.asks++;
                hasChanges = true;
            }

            if (hasChanges) {
                throttledUpdate.current();
                setLoading(false);
                setConnected(true);
            }

            // Warning if maps are growing too large (indicates incorrect snapshot handling)
            // if (bidMap.current.size > 100 || askMap.current.size > 100) {
            //     console.warn('⚠️ Maps growing too large:', {
            //         bidMapSize: bidMap.current.size,
            //         askMapSize: askMap.current.size,
            //         lastMessageType: isSnapshot ? 'snapshot' : 'update'
            //     });
            // }
        };

        const handleError = (errMsg: string) => {
            console.error('OrderBook error:', errMsg);
            setError(errMsg);
            setConnected(false);
            setLoading(false);
        };

        switch (venue) {
            case "OKX":
                cleanupRef.current = connectOKXOrderBook(
                    symbol,
                    handleUpdate,
                    handleError
                );
                break;
            case "ByBit":
                cleanupRef.current = connectByBitOrderBook(
                    symbol,
                    handleUpdate,
                    handleError
                )
                break;
            case "Deribit":
                cleanupRef.current = connectDeribitOrderBook(
                    symbol,
                    handleUpdate,
                    handleError
                )
                break;
            default:
                handleError("Unsupported venue");
        }

        return () => {
            console.log('Cleaning up WebSocket for', venue, symbol);
            if (cleanupRef.current) {
                cleanupRef.current();
                cleanupRef.current = null;
            }
            throttledUpdate.current.cancel();
        };
    }, [venue, symbol]);

    return {
        bids,
        asks,
        connected,
        loading,
        error,
    };
}


