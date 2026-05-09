// models/usermodel.js - UPDATED VERSION
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const KYCSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  idType: { type: String, required: true },
  idNumber: { type: String },
  idFrontImage: { type: String, required: true },
  idBackImage: { type: String },
  submittedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, unique: true, sparse: true },
    telegramId: { type: String, unique: true, sparse: true },

    name: { type: String, required: true },
    userName: { type: String },
    email: { type: String, required: true, unique: true },
    avatar: { type: String },
    password: { type: String },
    isPasswordSet: { type: Boolean, default: false },
    
    verifyOtp: { type: String, default: "" },
    verifyOtpExpireAt: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },

    // KYC
    kycStatus: {
      type: String,
      enum: ["not_submitted", "pending", "under_review", "approved", "rejected"],
      default: "not_submitted",
    },
    kyc: {
      type: KYCSchema,
      default: null,
    },
    isKyc: { type: Boolean, default: false },
    
    resetOtp: { type: String, default: "" },
    resetOtpExpireAt: { type: Number, default: 0 },

    role: { type: String, enum: ["user", "admin"], default: "user" },

    // Wallet / Balance - FIXED STRUCTURE
    wallet: {
      usdt: { type: Number, default: 0, min: 0 }, // Added min validation
      btc: { type: Number, default: 0, min: 0 },
      eth: { type: Number, default: 0, min: 0 },
      loanUsdt: { type: Number, default: 0, min: 0 },
    },

    loanUsdt: { type: Number, default: 0 },
    loanStatus: {
      type: String,
      enum: ["no_active_loan", "active", "overdue", 'pending'],
      default: "no_active_loan"
    },

    isBlocked: { type: Boolean, default: false },
    forceWin: { type: Boolean, default: false },
    
    totalTrades: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 },
    totalLoss: { type: Number, default: 0 },
    winningTrades: { type: Number, default: 0 }, // Added missing field
    losingTrades: { type: Number, default: 0 },  // Added missing field

    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add virtual for net worth
/*
userSchema.virtual('netWorth').get(function() {
  return this.wallet.usdt + (this.wallet.btc * 50000) + (this.wallet.eth * 3000);
});
*/

// Add method to safely update balance
userSchema.methods.updateBalance = async function(amount, operation = 'add') {
  if (operation === 'add') {
    this.wallet.usdt += amount;
  } else if (operation === 'subtract') {
    if (this.wallet.usdt < amount) {
      throw new Error('Insufficient balance');
    }
    this.wallet.usdt -= amount;
  }
  return await this.save();
};

// Static method for atomic balance update
userSchema.statics.addToBalance = async function(userId, amount) {
  return await this.findOneAndUpdate(
    { _id: userId },
    { $inc: { "wallet.usdt": amount } },
    { new: true, runValidators: true }
  );
};

userSchema.statics.subtractFromBalance = async function(userId, amount) {
  return await this.findOneAndUpdate(
    { _id: userId, "wallet.usdt": { $gte: amount } },
    { $inc: { "wallet.usdt": -amount } },
    { new: true, runValidators: true }
  );
};

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;