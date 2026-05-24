import React, { useState, useEffect } from 'react';

const OrderTimer = ({ startTime, duration, onComplete, orderId, isMobile = false }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 1000);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const elapsed = Date.now() - startTime;
    const initialTimeLeft = Math.max(0, duration * 1000 - elapsed);
    const initialProgress = Math.min(100, (elapsed / (duration * 1000)) * 100);
    
    setTimeLeft(initialTimeLeft);
    setProgress(initialProgress);

    const interval = setInterval(() => {
      const newElapsed = Date.now() - startTime;
      const newTimeLeft = Math.max(0, duration * 1000 - newElapsed);
      const newProgress = Math.min(100, (newElapsed / (duration * 1000)) * 100);
      
      setTimeLeft(newTimeLeft);
      setProgress(newProgress);

      if (newTimeLeft <= 0) {
        clearInterval(interval);
        onComplete(orderId);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, duration, orderId, onComplete]);

  const formatTime = (ms) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  // Render spinner component if time runs out
  if (timeLeft <= 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <svg 
          className="animate-spin h-8 w-8 text-green-500" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
          Processing order...
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between text-sm sm:text-base mb-2">
        <span className="font-medium">Time left: {formatTime(timeLeft)}</span>
        <span className="text-gray-500 dark:text-gray-400">{Math.round(progress)}%</span>
      </div>
      
      <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
        <span>0s</span>
        <span className="font-medium">{duration}s</span>
      </div>
    </div>
  );
};

export default OrderTimer;