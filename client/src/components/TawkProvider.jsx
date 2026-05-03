import { useEffect } from "react";

/**
 * Global function to trigger Tawk from anywhere
 */
export const liveChat = () => {
  if (window.Tawk_API && typeof window.Tawk_API.maximize === 'function') {
    window.Tawk_API.showWidget();
    window.Tawk_API.maximize();
  } else {
    // Fallback if the user clicks before the script finishes loading
    console.warn("Chat is initializing...");
    alert("Chat is loading, please try again in a second.");
  }
};

const TawkProvider = () => {
  useEffect(() => {
    if (!window.Tawk_API) {
      const script = document.createElement("script");
      script.async = true;
      // Your specific Tawk ID
      script.src = "https://embed.tawk.to/69f63171e0f3f91c34db3d2e/1jnkr29fp";
      script.charset = "UTF-8";
      script.setAttribute("crossorigin", "*");
      document.body.appendChild(script);

      script.onload = () => {
        window.Tawk_API = window.Tawk_API || {};
        
        // This is the "Magic": it hides the default Tawk bubble 
        // so you can use your own custom buttons.
        window.Tawk_API.onLoad = function() {
          window.Tawk_API.hideWidget();
        };

        // Ensures it stays hidden if the user minimizes the chat
        window.Tawk_API.onChatMinimized = function() {
          window.Tawk_API.hideWidget();
        };
      };
    }
  }, []);

  return null; // This component doesn't render anything UI-wise
};

export default TawkProvider;