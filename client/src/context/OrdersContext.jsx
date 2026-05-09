// src/context/OrdersContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tradeAPI } from '../services/api';
import { useAuth } from './AuthContext';

const OrdersContext = createContext();

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};

export const OrdersProvider = ({ children }) => {
  const { userData } = useAuth();
  const [lastCompletedOrder, setLastCompletedOrder] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [stats, setStats] = useState({
    totalTrades: 0,
    totalProfit: 0,
    winRate: 0,
    activeOrdersCount: 0,
    walletBalance: 0,
    forceWin: false,
    availableBalance: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load orders on mount and when userData changes
  useEffect(() => {
    if (userData) {
      loadOrders();
      loadStats();
      startAutoRefresh();
    }
    return () => stopAutoRefresh();
  }, [userData]);

  const [refreshInterval, setRefreshInterval] = useState(null);

  const startAutoRefresh = () => {
    if (refreshInterval) clearInterval(refreshInterval);
    const interval = setInterval(() => {
      loadOrders();
    }, 5000);
    setRefreshInterval(interval);
  };

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  };

  const loadOrders = useCallback(async () => {
    if (!userData) return;

    try {
      const [activeResponse, completedResponse] = await Promise.all([
        tradeAPI.getActiveOrders(),
        tradeAPI.getCompletedOrders({ limit: 10 })
      ]);

      setActiveOrders(activeResponse.data?.orders || []);
      setCompletedOrders(completedResponse.data?.orders || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }, [userData]);

  const loadStats = useCallback(async () => {
    if (!userData) return;

    try {
      const [statsResponse, balanceResponse] = await Promise.all([
        ///tradeAPI.getTradingStats(),
        // tradeAPI.getUserBalance()
      ]);

      if (false) {
        setStats({
          totalTrades: statsResponse.data?.trading?.totalTrades || 0,
          totalProfit: statsResponse.data?.trading?.netProfit || 0,
          winRate: statsResponse.data?.trading?.winRate || 0,
          activeOrdersCount: statsResponse.data?.trading?.activeTrades || 0,
          walletBalance: statsResponse.data?.wallet?.usdt || 0,
          forceWin: statsResponse.data?.account?.forceWin || false,
          availableBalance: balanceResponse.data?.availableBalance || 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [userData]);

  const placeOrder = useCallback(async (orderData) => {
    setIsLoading(true);
    try {
      const response = await tradeAPI.placeOrder(orderData);

      if (response.success) {
        await loadOrders();
        await loadStats();
        return response.data;
      }
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadOrders, loadStats]);

  const cancelOrder = useCallback(async (orderId, reason) => {
    try {
      const response = await tradeAPI.cancelOrder(orderId, reason);

      if (response.success) {
        setActiveOrders(prev => prev.filter(order => order._id !== orderId));
        await loadStats();
        return response.data;
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }, [loadStats]);

  // REMOVED TOAST FROM HERE - WebSocket will handle it
  /*
    const handleOrderComplete = useCallback(async (orderId, finalPrice) => {
 
     await loadOrders();
 
     await loadStats();
 
   }, [loadOrders, loadStats]);
  */



// 1. Add a "processedOrders" ref to track what we've already shown
const processedOrders = React.useRef(new Set());

const handleOrderComplete = useCallback(async (orderId) => {
  // Prevent loop: If we already showed this ID, stop here
  if (processedOrders.current.has(orderId)) return;
  
  try {
    const response = await tradeAPI.getCompletedOrders({ limit: 10 });
    const orders = response.data?.orders || [];
    
    // Find the specific order
    const justFinished = orders.find(o => o._id === orderId);
    
    if (justFinished) {
      // Mark as shown so it never loops again
      processedOrders.current.add(orderId);
      setLastCompletedOrder(justFinished);
      
      // Optional: Refresh the full list in the background
      setCompletedOrders(orders);
    }
  } catch (error) {
    console.error('Error in handleOrderComplete:', error);
  }
}, []); 

// Clear the set when user logs out or changes
useEffect(() => {
  if (!userData) {
    processedOrders.current.clear();
  }
}, [userData]);

  const refreshOrders = useCallback(() => {
    loadOrders();
    loadStats();
  }, [loadOrders, loadStats]);

  const value = {
    activeOrders,
    completedOrders,
    //  stats,
    isLoading,
    lastUpdated,
    placeOrder,
    cancelOrder,
    handleOrderComplete,
    refreshOrders,
    startAutoRefresh,
    stopAutoRefresh,

    lastCompletedOrder,
    setLastCompletedOrder
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};