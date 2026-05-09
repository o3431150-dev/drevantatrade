import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { tradeAPI } from '../services/api';
import { useAuth } from './AuthContext';
//import toast from 'react-hot-toast';
import {toast} from 'react-toastify';

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
  const [recentCompletion, setRecentCompletion] = useState(null); // For the Popup Modal
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Refs to prevent re-render loops and race conditions
  const refreshTimerRef = useRef(null);
  const prevActiveIdsRef = useRef([]);
  const isFetchingRef = useRef(false); 

  const [stats, setStats] = useState({
    totalTrades: 0,
    totalProfit: 0,
    winRate: 0,
    activeOrdersCount: 0,
    walletBalance: 0,
    forceWin: false,
    availableBalance: 0
  });

  const loadStats = useCallback(async () => {
    if (!userData) return;
    try {
      // tradeAPI.getTradingStats().then(res => setStats(res.data));
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [userData]);

  const loadOrders = useCallback(async () => {
    // Prevent overlapping requests that cause server strain/loops
    if (!userData || isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    try {
      const [activeResponse, completedResponse] = await Promise.all([
        tradeAPI.getActiveOrders(),
        tradeAPI.getCompletedOrders({ limit: 10 })
      ]);
      
      const newActive = activeResponse.data?.orders || [];
      const newCompleted = completedResponse.data?.orders || [];

      // DETECTION LOGIC
      if (prevActiveIdsRef.current.length > 0) {
        // Find IDs that were active but are now gone
        const finishedOrderId = prevActiveIdsRef.current.find(
          oldId => !newActive.some(newOrder => newOrder._id === oldId)
        );

        if (finishedOrderId) {
          const found = newCompleted.find(o => o._id === finishedOrderId);
          if (found) {
            // 1. Trigger the Modal
            setRecentCompletion(found);
            
            // 2. Trigger the Toast Notification
            const isWin = found.profit > 0;
            if (isWin) {
              toast.success(`Trade Won! +$${found.profit.toFixed(2)}`, {
                duration: 5000,
                icon: '🚀',
              });
            } else {
              toast.error(`Trade Closed: -$${Math.abs(found.profit).toFixed(2)}`, {
                duration: 5000,
              });
            }

            loadStats(); // Refresh balance
          }
        }
      }

      // Sync refs and state
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

  // Stable polling controls
  const stopAutoRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const startAutoRefresh = useCallback(() => {
    stopAutoRefresh();
    refreshTimerRef.current = setInterval(() => {
      loadOrders();
    }, 5000); // 5 second poll
  }, [loadOrders, stopAutoRefresh]);

  // Lifecycle Management
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
    activeOrders,
    completedOrders,
    recentCompletion,
    clearCompletion,
    stats,
    isLoading,
    lastUpdated,
    placeOrder,
    refreshOrders: loadOrders,
    startAutoRefresh,
    stopAutoRefresh
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};