import React, { useEffect } from 'react';
import { TrendingUp, TrendingDown, X, DollarSign, Activity } from 'lucide-react';

const OrderCompleteModal = ({ order, onClose }) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!order) return null;

  const profit = order.profit || 0;
  const isWin = profit > 0;
  const isDraw = profit === 0;
  
  // Calculate percentage return based on investment amount
  const roi = order.amount > 0 ? ((profit / order.amount) * 100).toFixed(2) : "0.00";

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={onClose} // Close when clicking backdrop
    >
      <div 
        className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the modal content
      >
        {/* Top Decorative Bar */}
        <div className={`h-2 w-full ${isWin ? 'bg-emerald-500' : isDraw ? 'bg-slate-500' : 'bg-rose-500'}`} />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {/* Icon Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
              isWin ? 'bg-emerald-500/20 text-emerald-500' : 
              isDraw ? 'bg-slate-500/20 text-slate-400' : 
              'bg-rose-500/20 text-rose-500'
            }`}>
              {isWin ? <TrendingUp size={40} /> : <TrendingDown size={40} />}
            </div>
            
            <h2 className={`text-2xl font-bold ${
              isWin ? 'text-emerald-400' : isDraw ? 'text-slate-300' : 'text-rose-400'
            }`}>
              {isWin ? 'Trade Profit!' : isDraw ? 'Trade Settled' : 'Trade Loss'}
            </h2>
            <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-semibold">
              {order.symbol} • {order.type || 'Market'}
            </p>
          </div>

          {/* Data Grid */}
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <DollarSign size={14} /> <span>Investment</span>
              </div>
              <span className="font-mono font-bold text-white">${order.amount}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Activity size={14} /> <span>Return (ROI)</span>
              </div>
              <span className={`font-mono font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isWin ? '+' : ''}{roi}%
              </span>
            </div>

            <div className="flex flex-col items-center justify-center py-4 border-t border-slate-800 mt-4">
              <span className="text-slate-500 text-xs mb-1 uppercase font-bold">Net Balance Change</span>
              <span className={`text-4xl font-black ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isWin ? '+' : ''}{profit.toFixed(2)}
                <span className="text-lg ml-1 text-slate-400 font-medium">USDT</span>
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full mt-6 bg-white hover:bg-slate-200 text-slate-950 font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-white/5"
          >
            Confirm & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderCompleteModal;