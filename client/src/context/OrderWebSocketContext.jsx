import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { useOrders } from './OrdersContext';

const OrderWebSocketContext = createContext();

export const OrderWebSocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { refreshOrders, activeOrders, handleOrderComplete } = useOrders();
  
  // Guard against duplicate triggers (Essential for Railway/Production)
  const processedOrders = useRef(new Set());
  
  // Track active orders without triggering useEffect re-runs
  const activeOrdersRef = useRef(activeOrders);
  useEffect(() => {
    activeOrdersRef.current = activeOrders;
  }, [activeOrders]);

  /**
   * Professional Order Completion Toast
   */
  const showOrderCompleteToast = useCallback((orderData) => {
    const orderId = orderData.orderId || orderData._id;
    const toastId = `order-complete-${orderId}`;
    
    // Prevent duplicate toast for the same order
    if (toast.isActive(toastId)) return;

    const isWin = orderData.profit >= 0;
    const symbol = orderData.symbol || 'Trade';

    toast(
      <div className="flex flex-col py-1">
        <div className="flex justify-between items-center border-b border-white/10 pb-1 mb-2">
          <span className="font-bold text-sm tracking-tight">Order Finished</span>
          <span className="text-[10px] opacity-50 font-mono">#{orderId.slice(-6)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300">{symbol}</span>
          <span className={`text-sm font-black ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isWin ? '+' : ''}{orderData.profit?.toFixed(2)} USDT
          </span>
        </div>
      </div>,
      {
        toastId,
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        style: {
          background: '#0f172a', // Slate-900
          border: `1px solid ${isWin ? '#10b981' : '#f43f5e'}`,
          borderRadius: '16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
        }
      }
    );
  }, []);

  useEffect(() => {
    const backendUrl = "https://drevantatrade-production-e27d.up.railway.app";

    if (!socketRef.current) {
      socketRef.current = io(backendUrl, { 
        transports: ["websocket"],
        path: '/socket.io',
        reconnection: true,
        reconnectionAttempts: 5
      });
    }

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Order WebSocket connected');
      socket.emit('subscribe', { type: 'orders' });
    });

    socket.on('order-completed', (orderData) => {
      const orderId = orderData.orderId || orderData._id;
      
      // STOP THE LOOP: Check if we already handled this order in this session
      if (processedOrders.current.has(orderId)) return;
      processedOrders.current.add(orderId);

      console.log('New Order Complete:', orderId);
      
      // 1. Show the Toast
      showOrderCompleteToast(orderData);
      
      // 2. Trigger the Modal Popup (if you still want it)
      if (handleOrderComplete) {
        handleOrderComplete(orderId);
      }

      // 3. Refresh general state
      refreshOrders();

      // Clear from memory after 60 seconds
      setTimeout(() => processedOrders.current.delete(orderId), 60000);
    });

    socket.on('order-updated', (orderData) => {
      const orderId = orderData.orderId || orderData._id;
      if (activeOrdersRef.current.some(order => order._id === orderId)) {
        refreshOrders();
      }
    });

    return () => {
      socket.off('order-completed');
      socket.off('order-updated');
      socket.off('connect');
    };
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
  if (!context) throw new Error('useOrderWebSocket must be used within OrderWebSocketProvider');
  return context;
};