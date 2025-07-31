// Main simulation form component
// This component handles the order simulation form and its functionality.

'use client';

import { Venue } from './VenueSelector';
import { CustomSelect } from './CustomSelect';
import { useState, useEffect } from 'react';

interface OrderSimulationFormProps {
    venue: Venue;
    symbol: string;
    onVenueChange: (venue: Venue) => void;
    onSymbolChange: (symbol: string) => void;
    onOrderSubmit: (orderData: {
        venue: Venue;
        symbol: string;
        orderType: OrderType;
        side: OrderSide;
        price: string;
        quantity: string;
        delay: OrderDelay;
    }) => void;
}

type OrderType = 'market' | 'limit';
type OrderSide = 'buy' | 'sell';
type OrderDelay = 'immediate' | '5s' | '10s' | '30s';

export default function OrderSimulationForm({
    venue,
    symbol,
    onVenueChange,
    onSymbolChange,
    onOrderSubmit
}: OrderSimulationFormProps) {
    const [orderType, setOrderType] = useState<OrderType>('limit');
    const [side, setSide] = useState<OrderSide>('buy');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [delay, setDelay] = useState<OrderDelay>('immediate');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Validate form inputs
    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
            newErrors.quantity = 'Valid quantity is required';
        }
        if (orderType === 'limit' && (!price || isNaN(Number(price)) || Number(price) <= 0)) {
            newErrors.price = 'Valid price is required for limit orders';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Clear errors when input values change and become valid
    const handlePriceChange = (value: string) => {
        setPrice(value);
        if (errors.price && value && !isNaN(Number(value)) && Number(value) > 0) {
            setErrors(prev => ({ ...prev, price: '' }));
        }
    };

    const handleQuantityChange = (value: string) => {
        setQuantity(value);
        if (errors.quantity && value && !isNaN(Number(value)) && Number(value) > 0) {
            setErrors(prev => ({ ...prev, quantity: '' }));
        }
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        
        const delayMs = delay === 'immediate' ? 0 : 
                        delay === '5s' ? 5000 :
                        delay === '10s' ? 10000 : 30000;

        setTimeout(() => {
            console.log('Order submitted:', {
                venue,
                symbol,
                orderType,
                side,
                price: orderType === 'limit' ? price : 'market',
                quantity,
                delay
            });

            const orderData = {
                venue,
                symbol,
                orderType,
                side,
                price: orderType === 'limit' ? price : '',
                quantity,
                delay
            };

            onOrderSubmit(orderData);
            
            setIsSubmitting(false);
        }, delayMs);
    };

    // Reset price when switching to market order
    useEffect(() => {
        if (orderType === 'market') {
            setPrice('');
            setErrors(prev => ({ ...prev, price: '' }));
        }
    }, [orderType]);

    return (
        <div className="">            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                    {/* Order Type Selector */}
                    <div>
                        <label className="block font-sora font-semibold text-md mb-2 text-[#ffffffcc]">Order Type</label>
                        <CustomSelect<OrderType>
                            options={['limit', 'market']}
                            selectedValue={orderType}
                            onValueChange={setOrderType}
                            renderSelected={(value) => (
                                <span className="capitalize">{value}</span>
                            )}
                            renderOption={(value) => (
                                <span className="capitalize">{value}</span>
                            )}
                        />
                    </div>

                    {/* Side Selector */}
                    <div>
                        <label className="block font-sora font-semibold text-md mb-2 text-[#ffffffcc]">Side</label>
                        <CustomSelect<OrderSide>
                            options={['buy', 'sell']}
                            selectedValue={side}
                            onValueChange={setSide}
                            renderSelected={(value) => (
                                <span className="capitalize">{value}</span>
                            )}
                            renderOption={(value) => (
                                <span className="capitalize">{value}</span>
                            )}
                        />
                    </div>
                </div>

                {/* Price (only for limit orders) */}
                {orderType === 'limit' && (
                    <div>
                        <label className="block font-sora font-semibold text-md mb-2 text-[#ffffffcc]">Price</label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => handlePriceChange(e.target.value)}
                            onWheel={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                (e.target as HTMLInputElement).blur();
                                setTimeout(() => (e.target as HTMLInputElement).focus(), 0);
                            }}
                            placeholder="Enter price"
                            step="0.0001"
                            className="w-full font-sora font-semibold bg-dark border-2 border-[#3e3e3e] rounded-md py-2 px-4 text-[#ffffffcc] focus:outline-none"
                        />
                        {errors.price && <p className="font-innertight mt-1 font-bold text-sm text-red-400">{errors.price}</p>}
                    </div>
                )}

                {/* Quantity */}
                <div>
                    <label className="block font-sora font-semibold text-md mb-2 text-[#ffffffcc]">Quantity</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        onWheel={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            (e.target as HTMLInputElement).blur();
                            setTimeout(() => (e.target as HTMLInputElement).focus(), 0);
                        }}
                        placeholder="Enter quantity"
                        step="0.01"
                        className="w-full font-sora font-semibold bg-dark border-2 border-[#3e3e3e] rounded-md py-2 px-4 text-[#ffffffcc] focus:outline-none"
                    />
                    {errors.quantity && <p className="font-innertight mt-1 font-bold text-sm text-red-400">{errors.quantity}</p>}
                </div>

                {/* Timing Simulation */}
                <div>
                    <label className="block font-sora font-semibold text-md mb-2 text-[#ffffffcc]">Execution Delay</label>
                    <div className="grid grid-cols-4 gap-2">
                        {(['immediate', '5s', '10s', '30s'] as OrderDelay[]).map((delayOption) => (
                            <button
                                key={delayOption}
                                type="button"
                                onClick={() => setDelay(delayOption)}
                                className={`font-innertight py-2 px-3 rounded-lg cursor-pointer text-sm font-bold truncate ${
                                    delay === delayOption
                                        ? 'border-2 border-[#05df72] text-white'
                                        : 'bg-[#0e0e0e] text-gray-300'
                                }`}
                                title={delayOption === 'immediate' ? 'Instant' : delayOption}
                            >
                                {delayOption === 'immediate' ? 'Instant' : delayOption}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`font-sora w-full py-2 px-4 rounded-lg text-[#ffffffcc] border-3 border-[#3e3e3e] font-semibold cursor-pointer ${
                            isSubmitting ? 'bg-[#141414]' : 'bg-[#0e0e0e] hover:bg-[#141414]'
                        }`}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Order'}
                    </button>
                </div>
            </form>
        </div>
    );
}
