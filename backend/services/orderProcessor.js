import cron from 'node-cron';
import Order from '../models/Order.js';

class OrderProcessor {
  constructor() {
    this.isProcessing = false;
    this.priceFeedService = null;
  }

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
        console.log(`[Processor] Processing batch of ${expiredOrders.length} expired orders.`);

        for (const order of expiredOrders) {
          try {
            let currentMarketPrice = order.entryPrice; 

            if (this.priceFeedService && typeof this.priceFeedService.getPrices === 'function') {
              const allPrices = this.priceFeedService.getPrices();
              const livePriceData = allPrices ? allPrices[order.symbol] : null;

              if (livePriceData) {
                const targetPrice = typeof livePriceData === 'object' ? livePriceData.price : livePriceData;
                if (targetPrice && !isNaN(parseFloat(targetPrice))) {
                  currentMarketPrice = parseFloat(targetPrice);
                }
              }
            }

            console.log(`[Processor] Resolving ${order.isDemo ? 'DEMO' : 'LIVE'} trade reference: ${order._id}. Market Exit Price: ${currentMarketPrice}`);
            await order.completeOrder(currentMarketPrice);

          } catch (orderError) {
            console.error(`[Processor] Settlement exception caught on order ${order._id}:`, orderError.message);
          }
        }
      }
    } catch (error) {
      console.error('Error within database query process execution loop:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  startAutoProcessor() {
    // Polls database collections every 10 seconds securely
    cron.schedule('*/10 * * * * *', () => {
      this.processExpiredOrders();
    });
    console.log('🚀 Order processor background cron engine initialized.');
  }
}

export const orderProcessor = new OrderProcessor();