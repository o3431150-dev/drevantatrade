// src/components/MarketCard.jsx
import React from 'react';
import { Card } from "./ui/card";
import { motion } from "framer-motion";
import {
    TrendingUp,
    TrendingDown,
    BarChart3,
    Bitcoin,
    Gem,
    CircleDollarSign
} from "lucide-react";

const marketIcons = {
    bitcoin: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    ethereum: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    solana: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
    binancecoin: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2.png",
    ripple: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
    cardano: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
    dogecoin: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
    default: "https://assets.codepen.io/ss/placeholder.svg"
};

export default function MarketCard({ 
    name, 
    symbol, 
    price, 
    change, 
    onClick, 
    category = 'crypto',
    volume,
    strike,
    expiry,
    optionType
}) {
    const changeColor = change > 0 ? "text-emerald-400" : "text-rose-400";
    const changeBg = change > 0 ? "bg-emerald-500/10" : "bg-rose-500/10";
    
    const getIcon = () => {
        const lowerName = name?.toLowerCase() || '';
        if (marketIcons[lowerName]) return marketIcons[lowerName];
        if (category === 'stocks') return BarChart3;
        if (category === 'crypto') return Bitcoin;
        if (category === 'metals') return Gem;
        if (category === 'forex') return CircleDollarSign;
        return marketIcons.default;
    };
    
    const iconResult = getIcon();
    const isImageUrl = typeof iconResult === 'string';
    const IconComponent = !isImageUrl ? iconResult : null;

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl overflow-hidden py-1.5 sm:p-2 max-w-2xl m-auto cursor-pointer"
        >
            <Card className="text-white border border-gray-700/50 bg-gray-900/90 backdrop-blur-sm">
                <div
                    onClick={onClick}
                    className={`px-3 py-3.5 flex items-center justify-between rounded-xl border border-gray-800/20 bg-gray-950 shadow-lg transition-all duration-200 ${name === 'Loading...' ? 'animate-pulse' : 'hover:border-gray-700'}`}
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Simplified Icon Container */}
                        <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center shadow-md flex-shrink-0 ">
                            {isImageUrl ? (
                                <img src={iconResult} alt={name} className="w-8 h-8 object-contain" />
                            ) : IconComponent ? (
                                <IconComponent className="w-5 h-5 text-gray-400" />
                            ) : (
                                <span className="text-white font-bold text-sm">
                                    {symbol?.charAt(0) || name?.charAt(0) || '?'}
                                </span>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="font-semibold text-sm sm:text-base truncate">
                                    {name === 'Loading...' ? (
                                        <span className="text-gray-400">Loading...</span>
                                    ) : (
                                        name?.charAt(0).toUpperCase() + name?.slice(1)
                                    )}
                                </h2>
                                {/* <span className="text-xs text-gray-500 font-mono">{symbol?.toUpperCase()}</span> */}
                                {optionType && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${optionType === 'Call' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                        {optionType}
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                {name !== 'Loading...' && (
                                    <span className="text-base sm:text-lg font-bold text-white">
                                        ${typeof price === 'number' ? price.toLocaleString(undefined, { minimumFractionDigits: price < 1 ? 4 : 2 }) : price}
                                    </span>
                                )}
                                {/* {strike && <span className="text-xs text-gray-400">Strike: ${strike}</span>} */}
                                {expiry && <span className="text-xs text-gray-500">{expiry}</span>}
                            </div>
                            
                            {/* {volume && <p className="text-xs text-gray-500 mt-0.5">Vol: {volume}</p>} */}
                        </div>
                    </div>

                    {change !== undefined && (
                        <div className={`font-semibold ${changeColor} flex items-center gap-1.5 ${changeBg} px-2.5 py-1.5 rounded-lg flex-shrink-0 ml-2`}>
                            {change >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            <span className="text-sm">{change >= 0 ? '+' : ''}{change?.toFixed(2)}%</span>
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}