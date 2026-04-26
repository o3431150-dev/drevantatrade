import { useState, useEffect } from "react";
import { Eye, EyeOff, RefreshCw, Wallet } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function TotalBalanceComponent() {
  const { backendUrl, token } = useAuth();
  const [showBalance, setShowBalance] = useState(false);
  const [loading, setLoading] = useState(false);
  const [walletData, setWalletData] = useState({
    usdt: 0,
    btc: 0,
    eth: 0,
    loanUsdt: 0
  });
  const [marketPrices, setMarketPrices] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch market prices
  const getMarketPrices = async () => {
    try {
      const response = await axios.get(`${backendUrl}api/conversions/prices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setMarketPrices(response.data.data);
        setLastUpdated(response.data.timestamp);
      }
    } catch (error) {
      console.error('Error getting prices:', error);
    }
  };

  // Fetch wallet data
  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setWalletData(res.data.user.wallet);
      }
    } catch (error) {
      console.error("Wallet fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total balance
  const calculateTotalBalance = () => {
    const usdtValue = walletData.usdt || 0;
    const btcPrice = marketPrices?.BTC?.price || 0;
    const btcValue = (walletData.btc || 0) * btcPrice;
    const ethPrice = marketPrices?.ETH?.price || 0;
    const ethValue = (walletData.eth || 0) * ethPrice;
    const loanUsdtValue = walletData.loanUsdt || 0;
    
    return usdtValue + btcValue + ethValue + loanUsdtValue;
  };

  // Calculate 24h change
  const calculateTotalChange = () => {
    const btcChange = marketPrices?.BTC?.change24h || 0;
    const ethChange = marketPrices?.ETH?.change24h || 0;
    
    const totalBalance = calculateTotalBalance();
    if (totalBalance === 0) return 0;
    
    const btcBalance = (walletData.btc || 0) * (marketPrices?.BTC?.price || 0);
    const ethBalance = (walletData.eth || 0) * (marketPrices?.ETH?.price || 0);
    const usdtBalance = walletData.usdt || 0;
    
    const weightedChange = (
      (btcBalance * btcChange) +
      (ethBalance * ethChange) +
      (usdtBalance * 0)
    ) / totalBalance;
    
    return weightedChange;
  };

  useEffect(() => {
    fetchWallet();
    getMarketPrices();
    
    const intervalId = setInterval(() => {
      getMarketPrices();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const totalBalance = calculateTotalBalance();
  const totalChange = calculateTotalChange();
  const totalChangeAmount = (totalBalance * totalChange) / 100;

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const updated = new Date(timestamp);
    const diffInSeconds = Math.floor((now - updated) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-32 mb-4"></div>
        <div className="h-8 bg-gray-700 rounded w-48"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet size={20} className="text-green-400" />
          <h3 className="text-sm font-medium text-gray-400">Total Balance</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Updated {formatTimeAgo(lastUpdated)}
            </span>
          )}
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            onClick={() => {
              fetchWallet();
              getMarketPrices();
            }}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw size={16} className="text-gray-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Balance Amount */}
      <div className="mb-3">
        <p className="text-3xl font-bold text-white">
          {showBalance 
            ? `$${totalBalance.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}`
            : "••••••"
          }
        </p>
      </div>

      {/* 24h Change */}
      {showBalance && marketPrices && totalChange !== 0 && (
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${totalChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
          </span>
          <span className={`text-sm ${totalChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalChange >= 0 ? '+' : ''}${Math.abs(totalChangeAmount).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
          <span className="text-gray-500 text-sm">(24h)</span>
        </div>
      )}

      {/* Asset Breakdown */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">USDT</span>
            <span className="text-white font-medium">
              {showBalance 
                ? `$${(walletData.usdt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "••••"
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">BTC</span>
            <span className="text-white font-medium">
              {showBalance 
                ? `$${((walletData.btc || 0) * (marketPrices?.BTC?.price || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "••••"
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">ETH</span>
            <span className="text-white font-medium">
              {showBalance 
                ? `$${((walletData.eth || 0) * (marketPrices?.ETH?.price || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "••••"
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}