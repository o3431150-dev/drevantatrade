// Updated MarketList with adjusted container
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MarketCard from './MarketCard';
import { usePriceFeed } from '../context/PriceFeedContext';
import { Search, Coins, Globe, Gem, X, Star, TrendingUp, ArrowUpDown, ChevronDown } from 'lucide-react';

const marketDataConfig = {
    crypto: {
        title: 'Crypto',
        icon: Coins,
        data: [
            { name: 'bitcoin', symbol: 'BTCUSDT' },
            { name: 'ethereum', symbol: 'ETHUSDT' },
            { name: 'solana', symbol: 'SOLUSDT' },
            { name: 'binancecoin', symbol: 'BNBUSDT' },
            { name: 'dogecoin', symbol: 'DOGEUSDT' },
            { name: 'cardano', symbol: 'ADAUSDT' },
            { name: 'ripple', symbol: 'XRPUSDT' },
            { name: 'polkadot', symbol: 'DOTUSDT' },
            { name: 'polygon', symbol: 'MATICUSDT' },
            { name: 'avalanche', symbol: 'AVAXUSDT' },
            { name: 'tron', symbol: 'TRXUSDT' },
            { name: 'chainlink', symbol: 'LINKUSDT' },
            { name: 'near', symbol: 'NEARUSDT' },
            { name: 'cosmos', symbol: 'ATOMUSDT' },
            { name: 'aptos', symbol: 'APTUSDT' },
            { name: 'optimism', symbol: 'OPUSDT' },
            { name: 'arbitrum', symbol: 'ARBUSDT' },
            { name: 'stacks', symbol: 'STXUSDT' },
            { name: 'sui', symbol: 'SUIUSDT' },
            { name: 'fantom', symbol: 'FTMUSDT' },
            { name: 'uniswap', symbol: 'UNIUSDT' },
            { name: 'aave', symbol: 'AAVEUSDT' },
            { name: 'lido-dao', symbol: 'LDOUSDT' },
            { name: 'maker', symbol: 'MKRUSDT' },
            { name: 'thorchain', symbol: 'RUNEUSDT' },
            { name: 'pancakeswap', symbol: 'CAKEUSDT' },
            { name: 'litecoin', symbol: 'LTCUSDT' },
            { name: 'bitcoin-cash', symbol: 'BCHUSDT' },
            { name: 'shiba-inu', symbol: 'SHIBUSDT' },
            { name: 'pepe', symbol: 'PEPEUSDT' },
            { name: 'dogwifhat', symbol: 'WIFUSDT' },
            { name: 'fetch-ai', symbol: 'FETUSDT' },
            { name: 'render', symbol: 'RNDRUSDT' },
            { name: 'celestia', symbol: 'TIAUSDT' },
            { name: 'filecoin', symbol: 'FILUSDT' },
            { name: 'hedera-hashgraph', symbol: 'HBARUSDT' },
            { name: 'vechain', symbol: 'VETUSDT' },
            { name: 'internet-computer', symbol: 'ICPUSDT' },
            { name: 'kaspa', symbol: 'KASUSDT' },
            { name: 'ethereum-classic', symbol: 'ETCUSDT' },
            { name: 'stellar', symbol: 'XLMUSDT' },
            { name: 'algorand', symbol: 'ALGOUSDT' }
        ]
    },
    forex: {
        title: 'Forex',
        icon: Globe,
        data: [
            { name: 'eur_usd', symbol: 'EUR/USD' },
            { name: 'gbp_usd', symbol: 'GBP/USD' },
            { name: 'usd_jpy', symbol: 'USD/JPY' },
            { name: 'usd_chf', symbol: 'USD/CHF' },
            { name: 'aud_usd', symbol: 'AUD/USD' },
            { name: 'usd_cad', symbol: 'USD/CAD' },
            { name: 'nzd_usd', symbol: 'NZD/USD' },
            { name: 'eur_gbp', symbol: 'EUR/GBP' },
            { name: 'eur_jpy', symbol: 'EUR/JPY' },
            { name: 'gbp_jpy', symbol: 'GBP/JPY' },
            { name: 'aud_jpy', symbol: 'AUD/JPY' },
            { name: 'eur_aud', symbol: 'EUR/AUD' },
            { name: 'chf_jpy', symbol: 'CHF/JPY' }
        ]
    },
    commodities: {
        title: 'Commodities',
        icon: Gem,
        data: [
            { name: 'gold', symbol: 'XAU/USD' },
            { name: 'silver', symbol: 'XAG/USD' },
            { name: 'crude_oil', symbol: 'WTI' },
            { name: 'brent_oil', symbol: 'BRENT' }
        ]
    }
};

export default function MarketList() {
    const navigate = useNavigate();
    const { prices } = usePriceFeed() || { prices: {} };
    const [activeCategory, setActiveCategory] = useState('crypto');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('marketFavorites');
        return saved ? JSON.parse(saved) : [];
    });
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    const getLivePrice = (assetName) => {
        if (!prices) return null;
        if (prices[assetName]) return prices[assetName];
        
        const hyphenated = assetName.replace(/_/g, '-');
        if (prices[hyphenated]) return prices[hyphenated];
        
        const underscored = assetName.replace(/-/g, '_');
        if (prices[underscored]) return prices[underscored];

        return null;
    };

    const toggleFavorite = (assetName) => {
        setFavorites(prev => {
            const newFavorites = prev.includes(assetName)
                ? prev.filter(f => f !== assetName)
                : [...prev, assetName];
            localStorage.setItem('marketFavorites', JSON.stringify(newFavorites));
            return newFavorites;
        });
    };

    const filteredAndSortedData = useMemo(() => {
        const categoryConfig = marketDataConfig[activeCategory];
        if (!categoryConfig || !categoryConfig.data) return [];

        let baseData = categoryConfig.data.map(asset => {
            const live = getLivePrice(asset.name);
            return {
                ...asset,
                price: live?.usd ?? live?.price ?? 0,
                change: live?.usd_24h_change ?? live?.change24h ?? 0,
                isFavorite: favorites.includes(asset.name)
            };
        });

        // Search filter
        if (searchTerm) {
            baseData = baseData.filter(item =>
                item.name.toLowerCase().replace(/_/g, ' ').includes(searchTerm.toLowerCase()) ||
                item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Favorites filter
        if (showOnlyFavorites) {
            baseData = baseData.filter(item => item.isFavorite);
        }

        // Sorting
        baseData.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (sortBy === 'price') {
                comparison = a.price - b.price;
            } else if (sortBy === 'change') {
                comparison = a.change - b.change;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return baseData;
    }, [activeCategory, prices, searchTerm, sortBy, sortOrder, favorites, showOnlyFavorites]);

    const handleSort = (key) => {
        if (sortBy === key) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortOrder(key === 'name' ? 'asc' : 'desc');
        }
        setShowSortDropdown(false);
    };

    const sortOptions = [
        { key: 'name', label: 'Name' },
        { key: 'price', label: 'Price' },
        { key: 'change', label: '24h Change' }
    ];

    return (
        <div className="px-4 py-6 space-y-6">
            {/* Category Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto hide-scrollbar hide-scrollbar::-webkit-scrollbar">
                {Object.entries(marketDataConfig).map(([key, config]) => {
                    const TabIcon = config.icon;
                    const isActive = activeCategory === key;
                    return (
                        <button
                            key={key}
                            onClick={() => {
                              setActiveCategory(key);
                            //  setActiveCategory('crypto')
                         //    key ==='crypto'? true : alert(`We're currently calibrating the ${key} price feeds. Please stick with Crypto for now! Back to Active Assets`)
                                setSearchTerm('');
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px green-500 space-nowrap ${
                                isActive
                                    ? 'border-gray-900 dark:border-green-500  text-gray-900 dark:text-green-500 '
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <TabIcon className="w-4 h-4 hidden sm:block" />
                            <span>{config.title}</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                {config.data.length}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 text-sm bg-green-500  dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-green-500  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 transition-shadow"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex gap-2">
                    {/* Favorites filter */}
                    <button
                        onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                        className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                            showOnlyFavorites
                                ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20'
                                : 'bg-green-500  dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                        <Star className={`w-4 h-4 ${showOnlyFavorites ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">Favorites</span>
                        {favorites.length > 0 && (
                            <span className="text-xs">{favorites.length}</span>
                        )}
                    </button>

                    {/* Sort dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-800 bg-green-500  dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <ArrowUpDown className="w-4 h-4" />
                            <span className="hidden sm:inline">Sort</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {showSortDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="absolute right-0 mt-2 w-40 bg-green-500  dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg overflow-hidden z-50"
                                >
                                    {sortOptions.map(({ key, label }) => (
                                        <button
                                            key={key}
                                            onClick={() => handleSort(key)}
                                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                                                sortBy === key
                                                    ? 'text-gray-900 dark:text-green-500  bg-gray-50 dark:bg-gray-800'
                                                    : 'text-gray-600 dark:text-gray-400'
                                            }`}
                                        >
                                            <span>{label}</span>
                                            {sortBy === key && (
                                                <ArrowUpDown className={`w-3 h-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                                            )}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>
                    {filteredAndSortedData.length} assets
                    {showOnlyFavorites && " • Favorites only"}
                </span>
                {searchTerm && (
                    <span>
                        Results for "{searchTerm}"
                    </span>
                )}
            </div>

            {/* Asset List */}
            <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                    {filteredAndSortedData.length > 0 ? (
                        filteredAndSortedData.map((item) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <MarketCard
                                    name={item.name}
                                    symbol={item.symbol}
                                    price={item.price}
                                    change={item.change}
                                    category={activeCategory}
                                    isFavorite={item.isFavorite}
                                    onToggleFavorite={() => toggleFavorite(item.name)}
                                    onClick={() => navigate(`/coin/${item.name}`)}
                                />
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16"
                        >
                            <p className="text-gray-500 dark:text-gray-400">
                                No assets found
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                Try adjusting your search or filters
                            </p>
                            {(searchTerm || showOnlyFavorites) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setShowOnlyFavorites(false);
                                    }}
                                    className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Clear filters
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}