import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, CircleDollarSign, Gem, Star, Globe } from 'lucide-react';

const marketIcons = {
    // --- Crypto ---
    bitcoin: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/btc.png",
    ethereum: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png",
    solana: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/sol.png",
    binancecoin: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bnb.png",
    dogecoin: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/doge.png",
    cardano: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/ada.png",
    ripple: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/xrp.png",
    polkadot: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/dot.png",
    polygon: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/matic.png",
    avalanche: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/avax.png",
    tron: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/trx.png",
    chainlink: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/link.png",
    near: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/near.png",
    cosmos: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/atom.png",
    aptos: "https://assets.coingecko.com/coins/images/26455/large/aptos_round.png",
    optimism: "https://assets.coingecko.com/coins/images/25244/large/Optimism.png",
    arbitrum: "https://assets.coingecko.com/coins/images/16547/large/arbitrum.png",
    stacks: "https://assets.coingecko.com/coins/images/2069/large/Stacks_logo_full.png",
    sui: "https://assets.coingecko.com/coins/images/26375/large/sui-ocean-square.png",
    fantom: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/ftm.png",
    uniswap: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/uni.png",
    aave: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/aave.png",
    "lido-dao": "https://assets.coingecko.com/coins/images/13573/large/LDO.png",
    maker: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/mkr.png",
    thorchain: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/rune.png",
    pancakeswap: "https://assets.coingecko.com/coins/images/12632/large/pancakeswap-cake-logo_copy.png",
    litecoin: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/ltc.png",
    "bitcoin-cash": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bch.png",
    "shiba-inu": "https://assets.coingecko.com/coins/images/11939/large/shiba.png",
    pepe: "https://assets.coingecko.com/coins/images/29850/large/pepe-token.png",
    dogwifhat: "https://assets.coingecko.com/coins/images/33503/large/dogwifhat.png",
    "fetch-ai": "https://assets.coingecko.com/coins/images/5681/large/Fetch.png",
    render: "https://assets.coingecko.com/coins/images/11636/large/rndr.png",
    celestia: "https://assets.coingecko.com/coins/images/31967/large/tia.png",
    filecoin: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/fil.png",
    "hedera-hashgraph": "https://assets.coingecko.com/coins/images/3688/large/hbar.png",
    vechain: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/vet.png",
    "internet-computer": "https://assets.coingecko.com/coins/images/14495/large/Internet_Computer_logo.png",
    kaspa: "https://assets.coingecko.com/coins/images/25751/large/kaspa-icon300.png",
    "ethereum-classic": "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/etc.png",
    stellar: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/xlm.png",
    algorand: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/algo.png",

    // --- Forex Pairs ---
    eur_usd: "https://s3-symbol-logo.tradingview.com/country/EU.svg",
    gbp_usd: "https://s3-symbol-logo.tradingview.com/country/GB.svg",
    usd_jpy: "https://s3-symbol-logo.tradingview.com/country/JP.svg",
    usd_chf: "https://s3-symbol-logo.tradingview.com/country/CH.svg",
    aud_usd: "https://s3-symbol-logo.tradingview.com/country/AU.svg",
    usd_cad: "https://s3-symbol-logo.tradingview.com/country/CA.svg",
    nzd_usd: "https://s3-symbol-logo.tradingview.com/country/NZ.svg",
    eur_gbp: "https://s3-symbol-logo.tradingview.com/country/EU.svg",
    eur_jpy: "https://s3-symbol-logo.tradingview.com/country/EU.svg",
    gbp_jpy: "https://s3-symbol-logo.tradingview.com/country/GB.svg",
    aud_jpy: "https://s3-symbol-logo.tradingview.com/country/AU.svg",
    eur_aud: "https://s3-symbol-logo.tradingview.com/country/EU.svg",
    chf_jpy: "https://s3-symbol-logo.tradingview.com/country/CH.svg",

    // --- Commodities ---
    gold: "https://s3-symbol-logo.tradingview.com/metal/gold.svg",
    silver: "https://s3-symbol-logo.tradingview.com/metal/silver.svg",
    crude_oil: "https://s3-symbol-logo.tradingview.com/crude-oil.svg",
    brent_oil: "https://s3-symbol-logo.tradingview.com/crude-oil.svg"
};

export default function MarketCard({ 
    name, 
    symbol, 
    price, 
    change, 
    onClick, 
    category = 'crypto',
    isFavorite = false,
    onToggleFavorite
}) {
    const [imgError, setImgError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const isPositive = change >= 0;

    const formattedName = name
        ?.replace(/_/g, ' ')
        ?.split('-')
        ?.map(word => word.charAt(0).toUpperCase() + word.slice(1))
        ?.join(' ');

    const lowerName = name?.toLowerCase() || '';
    const iconUrl = marketIcons[lowerName];

    const formatPrice = (price) => {
        if (!price) return '0.00';
        if (price >= 1000) {
            return price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        } else if (price >= 1) {
            return price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4
            });
        } else {
            return price.toLocaleString(undefined, {
                minimumFractionDigits: 4,
                maximumFractionDigits: 6
            });
        }
    };

    const renderFallbackIcon = () => {
        if (category === 'forex') return <Globe className="w-5 h-5 text-slate-400" />;
        if (category === 'commodities') return <Gem className="w-5 h-5 text-slate-400" />;
        return <span className="text-slate-400 font-semibold text-sm uppercase">{name?.charAt(0)}</span>;
    };

    return (
        <motion.div
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            onClick={onClick}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer"
        >
            <div className="p-4 flex items-center gap-3">
                {/* Icon */}
                <div className="w-12 h-12  rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 ">
                    {iconUrl && !imgError ? (
                        <img 
                            src={iconUrl} 
                            alt={name} 
                            onError={() => setImgError(true)}
                            className="w-full h-full rounded-full object-contain"
                            loading="lazy"
                        />
                    ) : (
                        renderFallbackIcon()
                    )}
                </div>

                {/* Name and Symbol */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {formattedName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {symbol}
                    </p>
                </div>

                {/* Price and Change */}
                <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        ${formatPrice(price)}
                    </p>
                    <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                        isPositive 
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' 
                            : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10'
                    }`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{isPositive ? '+' : ''}{change?.toFixed(2)}%</span>
                    </div>
                </div>

                {/* Favorite Button */}
                {onToggleFavorite && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite();
                        }}
                        className={`ml-1 p-1.5 rounded-lg transition-all ${
                            isFavorite 
                                ? 'text-yellow-500 hover:text-yellow-600' 
                                : 'text-slate-200 hover:text-slate-600 dark:hover:text-slate-300 opacity-40 group-hover:opacity-100'
                        }`}
                    >
                        <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                )}
            </div>
        </motion.div>
    );
}