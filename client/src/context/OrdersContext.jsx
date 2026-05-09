import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { tradeAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const OrdersContext = createContext();

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) throw new Error('useOrders must be used within an OrdersProvider');
  return context;
};

export const OrdersProvider = ({ children }) => {
  const { userData } = useAuth();
  
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [recentCompletion, setRecentCompletion] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const refreshTimerRef = useRef(null);
  const prevActiveIdsRef = useRef([]);
  const isFetchingRef = useRef(false); 
  // CRITICAL: This tracks an ID that disappeared but wasn't in completed yet
  const pendingCheckIdRef = useRef(null); 

  const [stats, setStats] = useState({
    totalTrades: 0, totalProfit: 0, winRate: 0,
    activeOrdersCount: 0, walletBalance: 0, forceWin: false, availableBalance: 0
  });

  const loadStats = useCallback(async () => {
    if (!userData) return;
    try {
      // Re-enable when API is ready:
      // const res = await tradeAPI.getTradingStats();
      // setStats(res.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [userData]);

  const loadOrders = useCallback(async () => {
    if (!userData || isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    try {
      const [activeResponse, completedResponse] = await Promise.all([
        tradeAPI.getActiveOrders(),
        tradeAPI.getCompletedOrders({ limit: 10 })
      ]);
      
      const newActive = activeResponse.data?.orders || [];
      const newCompleted = completedResponse.data?.orders || [];

      // 1. Find which ID disappeared from Active list
      const disappearedId = prevActiveIdsRef.current.find(
        oldId => !newActive.some(newOrder => newOrder._id === oldId)
      );

      // 2. Determine which ID to look for (the one that just disappeared OR one we are still waiting for)
      const targetId = disappearedId || pendingCheckIdRef.current;

      if (targetId) {
        const found = newCompleted.find(o => o._id === targetId);
        
        if (found) {
          // Success: Show popup and toast
          setRecentCompletion(found);
          pendingCheckIdRef.current = null; // Clear pending

          const isWin = found.profit > 0;
          if (isWin) {
            toast.success(`Trade Won! +$${found.profit.toFixed(2)}`, { icon: '🚀' });
          } else {
            toast.error(`Trade Closed: -$${Math.abs(found.profit).toFixed(2)}`);
          }
          loadStats();
        } else if (disappearedId) {
          // It disappeared from active but isn't in completed yet (Server Lag)
          // Store it to check again in the next 5-second poll
          pendingCheckIdRef.current = disappearedId;
        }
      }

      prevActiveIdsRef.current = newActive.map(o => o._id);
      setActiveOrders(newActive);
      setCompletedOrders(newCompleted);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [userData, loadStats]);

  const stopAutoRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const startAutoRefresh = useCallback(() => {
    stopAutoRefresh();
    refreshTimerRef.current = setInterval(loadOrders, 5000);
  }, [loadOrders, stopAutoRefresh]);

  useEffect(() => {
    if (userData) {
      loadOrders();
      loadStats();
      startAutoRefresh();
    } else {
      stopAutoRefresh();
      setActiveOrders([]);
      setCompletedOrders([]);
      prevActiveIdsRef.current = [];
      pendingCheckIdRef.current = null;
    }
    return () => stopAutoRefresh();
  }, [userData, loadOrders, loadStats, startAutoRefresh, stopAutoRefresh]);

  const placeOrder = useCallback(async (orderData) => {
    setIsLoading(true);
    try {
      const response = await tradeAPI.placeOrder(orderData);
      if (response.success) {
        toast.success('Order placed successfully');
        await loadOrders();
        return response.data;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadOrders]);

  const clearCompletion = useCallback(() => setRecentCompletion(null), []);

  const value = {
    activeOrders, completedOrders, recentCompletion,
    clearCompletion, stats, isLoading, lastUpdated,
    placeOrder, refreshOrders: loadOrders,
    startAutoRefresh, stopAutoRefresh
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};