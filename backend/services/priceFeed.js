import WebSocket from "ws";

class PriceFeedService {
  constructor(io) {
    this.io = io;
    this.binanceWS = null;
    this.formatted = {};
    this.isConnected = false;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000;
    this.pingInterval = null; 
    this.lastLogTime = 0; // To throttle logs

    this.tracked = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "DOGEUSDT", "ADAUSDT", "XRPUSDT", "DOTUSDT"];
    this.mapName = {
      BTCUSDT: "bitcoin", ETHUSDT: "ethereum", SOLUSDT: "solana",
      BNBUSDT: "binancecoin", DOGEUSDT: "dogecoin", ADAUSDT: "cardano",
      XRPUSDT: "ripple", DOTUSDT: "polkadot"
    };

    this.connectToBinance();
  }

  connectToBinance() {
    // Clean up existing resources before starting a new one
    this.cleanup();

    const streams = this.tracked.map(s => `${s.toLowerCase()}@ticker`).join("/");
    const BINANCE_STREAM = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    console.log("📡 Attempting connection to Binance...");

    this.binanceWS = new WebSocket(BINANCE_STREAM);

    this.binanceWS.on("open", () => {
      console.log("✅ [Binance] Connected. Logs throttled to 10s to save CPU.");
      this.isConnected = true;
      this.retryCount = 0;
      
      // Start ping only AFTER successful open
      this.pingInterval = setInterval(() => {
        if (this.binanceWS?.readyState === WebSocket.OPEN) {
          this.binanceWS.ping();
        }
      }, 30000); // Ping every 30s instead of 3 mins
    });

    this.binanceWS.on("message", (rawData) => {
      this.handlePriceUpdate(rawData);
    });

    this.binanceWS.on("error", (err) => {
      console.error("❌ [Binance] Error:", err.message);
    });

    this.binanceWS.on("close", () => {
      this.isConnected = false;
      this.scheduleReconnect();
    });
  }

  handlePriceUpdate(rawData) {
    try {
      const parsed = JSON.parse(rawData);
      const coin = parsed.data;
      if (!coin) return;

      const symbolKey = this.mapName[coin.s];
      if (!symbolKey) return;

      const current = parseFloat(coin.c);
      const open = parseFloat(coin.o);

      this.formatted[symbolKey] = {
        symbol: coin.s,
        name: symbolKey,
        usd: current,
        usd_24h_high: parseFloat(coin.h),
        usd_24h_low: parseFloat(coin.l),
        usd_24h_volume: parseFloat(coin.v),
        usd_24h_change: Number((((current - open) / open) * 100).toFixed(2)),
        last_updated: Date.now()
      };

      // THROTTLE LOGGING: Only log once every 10 seconds so your terminal doesn't crash
      const now = Date.now();
      {/*
        if (now - this.lastLogTime > 10000) {
        console.log(`📊 Heartbeat: BTC is at $${this.formatted['bitcoin']?.usd}`);
        this.lastLogTime = now;
      }
        
       */}

      if (this.io) {
        this.io.emit("priceUpdate", this.formatted);
      }
    } catch (error) {
      // Quietly handle errors to avoid terminal spam
    }
  }

  scheduleReconnect() {
    this.cleanup(); // Stop intervals and kill socket
    if (this.retryCount >= this.maxRetries) {
      console.log("🛑 Max retries reached. Stopping.");
      return;
    }
    this.retryCount++;
    console.log(`🔄 Reconnecting in ${this.retryDelay / 1000}s...`);
    setTimeout(() => this.connectToBinance(), this.retryDelay);
  }

  cleanup() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.binanceWS) {
      this.binanceWS.removeAllListeners();
      this.binanceWS.terminate();
      this.binanceWS = null;
    }
  }

  disconnect() {
    this.cleanup();
    console.log("🔌 Manually disconnected.");
  }

  getPrices() { return this.formatted; }
}

export default PriceFeedService;