import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [recentCompletion, setRecentCompletion] = useState(null); // Track the order for the popup
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
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Use a ref to track IDs without triggering re-renders
  const prevActiveIdsRef = useRef([]);

  const loadStats = useCallback(async () => {
    if (!userData) return;
    try {
      // Logic for fetching stats can be re-enabled here
      // const response = await tradeAPI.getTradingStats();
      // setStats(...)
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [userData]);

  const loadOrders = useCallback(async () => {
    if (!userData) return;
    
    try {
      const [activeResponse, completedResponse] = await Promise.all([
        tradeAPI.getActiveOrders(),
        tradeAPI.getCompletedOrders({ limit: 10 })
      ]);
      
      const newActive = activeResponse.data?.orders || [];
      const newCompleted = completedResponse.data?.orders || [];

      // DETECTION LOGIC: Check if an active order has moved to completed
      if (prevActiveIdsRef.current.length > 0) {
        const finishedOrderId = prevActiveIdsRef.current.find(
          id => !newActive.some(order => order._id === id)
        );

        if (finishedOrderId) {
          const completedOrder = newCompleted.find(o => o._id === finishedOrderId);
          if (completedOrder) {
            setRecentCompletion(completedOrder);
            await loadStats(); // Update balance/stats when an order finishes
          }
        }
      }

      // Update refs and state
      prevActiveIdsRef.current = newActive.map(o => o._id);
      setActiveOrders(newActive);
      setCompletedOrders(newCompleted);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }, [userData, loadStats]);

  const startAutoRefresh = useCallback(() => {
    if (refreshInterval) clearInterval(refreshInterval);
    const interval = setInterval(() => {
      loadOrders();
    }, 5000);
    setRefreshInterval(interval);
  }, [loadOrders, refreshInterval]);

  const stopAutoRefresh = useCallback(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [refreshInterval]);

  useEffect(() => {
    if (userData) {
      loadOrders();
      loadStats();
      startAutoRefresh();
    }
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
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

  const handleOrderComplete = useCallback(async (orderId, finalPrice) => {
    await loadOrders();
    await loadStats();
  }, [loadOrders, loadStats]);

  const refreshOrders = useCallback(() => {
    loadOrders();
    loadStats();
  }, [loadOrders, loadStats]);

  const clearCompletion = () => setRecentCompletion(null);

  const value = {
    activeOrders,
    completedOrders,
    recentCompletion, // Used by the popup component
    clearCompletion,  // Used to close the popup
    stats,
    isLoading,
    lastUpdated,
    placeOrder,
    cancelOrder,
    handleOrderComplete,
    refreshOrders,
    startAutoRefresh,
    stopAutoRefresh
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};