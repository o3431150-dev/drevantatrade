// src/context/OrderWebSocketContext.jsx
import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { useOrders } from './OrdersContext';

const OrderWebSocketContext = createContext();

export const OrderWebSocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { refreshOrders, activeOrders, handleOrderComplete } = useOrders();
  
  // Use a Ref to track processed orders to prevent duplicate UI triggers
  const processedOrders = useRef(new Set());
  
  // Use a Ref for activeOrders to prevent the useEffect from looping
  const activeOrdersRef = useRef(activeOrders);
  useEffect(() => {
    activeOrdersRef.current = activeOrders;
  }, [activeOrders]);

  // Toast Notification Logic
  const showOrderCompleteToast = useCallback((orderData) => {
    const orderId = orderData.orderId || orderData._id;
    const toastId = `order-complete-${orderId}`;
    
    if (toast.isActive(toastId)) return;
    
    toast.success(
      `🎯 Order Completed!\nProfit: $${orderData.profit?.toFixed(2) || '0.00'}`,
      {
        toastId,
        autoClose: 3000,
        position: 'top-right'
      }
    );
  }, []);

  useEffect(() => {
    const backendUrl = "https://drevantatrade-production-e27d.up.railway.app";

    // Initialize socket only if it doesn't exist
    if (!socketRef.current) {
      socketRef.current = io(backendUrl, { 
        transports: ["websocket"],
        path: '/socket.io',
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
    }

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Order WebSocket connected');
      socket.emit('subscribe', { type: 'orders' });
    });

    // Handle Order Completion
    socket.on('order-completed', (orderData) => {
      const orderId = orderData.orderId || orderData._id;
      
      // Prevent Loop: Ignore if already handled in this session
      if (processedOrders.current.has(orderId)) return;
      processedOrders.current.add(orderId);

      console.log('Order completed event received:', orderId);
      
      // 1. Trigger the Modal Popup (from OrdersContext)
      if (handleOrderComplete) {
        handleOrderComplete(orderId);
      }

      // 2. Show backup Toast
      showOrderCompleteToast(orderData);
      
      // 3. Refresh Data
      refreshOrders();

      // Clear from memory after 1 minute to keep Set small
      setTimeout(() => {
        processedOrders.current.delete(orderId);
      }, 60000);
    });

    // Handle Active Order Updates
    socket.on('order-updated', (orderData) => {
      const orderId = orderData.orderId || orderData._id;
      // Use the Ref to check without re-triggering the socket useEffect
      if (activeOrdersRef.current.some(order => order._id === orderId)) {
        refreshOrders();
      }
    });

    return () => {
      // We do NOT disconnect here to prevent Railway re-connection loops
      // but we do remove listeners to prevent memory leaks
      socket.off('order-completed');
      socket.off('order-updated');
      socket.off('connect');
    };
    // CRITICAL: Empty dependency array (or only stable functions) 
    // prevents the socket from restarting and looping
  }, [refreshOrders, handleOrderComplete, showOrderCompleteToast]);

  const value = {
    socket: socketRef.current,
    emitEvent: (event, data) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit(event, data);
      }
    }
  };

  return (
    <OrderWebSocketContext.Provider value={value}>
      {children}
    </OrderWebSocketContext.Provider>
  );
};

export const useOrderWebSocket = () => {
  const context = useContext(OrderWebSocketContext);
  if (!context) {
    throw new Error('useOrderWebSocket must be used within OrderWebSocketProvider');
  }
  return context;
};