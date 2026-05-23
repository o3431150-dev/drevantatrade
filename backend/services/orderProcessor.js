import cron from 'node-cron';
import Order from '../models/Order.js';

class OrderProcessor {
  constructor() {
    this.isProcessing = false;
    this.priceFeedService = null; // Will be injected from server.js
  }

  // Inject the live server price feed service
  init(priceFeedServiceInstance) {
    this.priceFeedService = priceFeedServiceInstance;
    this.startAutoProcessor();
  }

  async processExpiredOrders() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    try {
      const expiredOrders = await Order.find({
        status: 'active',
        endTime: { $lte: new Date() }
      });

      if (expiredOrders.length > 0) {
        for (const order of expiredOrders) {
          try {
            // PRODUCTION FIX: Dynamically pull the REAL live market price from your feed!
            let currentMarketPrice = order.entryPrice; // default fallback
            
            if (this.priceFeedService) {
              // Try pulling the asset rate (e.g., "BNBUSDT" or "BTCUSDT")
              const livePriceData = this.priceFeedService.getPrice(order.symbol);
              if (livePriceData && livePriceData.price) {
                currentMarketPrice = parseFloat(livePriceData.price);
              }
            }

            console.log(`[Processor] Finalizing ${order.isDemo ? 'DEMO' : 'LIVE'} order ${order._id}. Passing Live Exit Price: ${currentMarketPrice}`);

            await order.completeOrder(currentMarketPrice);
          } catch (orderError) {
            console.error(`[Processor] Failed resolving order ${order._id}:`, orderError.message);
          }
        }
      }
    } catch (error) {
      console.error('Error in background order processor:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  startAutoProcessor() {
    cron.schedule('*/10 * * * * *', () => {
      this.processExpiredOrders();
    });
    console.log('✅ Order background cron processor bound safely to real-time price feeds.');
  }
}

export const orderProcessor = new OrderProcessor();