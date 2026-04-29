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

// REMOTE ASSETS (Coingecko)
const remoteIcons = {
    tron: "https://assets.coingecko.com/coins/images/1094/small/tron.png",
    polygon: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
    avalanche: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
    near: "https://assets.coingecko.com/coins/images/10365/small/near.png",
    cosmos: "https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png",
    aptos: "https://assets.coingecko.com/coins/images/26455/small/aptos_round.png",
    sui: "https://assets.coingecko.com/coins/images/26375/small/sui_asset.png",
    optimism: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
    arbitrum: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
    fantom: "https://assets.coingecko.com/coins/images/4001/small/Fantom_round.png",
    stacks: "https://assets.coingecko.com/coins/images/2069/small/Stacks_logo_full.png",
    celestia: "https://assets.coingecko.com/coins/images/31967/small/tia.png",
    uniswap: "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png",
    aave: "https://assets.coingecko.com/coins/images/12645/small/AAVE.png",
    chainlink: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
    "lido-dao": "https://assets.coingecko.com/coins/images/13573/small/LDO.png",
    thorchain: "https://assets.coingecko.com/coins/images/6595/small/RUNE.png",
    pancakeswap: "https://assets.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo_copy.png",
    "internet-computer": "https://assets.coingecko.com/coins/images/14495/small/Internet_Computer_logo.png",
    "fetch-ai": "https://assets.coingecko.com/coins/images/5681/small/Fetch.png",
    pepe: "https://assets.coingecko.com/coins/images/31358/small/pepe.png",
    "shiba-inu": "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
    dogwifhat: "https://assets.coingecko.com/coins/images/33503/small/dogwifhat.png",
    litecoin: "https://assets.coingecko.com/coins/images/2/small/litecoin.png",
    "bitcoin-cash": "https://assets.coingecko.com/coins/images/780/small/bitcoin-cash.png",
    "ethereum-classic": "https://assets.coingecko.com/coins/images/453/small/ethereum-classic.png",
    stellar: "https://assets.coingecko.com/coins/images/100/small/stellar.png",
    algorand: "https://assets.coingecko.com/coins/images/4380/small/download.png",
    vechain: "https://assets.coingecko.com/coins/images/1167/small/Vechain-Logo-700x700.png",
    "hedera-hashgraph": "https://assets.coingecko.com/coins/images/3688/small/hbar.png",
    filecoin: "https://assets.coingecko.com/coins/images/12817/small/filecoin.png",
    default: "https://assets.codepen.io/ss/placeholder.svg"
};

// EXPORT COMBINED ASSETS
export const assets = {
    // UI Elements
    logo,
    hero,
    hero1,
    hero2,
    google,
    telegram,

    // Coins (Local Overrides)
    bitcoin,
    ethereum,
    solana,
    cardano,
    polkadot,
    tether,
    usdc,
    
    // Aligned keys for logic consistency
    binancecoin: binance,
    ripple: xrp,
    dogecoin: dogs,
    xrp,
    binance,
    dogs,

    // Spread the remote icons to cover the rest of the list
    ...remoteIcons
};