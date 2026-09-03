import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Coins, 
  Globe2, 
  Flame,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowUpRight,
  RefreshCw
} from "lucide-react";

import { usePriceFeed } from "../context/PriceFeedContext";

// Asset icons mapping
const marketIcons = {
  // Crypto
  bitcoin: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/btc.png",
  ethereum: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png",
  solana: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/sol.png",
  binancecoin: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bnb.png",
  cardano: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/ada.png",
  ripple: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/xrp.png",
  dogecoin: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/doge.png",
  chainlink: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/link.png",
  polkadot: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/dot.png",
  
  // Forex (using country flags)
  eur_usd: "https://s3-symbol-logo.tradingview.com/country/EU.svg",
  gbp_usd: "https://s3-symbol-logo.tradingview.com/country/GB.svg",
  usd_jpy: "https://s3-symbol-logo.tradingview.com/country/JP.svg",
  aud_usd: "https://s3-symbol-logo.tradingview.com/country/AU.svg",
  usd_chf: "https://s3-symbol-logo.tradingview.com/country/CH.svg",
  usd_cad: "https://s3-symbol-logo.tradingview.com/country/CA.svg",
  
  // Commodities
  gold: "https://s3-symbol-logo.tradingview.com/metal/gold.svg",
  silver: "https://s3-symbol-logo.tradingview.com/metal/silver.svg",
  crude_oil: "https://s3-symbol-logo.tradingview.com/crude-oil.svg",
  brent_oil: "https://s3-symbol-logo.tradingview.com/crude-oil.svg",
};

const ASSET_CATEGORIES = [
 /* {
    id: "crypto",
    label: "Crypto",
    icon: Coins,
    items: [
      { id: "bitcoin", name: "Bitcoin", symbol: "BTC", defaultPrice: 68420.50, defaultChange: 3.42, path: "bitcoin" },
      { id: "ethereum", name: "Ethereum", symbol: "ETH", defaultPrice: 3512.10, defaultChange: 2.15, path: "ethereum" },
      { id: "solana", name: "Solana", symbol: "SOL", defaultPrice: 148.80, defaultChange: -1.05, path: "solana" },
      { id: "binancecoin", name: "BNB", symbol: "BNB", defaultPrice: 582.30, defaultChange: 0.88, path: "binancecoin" },
    ],
  },*/
  {
    id: "forex",
    label: "Forex",
    icon: Globe2,
    items: [
      { id: "eur_usd", name: "EUR/USD", symbol: "Euro", defaultPrice: 1.0854, defaultChange: 0.18, path: "eur_usd" },
      { id: "gbp_usd", name: "GBP/USD", symbol: "Pound", defaultPrice: 1.2712, defaultChange: 0.32, path: "gbp_usd" },
      { id: "usd_jpy", name: "USD/JPY", symbol: "Yen", defaultPrice: 155.40, defaultChange: -0.45, path: "usd_jpy" },
     { id: "aud_usd", name: "AUD/USD", symbol: "Aussie", defaultPrice: 0.6625, defaultChange: 0.12, path: "aud_usd" },
    ],
  },
  {
    id: "commodities",
    label: "Commodities",
    icon: Flame,
    items: [
      { id: "gold", name: "Gold", symbol: "XAU", defaultPrice: 2342.10, defaultChange: 1.24, path: "gold" },
      { id: "silver", name: "Silver", symbol: "XAG", defaultPrice: 30.85, defaultChange: 2.60, path: "silver" },
      { id: "crude_oil", name: "Crude Oil", symbol: "WTI", defaultPrice: 78.40, defaultChange: -0.82, path: "crude_oil" },
      { id: "brent_oil", name: "Brent", symbol: "BRENT", defaultPrice: 82.15, defaultChange: -0.65, path: "brent_oil" },
    ],
  },
];

const HighlightsSection = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("forex");
  const [imgErrors, setImgErrors] = useState({});

  const { prices, refreshPrices, isLoading } = usePriceFeed() || { prices: {}, isLoading: false };

  const activeCategory = ASSET_CATEGORIES.find((cat) => cat.id === activeTab);

  const formatPrice = (price) => {
    if (typeof price !== "number") return price;
    if (price >= 1000) {
      return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (price >= 1) {
      return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
    } else {
      return `$${price.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
    }
  };

  const handleImageError = (id) => {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  };

  return (
    <section className="py-16 sm:py-20 bg-transparent relative overflow-hidden">
      {/* Subtle green glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            {/* <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Market Highlights
            </h2> */}
            {/* <p className="mt-1 text-sm text-gray-400">
              Live prices across all markets
            </p> */}
          </div>
          
          <div className="flex items-center gap-3">
            {refreshPrices && (
              <button
                onClick={refreshPrices}
                className="p-2 text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded-lg transition-colors"
                title="Refresh prices"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-green-400" : ""}`} />
              </button>
            )}
            <button
              onClick={() => navigate("/markets")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6">
          <div className="inline-flex items-center gap-1 bg-gray-900 p-1 rounded-lg border border-gray-800">
            {ASSET_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? "bg-green-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Asset Cards Grid - Showing only 4 items per category */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {activeCategory?.items.map((item, index) => {
              const contextAsset = prices?.[item.id] || prices?.[item.path] || {};
              const livePrice = contextAsset.price ?? contextAsset.usd ?? item.defaultPrice;
              const liveChange = contextAsset.change ?? contextAsset.usd_24h_change ?? item.defaultChange;
              const isPositive = liveChange >= 0;
              const iconUrl = marketIcons[item.id];
              const hasImageError = imgErrors[item.id];

              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2, borderColor: "rgba(59, 130, 246, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/coin/${item.path}`)}
                  className="relative text-left bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-green-500/50 rounded-xl p-4 transition-all duration-200 group overflow-hidden"
                >
                  {/* Hover gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-600/0 to-green-600/0 group-hover:from-green-600/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
                  
                  {/* Icon and Name */}
                  <div className="relative flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 group-hover:border-green-500/30 flex items-center justify-center overflow-hidden flex-shrink-0 transition-colors">
                      {iconUrl && !hasImageError ? (
                        <img 
                          src={iconUrl} 
                          alt={item.name}
                          onError={() => handleImageError(item.id)}
                          className="w-full h-full object-contain p-1.5"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-sm font-bold text-gray-500">
                          {item.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-white truncate group-hover:text-green-400 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {item.symbol}
                      </p>
                    </div>
                  </div>

                  {/* Price and Change */}
                  <div className="relative flex items-center justify-between">
                    <span className="text-base font-semibold text-white font-mono">
                      {formatPrice(livePrice)}
                    </span>
                    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                      isPositive
                        ? "text-green-400"
                        : "text-red-400"
                    }`}>
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {isPositive ? "+" : ""}{Number(liveChange).toFixed(2)}%
                    </span>
                  </div>

                  {/* Arrow indicator on hover */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4 text-green-400" />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <div className="mt-18 flex justify-center">
          <button
            onClick={() => navigate("/markets")}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            Explore All Markets
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HighlightsSection;