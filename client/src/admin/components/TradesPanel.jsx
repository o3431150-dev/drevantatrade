import { useState, useEffect } from "react";
import { 
  Search, 
  ChevronDown, 
  Eye, 
  Clock, 
  X, 
  RefreshCw, 
  Filter, 
  Sparkles, 
  Trash2, 
  Layers, 
  ShieldAlert, 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  User, 
  History
} from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/AuthContext";

export default function TradesPanel() {
  const { backendUrl, token } = useAuth();
  
  // State management
  const [status, setStatus] = useState("All Status");
  const [isDemoFilter, setIsDemoFilter] = useState("All Accounts");
  const [openStatus, setOpenStatus] = useState(false);
  const [openDemoFilter, setOpenDemoFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Backend data states
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalTrades: 0,
    activeTrades: 0,
    completedTrades: 0,
    cancelledTrades: 0,
    totalProfit: 0
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Options Configurations
  const statuses = ["All Status", "pending", "active", "completed", "cancelled", "expired"];
  const accountTypes = ["All Accounts", "Live Account", "Demo Account"];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const params = { page, limit: 20 };

      if (status !== "All Status") params.status = status;
      if (isDemoFilter !== "All Accounts") {
        params.isDemo = isDemoFilter === "Demo Account";
      }

      const response = await axios.get(`${backendUrl}api/trades/admin/all-orders`, {
        ...config,
        params
      });

      if (response.data.success) {
        const fetchedOrders = response.data.data.orders || [];
        
        const localizedOrders = fetchedOrders.map(order => {
          if (order.status === 'active' && order.endTime) {
            const totalDuration = (new Date(order.endTime) - new Date(order.startTime)) || (order.duration * 1000) || 1;
            const elapsed = new Date() - new Date(order.startTime);
            const remaining = Math.max(0, Math.ceil((new Date(order.endTime) - new Date()) / 1000));
            const currentProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
            
            return {
              ...order,
              timeLeft: remaining,
              progress: parseFloat(currentProgress.toFixed(1))
            };
          }
          return { ...order, timeLeft: 0, progress: 100 };
        });

        setOrders(localizedOrders);
        setTotalPages(response.data.data.pagination?.pages || 1);
        setTotalOrders(response.data.data.pagination?.total || 0);
        calculateStats(localizedOrders);
      }
    } catch (error) {
      console.error("Error loading system orders:", error);
      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (tradesList) => {
    setStats({
      totalTrades: tradesList.length,
      activeTrades: tradesList.filter(t => t.status === "active").length,
      completedTrades: tradesList.filter(t => t.status === "completed").length,
      cancelledTrades: tradesList.filter(t => t.status === "cancelled").length,
      totalProfit: tradesList
        .filter(t => t.status === "completed" && t.result === "win")
        .reduce((sum, t) => sum + (t.profit || 0), 0)
    });
  };

  useEffect(() => {
    fetchOrders();
  }, [page, status, isDemoFilter]);

  useEffect(() => {
    const hasActivePositions = orders.some(o => o.status === 'active' && o.timeLeft > 0);
    if (!hasActivePositions || loading) return;

    const interval = setInterval(() => {
      setOrders(prevOrders =>
        prevOrders.map(order => {
          if (order.status !== 'active' || order.timeLeft <= 0) return order;
          
          const nextTimeLeft = Math.max(0, order.timeLeft - 1);
          const totalDuration = (new Date(order.endTime) - new Date(order.startTime)) || (order.duration * 1000) || 1;
          const elapsed = new Date() - new Date(order.startTime);
          const nextProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

          return {
            ...order,
            timeLeft: nextTimeLeft,
            progress: parseFloat(nextProgress.toFixed(1)),
            status: nextTimeLeft === 0 ? 'expired' : 'active'
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [orders, loading]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed": 
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "active": 
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse";
      case "pending": 
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "cancelled": 
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "expired": 
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default: 
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const handleToggleForceWin = async (userId) => {
    if (!userId) return toast.error("Cannot toggle: missing valid user ID");
    try {
      const response = await axios.post(
        `${backendUrl}api/trades/admin/force-win/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success("User win logic updated.");
        if (selectedOrder && (selectedOrder.user?._id === userId || selectedOrder.user === userId)) {
          setSelectedOrder(prev => ({ ...prev, wasForceWin: !prev.wasForceWin }));
        }
        fetchOrders();
      }
    } catch (err) {
      toast.error("Failed to apply win control modification.");
    }
  };

  const handleClearCompletedOrders = async (targetId = null) => {
    if (!window.confirm("Permanently clear this completed trade item from logs?")) return;
    try {
      const response = await axios.delete(`${backendUrl}api/trades/admin/clear-completed`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { orderId: targetId }
      });
      if (response.data.success) {
        toast.success(response.data.message || "Log cleared.");
        if (showDetails && selectedOrder?._id === targetId) {
          setShowDetails(false);
          setSelectedOrder(null);
        }
        fetchOrders();
      }
    } catch (err) {
      toast.error("Database deletion failed.");
    }
  };

  const filteredOrders = orders.filter(o => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      o._id?.toLowerCase().includes(term) ||
      o.symbol?.toLowerCase().includes(term) ||
      o.user?.email?.toLowerCase().includes(term) ||
      o.user?.username?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 p-3 md:p-6 selection:bg-cyan-500/30">
      <ToastContainer theme="dark" position="bottom-right" autoClose={2500} />

      {/* Simplified Top Refresh Actions Row */}
      <div className="flex justify-end gap-3 pb-4 mb-6 border-b border-slate-800/60">
        <button
          onClick={fetchOrders}
          className="w-full sm:w-auto justify-center p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:border-slate-700 transition flex items-center gap-2 text-sm"
        >
          <RefreshCw size={15} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
        <div className="bg-slate-900/40 backdrop-blur-md rounded-xl p-3 md:p-4 border border-slate-800/80">
          <p className="text-slate-500 text-[10px] md:text-xs font-semibold uppercase mb-1">Total Logs</p>
          <p className="text-lg md:text-xl font-bold text-white">{totalOrders}</p>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md rounded-xl p-3 md:p-4 border border-slate-800/80">
          <p className="text-slate-500 text-[10px] md:text-xs font-semibold uppercase mb-1">Open Positions</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <p className="text-lg md:text-xl font-bold text-cyan-400">{stats.activeTrades}</p>
          </div>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md rounded-xl p-3 md:p-4 border border-slate-800/80">
          <p className="text-slate-500 text-[10px] md:text-xs font-semibold uppercase mb-1">Settled States</p>
          <p className="text-lg md:text-xl font-bold text-emerald-400">{stats.completedTrades}</p>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md rounded-xl p-3 md:p-4 border border-slate-800/80">
          <p className="text-slate-500 text-[10px] md:text-xs font-semibold uppercase mb-1">Terminated States</p>
          <p className="text-lg md:text-xl font-bold text-rose-400">{stats.cancelledTrades}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 rounded-xl p-3 md:p-4 border border-slate-800/80 col-span-2 lg:col-span-1">
          <p className="text-slate-400 text-[10px] md:text-xs font-semibold uppercase mb-1 flex items-center gap-1">
            <Coins size={12} className="text-emerald-400" /> Settled Yield
          </p>
          <p className="text-lg md:text-xl font-bold text-emerald-400">${stats.totalProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        </div>
      </div>

      {/* Filter Workspace */}
      <div className="bg-slate-900/20 p-3 rounded-xl border border-slate-800/50 flex flex-col lg:flex-row gap-3 mb-6">
        <div className="flex-1 bg-slate-950 rounded-lg flex items-center px-3 border border-slate-800/80 focus-within:border-cyan-500/50 transition">
          <Search size={15} className="text-slate-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search assets, IDs, or usernames..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none p-2.5 text-sm text-slate-300 placeholder-slate-600"
          />
          {searchTerm && <X size={14} className="text-slate-500 hover:text-white cursor-pointer" onClick={() => setSearchTerm("")} />}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Status Select Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <button
              onClick={() => { setOpenStatus(!openStatus); setOpenDemoFilter(false); }}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between text-sm hover:border-slate-700 min-w-[140px] transition"
            >
              <span className="capitalize flex items-center gap-1.5"><Filter size={12} className="text-slate-500" /> {status}</span>
              <ChevronDown size={14} className="text-slate-500" />
            </button>
            {openStatus && (
              <div className="absolute left-0 sm:right-0 sm:left-auto w-full sm:w-48 bg-slate-950 border border-slate-800 rounded-lg mt-1 z-40 shadow-2xl overflow-hidden text-sm">
                {statuses.map(s => (
                  <button
                    key={s}
                    onClick={() => { setStatus(s); setOpenStatus(false); setPage(1); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-900 border-b border-slate-900 text-slate-400 hover:text-white capitalize last:border-0 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Account Filter Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <button
              onClick={() => { setOpenDemoFilter(!openDemoFilter); setOpenStatus(false); }}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between text-sm hover:border-slate-700 min-w-[140px] transition"
            >
              <span className="flex items-center gap-1.5"><History size={12} className="text-slate-500" /> {isDemoFilter}</span>
              <ChevronDown size={14} className="text-slate-500" />
            </button>
            {openDemoFilter && (
              <div className="absolute left-0 sm:right-0 sm:left-auto w-full sm:w-48 bg-slate-950 border border-slate-800 rounded-lg mt-1 z-40 shadow-2xl overflow-hidden text-sm">
                {accountTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => { setIsDemoFilter(type); setOpenDemoFilter(false); setPage(1); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-900 text-slate-400 hover:text-white border-b border-slate-900 last:border-0 transition"
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table & Cards Segments Container */}
      {loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 md:h-16 bg-slate-900/30 rounded-xl border border-slate-800/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div>
          {/* Desktop Table: Hidden on small views, visible on md and up */}
          <div className="hidden md:block bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
                    <th className="p-4">Asset</th>
                    <th className="p-4">Operator</th>
                    <th className="p-4">Stake</th>
                    <th className="p-4">State</th>
                    <th className="p-4">Yield</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-sm">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-slate-600">
                        No matching records found.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-900/30 transition group">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              order.direction === 'buy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {order.direction === 'buy' ? 'LONG' : 'SHORT'}
                            </span>
                            <span className="font-bold text-white">{order.symbol}</span>
                            {order.isDemo && <span className="text-[10px] text-amber-500/80 font-bold bg-amber-500/5 px-1 rounded border border-amber-500/10">DEMO</span>}
                          </div>
                          <div className="text-xs text-slate-600 mt-1">ID: {order._id}</div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-slate-900 rounded border border-slate-800 text-slate-500">
                              <User size={12} />
                            </div>
                            <div>
                              <div className="text-slate-200 font-semibold">{order.user?.username || "Unknown"}</div>
                              <div className="text-slate-500 text-xs mt-0.5">{order.user?.email || "No email"}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-slate-200">${order.amount?.toFixed(2)}</div>
                          <div className="text-xs text-slate-500 mt-1">Leverage: {order.leverage || 1}x</div>
                        </td>

                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 border text-xs font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                          <div className="text-xs text-slate-500 mt-1">Duration: {order.duration}s</div>
                        </td>

                        <td className="p-4">
                          {order.status === 'completed' ? (
                            <div>
                              <div className={`font-bold flex items-center gap-0.5 ${order.result === 'win' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {order.result === 'win' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                                {order.result === 'win' ? '+' : '-'}${order.profit ? Math.abs(order.profit).toFixed(2) : "0.00"}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">Payout: ${order.actualPayout?.toFixed(2)}</div>
                            </div>
                          ) : order.status === 'active' ? (
                            <div className="w-32">
                              <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span className="flex items-center gap-1"><Clock size={10} className="text-cyan-400 animate-spin" /> Live</span>
                                <span className="font-bold text-white">{order.timeLeft}s</span>
                              </div>
                              <div className="w-full bg-slate-900 border border-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-1000 ease-linear" 
                                  style={{ width: `${order.progress}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="text-slate-500 text-xs italic flex items-center gap-1">
                              Pending Sync
                            </div>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => { setSelectedOrder(order); setShowDetails(true); }}
                              className="p-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg hover:text-white hover:border-slate-700 transition"
                              title="Inspect Parameters Ledger"
                            >
                              <Eye size={12} />
                            </button>
                            
                            <button
                              onClick={() => handleToggleForceWin(order.user?._id || order.user)}
                              className={`p-2 border rounded-lg transition ${
                                order.wasForceWin 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/20'
                              }`}
                              title="Toggle User Win Status"
                            >
                              <Sparkles size={12} />
                            </button>
                            
                            {order.status === 'completed' && (
                              <button
                                onClick={() => handleClearCompletedOrders(order._id)}
                                className="p-2 bg-rose-500/5 text-rose-400/80 border border-rose-500/10 rounded-lg hover:bg-rose-500/20 hover:text-rose-400 transition"
                                title="Delete Record"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Grid/Cards: Displayed on small views, hidden on md screens */}
          <div className="block md:hidden space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-600 bg-slate-950 border border-slate-800/80 rounded-xl">
                No matching records found.
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order._id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3 shadow-lg">
                  {/* Top line item */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          order.direction === 'buy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {order.direction === 'buy' ? 'LONG' : 'SHORT'}
                        </span>
                        <span className="font-bold text-white text-base">{order.symbol}</span>
                        {order.isDemo && <span className="text-[9px] text-amber-500/80 font-bold bg-amber-500/5 px-1 rounded border border-amber-500/10">DEMO</span>}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5 select-all">ID: {order._id}</div>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 border text-xs font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* User row info */}
                  <div className="flex items-center gap-2 bg-slate-900/40 p-2 rounded-lg border border-slate-900">
                    <User size={12} className="text-slate-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-slate-300 font-medium text-xs truncate">{order.user?.username || "Unknown"}</div>
                      <div className="text-slate-500 text-[11px] truncate">{order.user?.email || "No email"}</div>
                    </div>
                  </div>

                  {/* Pricing/Stakes grid item */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-1 border-t border-b border-slate-900">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Stake size</span>
                      <span className="font-bold text-slate-200">${order.amount?.toFixed(2)}</span>
                      <span className="text-slate-500 text-[11px] block">Leverage: {order.leverage || 1}x</span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px] uppercase">Yield Performance</span>
                      {order.status === 'completed' ? (
                        <div>
                          <div className={`font-bold inline-flex items-center gap-0.5 ${order.result === 'win' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {order.result === 'win' ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                            {order.result === 'win' ? '+' : '-'}${order.profit ? Math.abs(order.profit).toFixed(2) : "0.00"}
                          </div>
                          <span className="text-slate-500 text-[11px] block">Payout: ${order.actualPayout?.toFixed(2)}</span>
                        </div>
                      ) : order.status === 'active' ? (
                        <div className="inline-block w-full max-w-[120px]">
                          <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                            <span className="flex items-center gap-1"><Clock size={10} className="text-cyan-400 animate-spin" /> Live</span>
                            <span className="font-bold text-white">{order.timeLeft}s</span>
                          </div>
                          <div className="w-full bg-slate-900 border border-slate-800 h-1 rounded-full overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-1000 ease-linear" 
                              style={{ width: `${order.progress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic block">Pending Sync</span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar layout for small touch targets */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">Duration: {order.duration}s</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setSelectedOrder(order); setShowDetails(true); }}
                        className="p-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg hover:text-white transition flex items-center gap-1 text-xs"
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                      
                      <button
                        onClick={() => handleToggleForceWin(order.user?._id || order.user)}
                        className={`p-2 border rounded-lg transition ${
                          order.wasForceWin 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <Sparkles size={13} />
                      </button>
                      
                      {order.status === 'completed' && (
                        <button
                          onClick={() => handleClearCompletedOrders(order._id)}
                          className="p-2 bg-rose-500/5 text-rose-400 border border-rose-500/10 rounded-lg hover:bg-rose-500/20 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Simple Pagination Footer Deck Bar */}
          {totalPages > 1 && (
            <div className="p-4 mt-4 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs text-slate-400 shadow-xl">
              <div>Page {page} of {totalPages}</div>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-slate-300 disabled:opacity-20 hover:bg-slate-800 transition"
                >
                  Prev
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-slate-300 disabled:opacity-20 hover:bg-slate-800 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Inspector Modal Drawer */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-slate-800/80 w-full max-w-md rounded-2xl p-6 shadow-2xl relative border-t-cyan-500/40 border-t-2 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setShowDetails(false); setSelectedOrder(null); }}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
            >
              <X size={16} />
            </button>
            
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-400 tracking-wider mb-4">
              <ShieldAlert size={14} /> Parameter Details
            </div>
            
            <div className="space-y-3 text-xs border-t border-b border-slate-900 py-4 my-2 text-slate-400">
              <div className="flex justify-between items-center gap-4"><span className="text-slate-600 flex-shrink-0">Database ID:</span><span className="text-slate-300 select-all truncate max-w-[200px]">{selectedOrder._id}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Symbol Pair:</span><span className="text-white font-bold">{selectedOrder.symbol}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Direction:</span><span className={`uppercase font-bold ${selectedOrder.direction === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>{selectedOrder.direction}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Principal Size:</span><span className="text-slate-200 font-bold">${selectedOrder.amount}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Leverage:</span><span className="text-slate-200">{selectedOrder.leverage}x</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Entry Price:</span><span className="text-cyan-400 font-bold">{selectedOrder.entryPrice}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Exit Price:</span><span className="text-amber-400 font-bold">{selectedOrder.exitPrice || "Awaiting Resolution"}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Seed State:</span><span className="text-slate-300">
                {selectedOrder.wasForceWin ? 'Forced Win' : selectedOrder.wasRandomLose ? 'Random Loss Flag' : 'Organic Market Flow'}
              </span></div>
            </div>
            
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => { handleToggleForceWin(selectedOrder.user?._id || selectedOrder.user); }}
                className="flex-1 py-2.5 bg-cyan-600 text-white font-bold rounded-lg text-xs hover:bg-cyan-700 active:scale-[0.98] transition shadow-lg shadow-cyan-600/10"
              >
                Invert Force Win Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}