import mongoose from "mongoose";
import userModel from "./usermodel.js";

const durationRates = {
  30: 12,  
  50: 12,
  60: 18,  
  90: 20, 
  120: 22, 
  180: 25, 
  240: 28, 
  365: 30   
};

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    symbol: {
      type: String,
      required: true,
      trim: true
    },
    symbolName: {
      type: String,
      required: true
    },
    coinId: {
      type: String,
      required: true
    },
    direction: {
      type: String,
      enum: ['buy', 'sell'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 100  
    },
    leverage: {
      type: Number,
      default: 1,
      min: 1,
      max: 20
    },
    entryPrice: {
      type: Number,
      required: true
    },
    exitPrice: {
      type: Number
    },
    duration: {
      type: Number,
      enum: [30, 50, 60, 90, 120, 180, 240, 365],
      required: true
    },
    startTime: {
      type: Date,
      index: true
    },
    endTime: {
      type: Date,
      index: true
    },
    completedAt: {
      type: Date
    },
    expectedReturn: {
      type: Number
    },
    fee: {
      type: Number,
      required: true,
      default: 0
    },
    totalPayout: {
      type: Number
    },
    actualPayout: {
      type: Number
    },
    profit: {
      type: Number,
      default: 0
    },
    profitPercentage: {
      type: Number,
      default: 0
    },
    wasForceWin: {
      type: Boolean,
      default: false
    },
    wasRandomLose: {
      type: Boolean,
      default: false
    },
    randomLossPercentage: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled', 'expired'],
      default: 'pending',
      index: true
    },
    result: {
      type: String,
      enum: ['win', 'loss', 'break_even', null],
      default: null
    },
    description: {
      type: String,
      trim: true
    },
    isLive: {
      type: Boolean,
      default: true
    },
    orderType: {
      type: String,
      enum: ['time_based', 'manual'],
      default: 'time_based'
    },
    cancelledAt: {
      type: Date
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancellationReason: {
      type: String
    },
    isDemo: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ user: 1, completedAt: -1 });
orderSchema.index({ status: 1, endTime: 1 });

// Pre-save middleware
orderSchema.pre('save', async function (next) {
  if (typeof next !== 'function') {
    await this.preSaveLogic();
    return;
  }
  try {
    await this.preSaveLogic();
    next();
  } catch (error) {
    console.error('Error in order pre-save middleware:', error);
    next(error);
  }
});

orderSchema.methods.preSaveLogic = async function () {
  if (this.isNew) {
    const rate = durationRates[this.duration] || 12;
    this.expectedReturn = this.amount * (rate / 100);
    this.fee = this.amount * 0.02;
    this.totalPayout = this.amount + this.expectedReturn - this.fee;
    
    if (!this.startTime) this.startTime = new Date();
    if (!this.endTime) {
      const endTime = new Date(this.startTime);
      endTime.setSeconds(endTime.getSeconds() + this.duration);
      this.endTime = endTime;
    }
    if (!this.description) {
      this.description = `${this.direction.toUpperCase()} ${this.symbol} for ${this.duration}s`;
    }
    if (!this.status) {
      this.status = 'active';
    }
  }

  if (this.exitPrice && this.isModified('exitPrice')) {
    await this.calculateProfitLoss();
  }

  if (this.status === 'active' && this.endTime && this.endTime < new Date()) {
    this.status = 'expired';
    this.isLive = false;
  }
};

// Fixed P&L Method: Prevents compounding math bugs
orderSchema.methods.calculateProfitLoss = async function () {
  if (!this.exitPrice || !this.entryPrice) return null;

  try {
    const user = await userModel.findById(this.user);
    if (!user) throw new Error('User not found');

    const rateP = durationRates[this.duration] || 12;
    let percentage = 0;

    if (user.forceWin) {
      this.wasForceWin = true;
      percentage = rateP * this.leverage;
    } else {
     // this.wasRandomLose = true;
      this.randomLossPercentage = rateP;
      percentage = -rateP * this.leverage;
    }

    this.profitPercentage = parseFloat(percentage.toFixed(2));
    this.profit = Number(((this.amount * percentage) / 100).toFixed(2));
    
    // Core Fix: Payout calculation relies strictly on (Capital + Net Profit/Loss)
    this.actualPayout = Number((this.amount + this.profit).toFixed(2));
    if (this.actualPayout < 0) this.actualPayout = 0;

    if (this.profit > 0) {
      this.result = 'win';
    } else if (this.profit < 0) {
      this.result = 'loss';
    } else {
      this.result = 'break_even';
    }

    return {
      profit: this.profit,
      profitPercentage: this.profitPercentage,
      actualPayout: this.actualPayout,
      result: this.result
    };
  } catch (error) {
    console.error('Error calculating profit/loss:', error);
    throw error;
  }
};

// Fixed Execution Method: Handles cluster matching and strict type guards
orderSchema.methods.completeOrder = async function (exitPrice) {
  try {
    this.exitPrice = exitPrice;
    await this.calculateProfitLoss();
    
    this.status = 'completed';
    this.completedAt = new Date();
    this.isLive = false;
    this.markModified('status');

    await this.save();

    const targetUserId = mongoose.Types.ObjectId.isValid(this.user) 
      ? new mongoose.Types.ObjectId(this.user.toString()) 
      : this.user;

    const safePayout = Number(Number(this.actualPayout || 0).toFixed(2));
    const safeProfit = this.profit > 0 ? Number(this.profit.toFixed(2)) : 0;
    const safeLoss = this.profit < 0 ? Number(Math.abs(this.profit).toFixed(2)) : 0;

    const updateOperation = {
      $inc: {
        "totalTrades": 1,
        "totalProfit": safeProfit,
        "totalLoss": safeLoss,
        "winningTrades": this.profit > 0 ? 1 : 0, // Fixed validation check
        "losingTrades": this.profit < 0 ? 1 : 0
      }
    };

    if (this.isDemo === true) {
      updateOperation.$inc["demoBalance"] = safePayout;
    } else {
      updateOperation.$inc["wallet.usdt"] = safePayout;
    }

    const updatedUser = await userModel.findOneAndUpdate(
      { _id: targetUserId },
      updateOperation,
      { new: true, runValidators: false }
    );

    if (!updatedUser) {
      console.error(`❌ CRITICAL PRODUCTION LOOKUP FAILED FOR USER ID: ${this.user}`);
      throw new Error('User document missing during order settlement processing');
    }

    const finalBalance = this.isDemo === true 
      ? (updatedUser.demoBalance ?? 0)
      : (updatedUser.wallet?.usdt ?? 0);

    console.log(`👌👌👌 Live Balance Sync Successful [${this.isDemo ? 'DEMO' : 'LIVE'}]:`, {
      userId: this.user,
      newBalance: finalBalance,
      payoutAdded: safePayout
    });

    try {
      await this.createTransaction();
    } catch (txError) {
      console.error('Non-blocking transaction tracking failure:', txError.message);
    }

    return {
      order: this,
      userBalance: finalBalance,
      profit: this.profit,
      actualPayout: safePayout
    };

  } catch (error) {
    console.error('CRITICAL: Complete Order Finalization Failed:', error);
    throw error;
  }
};

orderSchema.methods.createTransaction = async function () {
  try {
    const Transaction = mongoose.model('Transaction');
    const transaction = new Transaction({
      user: this.user,
      type: 'trade_payout',
      asset: 'USDT',
      amount: this.actualPayout,
      fee: 0,
      netAmount: this.actualPayout,
      order: this._id,
      status: 'completed',
      description: `Trade payout for ${this.symbol} ${this.direction} order`
    });
    await transaction.save();
    return transaction;
  } catch (error) {
    console.error('Error creating transaction entry:', error);
  }
};

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;