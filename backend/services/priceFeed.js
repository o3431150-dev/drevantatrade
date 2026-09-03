import WebSocket from "ws";
import YahooFinance from "yahoo-finance2";

// Instantiate yahooFinance instance for node environment
const yahooFinance = new YahooFinance();

class PriceFeedService {
  constructor(io) {
    this.io = io;
    this.binanceWS = null;
    this.yahooInterval = null;
    this.formatted = {};
    this.isConnected = false;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000;
    this.pingInterval = null;

    // -------------------------------------------------------------
    // 1. CRYPTO TRACKED (Binance WebSocket)
    // -------------------------------------------------------------
    this.cryptoTracked = [
      // Original 8
      "BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "DOGEUSDT", "ADAUSDT", "XRPUSDT", "DOTUSDT",
      // Layer 1s & 2s
      "MATICUSDT", "AVAXUSDT", "TRXUSDT", "LINKUSDT", "NEARUSDT", "ATOMUSDT", "APTUSDT", "OPUSDT", "ARBUSDT", "STXUSDT", "SUIUSDT", "FTMUSDT",
      // DeFi & Exchange
      "UNIUSDT", "AAVEUSDT", "LDOUSDT", "MKRUSDT", "RUNEUSDT", "CAKEUSDT",
      // High Volume / Trending
      "LTCUSDT", "BCHUSDT", "SHIBUSDT", "PEPEUSDT", "WIFUSDT", "FETUSDT", "RNDRUSDT", "TIAUSDT", "FILUSDT", "HBARUSDT", "VETUSDT", "ICPUSDT", "KASUSDT",
      // Others
      "ETCUSDT", "XLMUSDT", "ALGOUSDT"
    ];

    // -------------------------------------------------------------
    // 2. FOREX & COMMODITIES TRACKED (Yahoo Finance Polling)
    // -------------------------------------------------------------
    this.yahooTickers = {
      // Forex Majors
      "EURUSD=X": "eur_usd",
      "GBPUSD=X": "gbp_usd",
      "USDJPY=X": "usd_jpy",
      "USDCHF=X": "usd_chf",
      "AUDUSD=X": "aud_usd",
      "USDCAD=X": "usd_cad",
      "NZDUSD=X": "nzd_usd",

      // Forex Crosses
      "EURGBP=X": "eur_gbp",
      "EURJPY=X": "eur_jpy",
      "GBPJPY=X": "gbp_jpy",
      "AUDJPY=X": "aud_jpy",
      "EURAUD=X": "eur_aud",
      "CHFJPY=X": "chf_jpy",

      // Metals & Commodities
      "GC=F": "gold",           // Gold Futures
      "SI=F": "silver",         // Silver Futures
      "CL=F": "crude_oil",      // Crude Oil WTI
      "BZ=F": "brent_oil"       // Brent Crude Oil
    };

    // -------------------------------------------------------------
    // 3. UNIFIED MAP NAME
    // -------------------------------------------------------------
    this.mapName = {
      // Crypto Mappings
      BTCUSDT: "bitcoin", ETHUSDT: "ethereum", SOLUSDT: "solana", BNBUSDT: "binancecoin", 
      DOGEUSDT: "dogecoin", ADAUSDT: "cardano", XRPUSDT: "ripple", DOTUSDT: "polkadot",
      MATICUSDT: "polygon", AVAXUSDT: "avalanche", TRXUSDT: "tron", LINKUSDT: "chainlink", 
      NEARUSDT: "near", ATOMUSDT: "cosmos", APTUSDT: "aptos", OPUSDT: "optimism", 
      ARBUSDT: "arbitrum", STXUSDT: "stacks", SUIUSDT: "sui", FTMUSDT: "fantom",
      UNIUSDT: "uniswap", AAVEUSDT: "aave", LDOUSDT: "lido-dao", MKRUSDT: "maker", 
      RUNEUSDT: "thorchain", CAKEUSDT: "pancakeswap", LTCUSDT: "litecoin", BCHUSDT: "bitcoin-cash", 
      SHIBUSDT: "shiba-inu", PEPEUSDT: "pepe", WIFUSDT: "dogwifhat", FETUSDT: "fetch-ai", 
      RNDRUSDT: "render-token", TIAUSDT: "celestia", FILUSDT: "filecoin", HBARUSDT: "hedera-hashgraph", 
      VETUSDT: "vechain", ICPUSDT: "internet-computer", KASUSDT: "kaspa", ETCUSDT: "ethereum-classic", 
      XLMUSDT: "stellar", ALGOUSDT: "algorand",

      // Forex & Commodity Mappings
      ...this.yahooTickers
    };

    this.init();
  }

  init() {
    this.connectToBinance();
    this.startYahooPolling(5000); // Poll Yahoo Finance every 5 seconds
  }

  // -------------------------------------------------------------
  // BINANCE WEBSOCKET (CRYPTO)
  // -------------------------------------------------------------
  connectToBinance() {
    this.cleanupBinance();

    const streams = this.cryptoTracked.map(s => `${s.toLowerCase()}@ticker`).join("/");
    const BINANCE_STREAM = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    console.log("📡 [Binance] Connecting to Crypto stream...");

    this.binanceWS = new WebSocket(BINANCE_STREAM);

    this.binanceWS.on("open", () => {
      console.log("✅ [Binance] Connected.");
      this.isConnected = true;
      this.retryCount = 0;

      this.pingInterval = setInterval(() => {
        if (this.binanceWS?.readyState === WebSocket.OPEN) {
          this.binanceWS.ping();
        }
      }, 30000);
    });

    this.binanceWS.on("message", (rawData) => {
      this.handleCryptoUpdate(rawData);
    });

    this.binanceWS.on("error", (err) => {
      console.error("❌ [Binance] Error:", err.message);
    });

    this.binanceWS.on("close", () => {
      this.isConnected = false;
      this.scheduleBinanceReconnect();
    });
  }

  handleCryptoUpdate(rawData) {
    try {
      const parsed = JSON.parse(rawData);
      const coin = parsed.data;
      if (!coin) return;

      const symbolKey = this.mapName[coin.s];
      if (!symbolKey) return;

      const current = parseFloat(coin.c);
      const open = parseFloat(coin.o);

      this.updatePriceStore(symbolKey, {
        symbol: coin.s,
        name: symbolKey,
        category: "crypto",
        usd: current,
        usd_24h_high: parseFloat(coin.h),
        usd_24h_low: parseFloat(coin.l),
        usd_24h_volume: parseFloat(coin.v),
        usd_24h_change: Number((((current - open) / open) * 100).toFixed(2)),
        last_updated: Date.now()
      });
    } catch (error) {
      // Suppress parsing errors to avoid terminal spam
    }
  }

  // -------------------------------------------------------------
  // YAHOO FINANCE POLLING (FOREX, GOLD, SILVER, OIL)
  // -------------------------------------------------------------
  startYahooPolling(intervalMs = 5000) {
    console.log(`📡 [Yahoo Finance] Starting Forex/Commodity polling (${intervalMs / 1000}s interval)...`);

    const poll = async () => {
      try {
        const symbols = Object.keys(this.yahooTickers);
        const results = await yahooFinance.quote(symbols);

        results.forEach((item) => {
          const key = this.yahooTickers[item.symbol];
          if (!key) return;

          const current = item.regularMarketPrice;
          const prevClose = item.regularMarketPreviousClose || current;
          const changePercent = prevClose ? ((current - prevClose) / prevClose) * 100 : 0;

          let category = "forex";
          if (["gold", "silver", "crude_oil", "brent_oil"].includes(key)) {
            category = "commodity";
          }

          this.updatePriceStore(key, {
            symbol: item.symbol,
            name: key,
            category: category,
            usd: current,
            usd_24h_high: item.regularMarketDayHigh || null,
            usd_24h_low: item.regularMarketDayLow || null,
            usd_24h_volume: item.regularMarketVolume || null,
            usd_24h_change: Number(changePercent.toFixed(2)),
            last_updated: Date.now()
          });
        });
      } catch (err) {
        console.error("❌ [Yahoo Finance] Polling error:", err.message);
      }
    };

    poll();
    this.yahooInterval = setInterval(poll, intervalMs);
  }

  // -------------------------------------------------------------
  // CENTRAL EMITTER
  // -------------------------------------------------------------
  updatePriceStore(key, payload) {
    this.formatted[key] = payload;

    if (this.io) {
      this.io.emit("priceUpdate", this.formatted);
    }
  }

  scheduleBinanceReconnect() {
    this.cleanupBinance();
    if (this.retryCount >= this.maxRetries) {
      console.log("🛑 [Binance] Max retries reached. Stopping reconnect attempts.");
      return;
    }
    this.retryCount++;
    console.log(`🔄 [Binance] Reconnecting in ${this.retryDelay / 1000}s...`);
    setTimeout(() => this.connectToBinance(), this.retryDelay);
  }

  cleanupBinance() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.binanceWS) {
      this.binanceWS.removeAllListeners();
      this.binanceWS.terminate();
      this.binanceWS = null;
    }
  }

  disconnect() {
    this.cleanupBinance();
    if (this.yahooInterval) clearInterval(this.yahooInterval);
    console.log("🔌 [PriceFeedService] Manually disconnected all feeds.");
  }

  getPrices() {
    return this.formatted;
  }
}

export default PriceFeedService;