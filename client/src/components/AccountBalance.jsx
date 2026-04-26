import { useState } from "react";
import { Eye, EyeOff, ArrowUpCircle, ArrowDownCircle, RefreshCw } from "lucide-react";

export default function AccountBalance({ 
  balance = 0,
  showBalance = true,
  onToggleBalance,
  onRefresh,
  loading = false,
  onDeposit,
  onWithdraw
}) {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-gray-400 text-sm">Total Balance</p>
          <p className="text-3xl font-bold text-white mt-1">
            {showBalance ? `$${balance.toLocaleString()}` : "••••••"}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onToggleBalance}
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
          >
            {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <button
          onClick={onDeposit}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 py-2.5 rounded-lg transition font-medium"
        >
          <ArrowDownCircle size={18} />
          Deposit
        </button>
        
        <button
          onClick={onWithdraw}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-2.5 rounded-lg transition font-medium"
        >
          <ArrowUpCircle size={18} />
          Withdraw
        </button>
      </div>
    </div>
  );
}