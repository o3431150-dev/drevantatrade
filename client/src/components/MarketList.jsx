// src/components/MarketList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import MarketCard from './MarketCard';
import { useNavigate } from 'react-router-dom';
import { usePriceFeed } from '../context/PriceFeedContext';
import {
    BarChart3,
    Bitcoin,
    Gem,
    CircleDollarSign,
    Search,
    Activity,
    Lock
} from 'lucide-react';

const marketDataConfig = {
    stocks: {
        title: "Global Equities",
        icon: BarChart3,
        color: "from-indigo-500 to-purple-500",
        data: [
            { id: 1, name: "apple", symbol: "AAPL", price: 0, change: 0, volume: "" },
            { id: 2, name: "microsoft", symbol: "MSFT", price: 0, change: 0, volume: "" },
            { id: 3, name: "google", symbol: "GOOGL", price: 0, change: 0, volume: "" },
            { id: 4, name: "amazon", symbol: "AMZN", price: 0, change: 0, volume: "" },
            { id: 5, name: "tesla", symbol: "TSLA", price: 0, change: 0, volume: "" },
            { id: 6, name: "nvidia", symbol: "NVDA", price: 0, change: 0, volume: "" },
            { id: 7, name: "meta", symbol: "META", price: 0, change: 0, volume: "" },
            { id: 8, name: "jpmorgan", symbol: "JPM", price: 0, change: 0, volume: "" }
        ]
    },
    crypto: {
        title: "Digital Assets",
        icon: Bitcoin,
        color: "from-orange-500 to-yellow-500",
        data: [
            { name: "bitcoin", symbol: "BTC" },
            { name: "ethereum", symbol: "ETH" },
            { name: "solana", symbol: "SOL" },
            { name: "binancecoin", symbol: "BNB" },
            { name: "ripple", symbol: "XRP" },
            { name: "cardano", symbol: "ADA" },
            { name: "dogecoin", symbol: "DOGE" }
        ]
    },
    metals: {
        title: "Commodities",
        icon: Gem,
        color: "from-cyan-500 to-blue-500",
        data: [
            { name: "gold", symbol: "XAU", price: 0, change: 0, volume: "" },
            { name: "silver", symbol: "XAG", price: 0, change: 0, volume: "" },
            { name: "platinum", symbol: "XPT", price: 0, change: 0, volume: "" }
        ]
    },
    forex: {
        title: "Currencies",
        icon: CircleDollarSign,
        color: "from-emerald-500 to-teal-500",
        data: [
            { name: "eur/usd", symbol: "EUR/USD", price: 0, change: 0, volume: "" },
            { name: "gbp/usd", symbol: "GBP/USD", price: 0, change: 0, volume: "" }
        ]
    },
};

const categories = [
    { id: 'crypto', label: 'Crypto', icon: Bitcoin },
    { id: 'stocks', label: 'Stocks', icon: BarChart3 },
    { id: 'metals', label: 'Metals', icon: Gem },
    { id: 'forex', label: 'Forex', icon: CircleDollarSign },
];

const MarketList = () => {
    const [activeCategory, setActiveCategory] = useState('crypto');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { prices } = usePriceFeed();

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 400);
        return () => clearTimeout(timer);
    }, [activeCategory]);

    const currentMarket = marketDataConfig[activeCategory];

    const filteredData = useMemo(() => {
        let baseData = [...(currentMarket?.data || [])];

        if (activeCategory === 'crypto' && prices && Object.keys(prices).length > 0) {
            baseData = baseData.map(asset => {
                const liveInfo = prices[asset.name];
                return {
                    ...asset,
                    price: liveInfo?.usd ?? 0,
                    change: liveInfo?.usd_24h_change ?? 0,
                    volume: liveInfo?.usd_24h_vol ? `$${(liveInfo.usd_24h_vol / 1e9).toFixed(2)}B` : "0"
                };
            });
        }

        if (!searchTerm) return baseData;

        return baseData.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [currentMarket, searchTerm, prices, activeCategory]);

    const handleMarketClick = (market, category) => {
        // Prevent navigation if not crypto
        if (category !== 'crypto') return;
        
        navigate(`/coin/${market.name}`, {
            state: { market, category }
        });
    };

    return (
        <div className="bg-gray-950 min-h-screen text-gray-100 font-sans selection:bg-green-500/30 relative">
            
            {/* COMING SOON OVERLAY - Only shows when not in Crypto */}
            {activeCategory !== 'crypto' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-950/60 backdrop-blur-sm">
                    <div className="max-w-sm w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 text-center shadow-2xl shadow-green-500/10">
                        <div className="w-10 h-10 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-5 h-5 text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold mb-2 capitalize">{activeCategory} Coming Soon</h2>
                        <p className="text-gray-400 mb-8">This market is currently in development. Stick with Crypto for now!</p>
                        <button 
                            onClick={() => setActiveCategory('crypto')}
                            className="w-full py-4 bg-green-500 text-gray-950 font-bold rounded-2xl hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20"
                        >
                            Return to Trading
                        </button>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="sticky top-0 z-20 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50">
                <div className="max-w-2xl mx-auto px-4 py-4 overflow-x-auto hide-scrollbar">
                    <div className="flex gap-2 min-w-max">
                        {categories.map((cat) => {
                            const isActive = activeCategory === cat.id;
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${isActive
                                        ? `bg-green-500 text-gray-950 shadow-lg shadow-green-500/20`
                                        : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-gray-950' : 'text-gray-500'}`} />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className={`max-w-2xl mx-auto px-4 transition-all duration-500 ${activeCategory !== 'crypto' ? 'blur-md grayscale pointer-events-none' : ''}`}>
                <div className="mt-6 mb-2">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                        <input
                            type="text"
                            placeholder={`Find an asset in ${activeCategory}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 text-gray-300 placeholder:text-gray-500 transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between py-6">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${currentMarket.color}`} />
                        <h2 className="text-xl font-bold text-white tracking-tight">
                            {currentMarket.title}
                        </h2>
                    </div>
                </div>

                <div className="pb-32">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-20 bg-gray-900/50 border border-gray-800 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredData.map((item, idx) => (
                                <MarketCard
                                    key={item.symbol || idx}
                                    {...item}
                                    category={activeCategory}
                                    onClick={() => handleMarketClick(item, activeCategory)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                body { background-color: #030712; }
            `}</style>
        </div>
    );
}

export default MarketList;