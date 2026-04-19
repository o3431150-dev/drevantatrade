import { useEffect, useState } from "react";

const TawkButton = () => {
  const [visible, setVisible] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Tawk script
    if (!window.Tawk_API) {
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://embed.tawk.to/696e5ddcf657ac197b782230/1jfbhta3ipppppppppp";
      script.charset = "UTF-8";
      script.setAttribute("crossorigin", "*");
      
      setLoading(true);
      
      // When script loads
      script.onload = () => {
        // Wait for Tawk to be fully initialized
        const checkTawk = setInterval(() => {
          if (window.Tawk_API && typeof window.Tawk_API.hideWidget === 'function') {
            // Hide the default Tawk widget completely
            window.Tawk_API.hideWidget();
            setLoaded(true);
            setLoading(false);
            clearInterval(checkTawk);
          }
        }, 100);
      };
      
      script.onerror = () => {
        console.error("Failed to load chat");
        setLoading(false);
      };
      
      document.body.appendChild(script);
    } else {
      // If already loaded, hide widget
      if (window.Tawk_API.hideWidget) {
        window.Tawk_API.hideWidget();
      }
      setLoaded(true);
    }

    // Set up chat event listeners
    const setupListeners = setInterval(() => {
      if (window.Tawk_API) {
        // Hide button when chat opens
        window.Tawk_API.onChatMaximized = () => setVisible(false);
        // Show button when chat closes
        window.Tawk_API.onChatMinimized = () => setVisible(true);
        window.Tawk_API.onChatHidden = () => setVisible(true);
        clearInterval(setupListeners);
      }
    }, 100);

    return () => clearInterval(setupListeners);
  }, []);

  const openChat = () => {
    if (!loaded || loading) return;
    
    // Show and maximize chat
    if (window.Tawk_API) {
      window.Tawk_API.showWidget();
      window.Tawk_API.maximize();
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <button
      onClick={openChat}
      disabled={loading}
      style={{
        position: "fixed",
        bottom: "90px",
        right: "20px",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        backgroundColor: loading ? "#9ca3af" : "#3B82F6",
        color: "white",
        fontSize: "28px",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        zIndex: 1000,
        boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: loading ? 0.7 : 1,
      }}
      title={loading ? "Loading chat..." : "Chat with us"}
    >
      {loading ? "..." : "💬"}
    </button>
  );
};

export default TawkButton;