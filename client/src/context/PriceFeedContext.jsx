import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const PriceFeedContext = createContext();

export const PriceFeedProvider = ({ children }) => {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    // FIX: Point to port 5000 (your backend port)
   const backendUrl = "https://tradingappv1-production-71a7.up.railway.app"
   // const backendUrl = "http://localhost:3000";
    const socket = io(backendUrl, { 
      transports: ["websocket", "polling"], // Allow fallback
      withCredentials: true 
    });

    socket.on("connect", () => {
      console.log("Connected to Backend Socket.IO");
    });

    socket.on("priceUpdate", (data) => {
      // console.log("Received update:", data);
      setPrices(data); 
    });

    socket.on("connect_error", (err) => {
      console.error("Socket Connection Error:", err.message);
    });

    return () => {
      socket.off("priceUpdate");
      socket.disconnect();
    };
  }, []);

  return (
    <PriceFeedContext.Provider value={{ prices }}>
      {children}
    </PriceFeedContext.Provider>
  );
};

export const usePriceFeed = () => useContext(PriceFeedContext);