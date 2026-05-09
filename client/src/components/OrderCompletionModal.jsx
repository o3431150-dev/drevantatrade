import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, ArrowRight, Wallet } from 'lucide-react';

const OrderCompletionModal = ({ order, onClose }) => {
  if (!order) return null;

  const isWin = order.profit > 0;
  const statusColor = isWin ? 'emerald' : 'rose';

  // Responsive animation variants
  const modalVariants = {
    hidden: { 
      opacity: 0, 
      y: 50, 
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', damping: 25, stiffness: 300 }
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95 
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md">
        {/* Background Glow - Hidden on very small screens to save performance */}
        <div className={`hidden sm:block absolute w-72 h-72 rounded-full blur-[120px] opacity-20 bg-${statusColor}-500`} />
        
        <motion.div 
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-lg sm:max-w-md overflow-hidden bg-slate-900 sm:rounded-[2.5rem] rounded-t-[2rem] border-t sm:border border-slate-700/50 shadow-2xl"
        >
          {/* Progress Indicator */}
          <div className={`h-1.5 w-full ${isWin ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full text-slate-500 hover:bg-slate-800 hover:text-white transition-all z-10"
          >
            <X size={20} />
          </button>

          <div className="p-6 sm:p-10">
            {/* Header Section */}
            <div className="flex flex-col items-center text-center mb-6 sm:mb-10">
              <motion.div 
                initial={{ rotate: -10, scale: 0 }}
                animate={{ rotate: 12, scale: 1 }}
                className={`flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 rounded-2xl sm:rounded-3xl ${isWin ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}
              >
                <div className="-rotate-12">
                  {isWin ? <TrendingUp size={32} className="sm:w-10 sm:h-10" /> : <TrendingDown size={32} className="sm:w-10 sm:h-10" />}
                </div>
              </motion.div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                {isWin ? 'TRADE SUCCESS' : 'TRADE CLOSED'}
              </h2>
              <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50">
                <span className="text-xs sm:text-sm font-bold text--400">{order.pair}</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider">{order.type}</span>
              </div>
            </div>

            {/* Responsive Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              <div className="flex sm:flex-col justify-between sm:justify-start items-center sm:items-start p-4 rounded-2xl bg-slate-800/30 border border-slate-700/20">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Investment</span>
                <div className="flex items-center gap-2">
                  <Wallet size={14} className="text-slate-400" />
                  <span className="text-white font-bold text-lg">${order.amount}</span>
                </div>
              </div>
              
              <div className={`flex sm:flex-col justify-between sm:justify-start items-center sm:items-start p-4 rounded-2xl border ${isWin ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Profit/Loss</span>
                <span className={`text-xl sm:text-2xl font-black ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isWin ? `+$${order.profit}` : `-$${Math.abs(order.profit)}`}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="group w-full py-4 px-6 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-500/20"
            >
              Continue Trading
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrderCompletionModal;