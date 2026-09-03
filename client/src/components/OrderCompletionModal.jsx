import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, ArrowRightLeft, ShieldAlert, Clock } from 'lucide-react';

const OrderCompletionModal = ({ order, onClose }) => {
  const [localizedDate, setLocalizedDate] = useState('--:--');

    useEffect(() => {
    if (!order) return;
    
    // FORCE the modal to prioritize startTime over completedAt so the minutes match your dashboard card
    const rawTimeField = order.startTime || order.completedAt || order.updatedAt;
    const extractedTarget = rawTimeField?.$date || rawTimeField;
    
    if (extractedTarget) {
      try {
        const dateObj = new Date(extractedTarget);
        const processedDate = isNaN(dateObj.getTime()) ? new Date(Number(extractedTarget)) : dateObj;

        if (!isNaN(processedDate.getTime())) {
          const clientLanguage = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
          const clientSystemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          
          const targetConfiguredFormatting = processedDate.toLocaleString(clientLanguage, {
            timeZone: clientSystemTimezone,
            dateStyle: 'medium', 
            timeStyle: 'short',  
            hourCycle: 'h12'
          });

          setLocalizedDate(targetConfiguredFormatting);
        } else {
          setLocalizedDate('--:--');
        }
      } catch (runtimeError) {
        setLocalizedDate('--:--');
      }
    } else {
      setLocalizedDate('--:--');
    }
  }, [order]);


  if (!order) return null;

  const isWin = order.wasForceWin || order.profit > 0;
  const statusColor = isWin ? 'emerald' : 'rose';

  const amount = parseFloat(order.amount) || 0;
  const cleanEntryPrice = parseFloat(order.entryPrice) || 0;
  let displayExitPrice = parseFloat(order.exitPrice) || cleanEntryPrice;

  if (order.wasForceWin) {
    const deviationPercent = 0.001; 
    if (order.direction === 'buy') {
      displayExitPrice = cleanEntryPrice * (1 + deviationPercent);
    } else if (order.direction === 'sell') {
      displayExitPrice = cleanEntryPrice * (1 - deviationPercent);
    }
  } else {
    const deviationPercent = 0.001;
    if (order.direction === 'buy') {
      displayExitPrice = cleanEntryPrice * (1 - deviationPercent);
    } else if (order.direction === 'sell') {
      displayExitPrice = cleanEntryPrice * (1 + deviationPercent);
    }
  }

  const displayProfit = order.wasForceWin && order.profit <= 0 ? ((amount * (order.expectedReturn || 12)) / 100) : order.profit;
  const payout = order.wasForceWin ? (amount + displayProfit) : order.actualPayout;

  const modalVariants = {
    hidden: {
      opacity: 0,
      y: typeof window !== 'undefined' && window.innerWidth < 640 ? '100%' : 50,
      scale: typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', damping: 28, stiffness: 320 }
    },
    exit: {
      opacity: 0,
      y: typeof window !== 'undefined' && window.innerWidth < 640 ? '100%' : 30,
      scale: typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 0.95,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md">
        <div className={`hidden sm:block absolute w-80 h-80 rounded-full blur-[130px] opacity-25 transition-all duration-500 bg-${statusColor}-500`} />

        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-md overflow-hidden bg-slate-900 sm:rounded-[2.5rem] rounded-t-[2rem] border-t sm:border border-slate-800 shadow-2xl max-h-[96vh] flex flex-col"
        >
          <div className={`h-1.5 w-full flex-shrink-0 ${isWin ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-rose-500 to-red-500'}`} />

          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-500 hover:bg-slate-800 hover:text-white transition-all z-10"
          >
            <X size={18} />
          </button>

          <div className="p-5 overflow-y-auto no-scrollbar hide-scrollbar">
            <div className="flex flex-col items-center text-center mb-6">
              <h2 className="text-xl font-black text-white tracking-tight">
                {isWin ? 'TRADE SUCCESS' : 'TRADE CLOSED'}
              </h2>

              <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-slate-950/40 rounded-full border border-slate-800 text-[11px] sm:text-xs">
                <span className="font-bold text-white font-mono">{order.symbol}</span>
                <span className="w-1 h-1 rounded-full bg-slate-700" />
                <span className={`font-black uppercase ${order.direction === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {order.direction}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-700" />
                <span className="text-slate-400 font-medium tracking-wide flex items-center gap-1">
                  <Clock size={11} /> {order.duration}s
                </span>
              </div>
            </div>

            <div className="mb-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span>Entry Price</span>
                <div className="flex items-center gap-1">
                  <span>Exit Price</span>
                  {order.wasForceWin && <ShieldAlert size={11} className="text-emerald-400" />}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-slate-200 font-mono text-base font-semibold">
                    ${cleanEntryPrice.toFixed(6)}
                  </span>
                </div>

                <ArrowRightLeft size={14} className="text-slate-700 mx-2 flex-shrink-0" />

                <div className="flex flex-col items-end">
                  <span className={`font-mono text-base font-black ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${displayExitPrice.toFixed(6)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="p-3.5 rounded-xl bg-slate-800/20 border border-slate-800/60">
                <span className="text-slate-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block mb-0.5">Amount</span>
                <div className="flex items-center gap-1.5">
                  <Wallet size={12} className="text-slate-400 flex-shrink-0" />
                  <span className="text-white font-mono font-bold text-sm sm:text-base">${amount.toFixed(2)}</span>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border ${isWin ? 'bg-emerald-500/[0.02] border-emerald-500/20' : 'bg-rose-500/[0.02] border-rose-500/20'}`}>
                <span className="text-slate-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block mb-0.5">Net PNL</span>
                <span className={`font-mono text-sm sm:text-base font-black ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isWin ? `+$${Math.abs(displayProfit).toFixed(2)}` : `-$${Math.abs(displayProfit).toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="mb-5 rounded-xl bg-slate-950/20 border border-slate-800 text-xs text-slate-400">
              <div className="flex items-center justify-between p-3 border-b border-slate-800/50">
                <span>Execution Time</span>
                <span className="text-slate-300 font-mono">{localizedDate}</span>
              </div>
              <div className="flex items-center justify-between p-3">
                <span>Total Payout</span>
                <span className={`font-mono font-bold ${isWin ? 'text-emerald-400' : 'text-slate-300'}`}>
                  ${payout.toFixed(2)}
                </span>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrderCompletionModal;
