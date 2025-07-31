// BONUS: Market depth area chart

"use client";

import React from "react";
import { OrderBookLevel } from "@/app/hooks/useOrderBook";

interface DepthChartProps {
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
    width?: number;
    height?: number;
    className?: string;
}

export default function DepthChart({
    bids,
    asks,
    width = 800,
    height = 200,
    className = "",
}: DepthChartProps) {
    const calculateCumulative = (levels: OrderBookLevel[]) => {
        let cumulative = 0;
        return levels.map(([price, size]) => {
            const sizeNum = parseFloat(size);
            cumulative += sizeNum;
            return {
                price: parseFloat(price),
                size: sizeNum,
                cumulative,
            };
        });
    };

    const bidData = calculateCumulative(bids);
    const askData = calculateCumulative(asks);

    const combinedData = [
        ...bidData.map((d) => ({ ...d, isBid: true })),
        ...askData.map((d) => ({ ...d, isBid: false })),
    ];

    const minPrice =
        combinedData.length > 0 ? Math.min(...combinedData.map((d) => d.price)) : 0;
    const maxPrice =
        combinedData.length > 0 ? Math.max(...combinedData.map((d) => d.price)) : 0;
    const maxCumulative =
        combinedData.length > 0
            ? Math.max(...combinedData.map((d) => d.cumulative))
            : 1;

    const padding = 30;
    const scaleX = (price: number) =>
        padding +
        ((price - minPrice) / (maxPrice - minPrice)) * (width - 2 * padding);
    const scaleY = (volume: number) => height - (volume / maxCumulative) * height;

    const generatePathData = (data: typeof bidData, isBid: boolean) => {
        if (data.length === 0) return "";

        let path = `M ${scaleX(data[0].price)} ${scaleY(0)} `;
        path += data
            .map((d) => `L ${scaleX(d.price)} ${scaleY(d.cumulative)}`)
            .join(" ");
        path += ` L ${scaleX(data[data.length - 1].price)} ${scaleY(0)} Z`;

        return path;
    };

    const bidPath = generatePathData(bidData, true);
    const askPath = generatePathData(askData, false);

    const midPrice =
        bidData.length > 0 && askData.length > 0
            ? (bidData[0].price + askData[0].price) / 2
            : null;

    return (
        <div className={`bg-dark rounded-lg p-4 mt-6 ${className}`}>
            <div className="font-sora font-semibold text-[#ffffffcc] mb-4 md:mb-6 text-lg">
                Market Depth
            </div>

            <div className="relative overflow-x-auto">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="w-full h-[200px] sm:h-[250px] md:h-[300px]"
                >
                    <defs>
                        <linearGradient id="bidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#02b95dff" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#02b95dff" stopOpacity="0.1" />
                        </linearGradient>
                        <linearGradient id="askGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#fa3d40ff" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#fa3d40ff" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    <g stroke="#3e3e3e" strokeWidth="0.5" strokeDasharray="2,2">
                        <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} />
                        <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} />
                        <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} />
                    </g>

                    {/* Depth areas */}
                    <path
                        d={bidPath}
                        fill="url(#bidGradient)"
                        stroke="#02b95dff"
                        strokeWidth="1.5"
                    />
                    <path
                        d={askPath}
                        fill="url(#askGradient)"
                        stroke="#fa3d40ff"
                        strokeWidth="1.5"
                    />

                    {/* Mid price line */}
                    {midPrice !== null && (
                        <line
                            x1={scaleX(midPrice)}
                            y1={0}
                            x2={scaleX(midPrice)}
                            y2={height}
                            stroke="#94a3b8"
                            strokeWidth="1.5"
                            strokeDasharray="4,2"
                        />
                    )}

                    {/* X-axis labels */}
                    {bidData.length > 0 && (
                        <text
                            x={scaleX(bidData[0].price)}
                            y={height - 4}
                            fill="#94a3b8"
                            fontSize="10"
                            textAnchor="middle"
                            className="font-sora sm:text-[10px] text-[8px]"
                        >
                            {bidData[0].price.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 4,
                            })}
                        </text>
                    )}

                    {askData.length > 0 && (
                        <text
                            x={scaleX(askData[askData.length - 1].price)}
                            y={height - 4}
                            fill="#94a3b8"
                            fontSize="10"
                            textAnchor="middle"
                            className="font-sora sm:text-[10px] text-[8px]"
                        >
                            {askData[askData.length - 1].price.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 4,
                            })}
                        </text>
                    )}

                    {midPrice !== null &&
                        (() => {
                            const midX = scaleX(midPrice);
                            const bidX = bidData.length > 0 ? scaleX(bidData[0].price) : null;
                            const askX =
                                askData.length > 0
                                    ? scaleX(askData[askData.length - 1].price)
                                    : null;

                            const minDistance = 40;

                            const tooCloseToBid =
                                bidX !== null && Math.abs(midX - bidX) < minDistance;
                            const tooCloseToAsk =
                                askX !== null && Math.abs(midX - askX) < minDistance;

                            if (tooCloseToBid || tooCloseToAsk) return null;

                            return (
                                <text
                                    x={midX}
                                    y={height - 4}
                                    fill="#94a3b8"
                                    fontSize="10"
                                    textAnchor="middle"
                                    className="font-sora sm:text-[10px] text-[8px]"
                                >
                                    {midPrice.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 4,
                                    })}
                                </text>
                            );
                        })()}

                    {/* Y-axis labels */}
                    <text
                        x={10}
                        y={15}
                        fill="#94a3b8"
                        fontSize="10"
                        textAnchor="start"
                        className="font-sora sm:text-[10px] text-[8px]"
                    >
                        {maxCumulative.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                        })}
                    </text>
                    <text
                        x={10}
                        y={height * 0.5 + 5}
                        fill="#94a3b8"
                        fontSize="10"
                        textAnchor="start"
                        className="font-sora sm:text-[10px] text-[8px]"
                    >
                        {(maxCumulative * 0.5).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                        })}
                    </text>
                </svg>

                {/* Legend */}
                <div className="flex justify-center mt-2 space-x-4 font-sora text-sm">
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-400 mr-1 rounded-xl"></div>
                        <span className="text-[#ffffffcc]">Bids</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-400 mr-1 rounded-xl"></div>
                        <span className="text-[#ffffffcc]">Asks</span>
                    </div>
                </div>
            </div>
        </div>
    );
}