import bitcoin from './bitcoin.svg';
import ethereum from './ethereum.svg';
import xrp from './xrp.svg';
import binance from './binance.svg';
import usdc from './usdc.svg';
import solana from './solana.svg';
import dogs from './dogs.svg';
import cardano from './cardano.svg';
import polkadot from './polkadot.svg';
import tether from './tether.svg';
import google from './google.png';
import telegram from './telegram.png';
import hero from './hero.jpg';
import hero1 from './hero1.jpg';
import hero2 from './hero2.jpg';
import logo from './logo.png';

// REMOTE ASSETS (Migrated to CryptoLogos where available)
const remoteIcons = {
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

// EXPORT COMBINED ASSETS
export const assets = {
    logo,
    hero,
    hero1,
    hero2,
    google,
    telegram,

    bitcoin,
    ethereum,
    solana,
    cardano,
    polkadot,
    tether,
    usdc,
    
    binancecoin: binance,
    ripple: xrp,
    xrp,
    binance,
    dogs,

    ...remoteIcons
};