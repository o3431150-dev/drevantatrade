import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import MobileNav from "../components/MobileNav";
import Loading from "../components/Loading";
import ProfileEditModal from "../components/ProfileEditModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { assets } from "../assets/assets";

// Icons
import {
  ChevronLeft,
  LogOut,
  ArrowDownCircle,
  ArrowUpCircle,
  User,
  Key,
  IdCard,
  Shield,
  HelpCircle,
  Eye,
  EyeOff,
  ChevronRight,
  Camera,
  Mail,
  Calendar,
  Copy,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { backendUrl, token, logout } = useAuth();

  // Profile State
  const [userdata, setUserdata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Balance State
  const [showBalance, setShowBalance] = useState(false);
  const [marketPrices, setMarketPrices] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Modal states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  // Form states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [isPasswordSet, setIsPasswordSet] = useState(true);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    userName: "",
    avatar: ""
  });

  // Fetch market prices
  const getMarketPrices = async () => {
    try {
      setPriceLoading(true);
      const response = await axios.get(`${backendUrl}api/conversions/prices`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setMarketPrices(response.data.data);
        setLastUpdated(response.data.timestamp);
      }
    } catch (error) {
      console.error('Error getting prices:', error);
    } finally {
      setPriceLoading(false);
    }
  };

  // Fetch profile data
  const fetchProfile = async (showToast = false) => {
    try {
      if (!showToast) setLoading(true);
      else setRefreshing(true);

      const res = await axios.get(`${backendUrl}api/profile/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setUserdata(res.data.user);
        setProfileForm({
          name: res.data.user.name || "",
          userName: res.data.user.userName || "",
          avatar: res.data.user.avatar || ""
        });
        setIsPasswordSet(res.data.user.isPasswordSet);
      } else {
        toast.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      toast.error(error.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch both profile and prices
  const fetchAllData = async () => {
    await Promise.all([fetchProfile(), getMarketPrices()]);
  };

  useEffect(() => {
    fetchAllData();

    // Refresh prices every 30 seconds
    const intervalId = setInterval(() => {
      getMarketPrices();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // Calculate total balance with market prices
  const calculateTotalBalance = () => {
    if (!userdata?.wallet) return 0;

    const usdtValue = userdata.wallet.usdt || 0;
    const btcPrice = marketPrices?.BTC?.price || 45000;
    const btcValue = (userdata.wallet.btc || 0) * btcPrice;
    const ethPrice = marketPrices?.ETH?.price || 3000;
    const ethValue = (userdata.wallet.eth || 0) * ethPrice;
    const loanUsdtValue = userdata.wallet.loanUsdt || 0;

    return usdtValue + btcValue + ethValue + loanUsdtValue;
  };

  // Calculate 24h change for total balance
  const calculateTotalChange = () => {
    if (!userdata?.wallet) return 0;

    const btcChange = marketPrices?.BTC?.change24h || 0;
    const ethChange = marketPrices?.ETH?.change24h || 0;
    const totalBalance = calculateTotalBalance();

    if (totalBalance === 0) return 0;

    const btcBalance = (userdata.wallet.btc || 0) * (marketPrices?.BTC?.price || 45000);
    const ethBalance = (userdata.wallet.eth || 0) * (marketPrices?.ETH?.price || 3000);
    const usdtBalance = userdata.wallet.usdt || 0;

    const weightedChange = (
      (btcBalance * btcChange) +
      (ethBalance * ethChange) +
      (usdtBalance * 0)
    ) / totalBalance;

    return weightedChange;
  };

  const totalBalance = calculateTotalBalance();
  const totalChange = calculateTotalChange();
  const totalChangeAmount = (totalBalance * totalChange) / 100;

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const updated = new Date(timestamp);
    const diffInSeconds = Math.floor((now - updated) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      //toast.error('Failed to logout');
    }
  };

  // Password validation
  const validatePassword = () => {
    const errors = {};

    if (passwordData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(passwordData.newPassword)) {
      errors.newPassword = "Password must contain at least one uppercase letter";
    }
    if (!/[0-9]/.test(passwordData.newPassword)) {
      errors.newPassword = "Password must contain at least one number";
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Change password handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!validatePassword()) return;

    try {
      setUpdatingPassword(true);
      const response = await axios.post(
        `${backendUrl}api/profile/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success("Password changed successfully");
        setShowChangePassword(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setPasswordErrors({});
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Profile update handler
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await axios.put(
        `${backendUrl}api/profile/profile`,
        profileForm,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success("Profile updated successfully");
        setShowProfileEdit(false);
        fetchProfile();
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get KYC status badge
  const getKYCStatusBadge = (status) => {
    const statuses = {
      'approved': {
        icon: <CheckCircle size={16} className="text-green-500" />,
        text: "Verified",
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30",
        action: null
      },
      'under_review': {
        icon: <Clock size={16} className="text-blue-500" />,
        text: "Under Review",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
        action: null
      },
      'pending': {
        icon: <Clock size={16} className="text-yellow-500" />,
        text: "Pending",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/30",
        action: null
      },
      'rejected': {
        icon: <XCircle size={16} className="text-red-500" />,
        text: "Rejected",
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30",
        action: "Resubmit"
      },
      'not_submitted': {
        icon: <AlertCircle size={16} className="text-gray-500" />,
        text: "Not Verified",
        color: "text-gray-500",
        bgColor: "bg-gray-500/10",
        borderColor: "border-gray-500/30",
        action: "Verify Now"
      }
    };
    return statuses[status] || statuses['not_submitted'];
  };

  const quickActions = [
    { icon: <ArrowDownCircle size={20} />, label: "Deposit", color: "text-blue-400", path: "/deposit" },
    { icon: <ArrowUpCircle size={20} />, label: "Withdraw", color: "text-green-400", path: "/withdraw" },
  ];

  if (loading) {
    return <Loading text="Loading profile..." fullScreen />;
  }

  if (!userdata) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center px-4">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">Failed to load profile</h2>
          <p className="text-gray-400 text-sm sm:text-base mb-4">Please try again</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => fetchProfile()}
              className="px-5 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base"
            >
              Retry 
            </button>

            <button
              onClick={() => handleLogout()}
              className="px-4 sm:px-6 py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg transition-colors text-sm sm:text-base"
            >
              Logout
            </button>
          </div>

        </div>
      </div>
    );
  }

  const kycStatus = getKYCStatusBadge(userdata.kycStatus);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-20">
      <MobileNav />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950  backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 sm:gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <ChevronLeft size={18} className="sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm sm:text-base font-medium ">Back</span>
            </button>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => fetchAllData()}
                disabled={refreshing || priceLoading}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${refreshing || priceLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="space-y-4 sm:space-y-6">

          {/* Profile Header Card */}
          <div className="bg-gray-900 rounded-xl sm:rounded-2xl sm:border sm:border-gray-700 p-4 sm:p-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
                  <div className="w-full h-full rounded-full bg-gray-950 flex items-center justify-center">
                    {userdata.avatar ? (
                      <img
                        src={userdata.avatar}
                        alt={userdata.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xl sm:text-2xl font-semibold text-white">
                        {userdata.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileEdit(true)}
                  className="absolute -bottom-1 -right-1 p-1 sm:p-1.5 bg-blue-600 hover:bg-blue-700 rounded-full border-2 border-gray-900 transition-colors"
                >
                  <Camera size={12} className="sm:w-3.5 sm:h-3.5 text-white" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1 sm:mb-2">
                  <h1 className="text-md sm:text-xl font-bold text-white">
                    {userdata.name}
                  </h1>
                  {userdata.userName && (
                    <span className="text-gray-400 text-sm sm:text-base">@{userdata.userName}</span>
                  )}
                </div>

                {/* <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                
                  <button
                    onClick={kycStatus.action ? () => navigate('/kyc') : undefined}
                    disabled={!kycStatus.action}
                    className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${kycStatus.bgColor} ${kycStatus.borderColor} border transition-all ${kycStatus.action ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}`}
                  >
                    {kycStatus.icon}
                    <span className={`text-xs font-medium ${kycStatus.color}`}>
                      KYC: {kycStatus.text}
                    </span>
                    {kycStatus.action && (
                      <span className="text-xs underline ml-0.5 sm:ml-1">{kycStatus.action}</span>
                    )}
                  </button>

          
                  <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30">
                    <Shield size={12} className="sm:w-3.5 sm:h-3.5 text-blue-500" />
                    <span className="text-xs font-medium text-blue-500">
                      {userdata.role === 'admin' ? 'Admin' : 'Verified Account'}
                    </span>
                  </div>
                </div> */}

                {/* Email */}
                <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 text-xs sm:text-sm text-gray-400">
                  <Mail size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span className="break-all">{userdata.email}</span>
                  {/* <button
                    onClick={() => {
                      navigator.clipboard.writeText(userdata.email);
                      toast.success('Email copied to clipboard');
                    }}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Copy size={10} className="sm:w-3 sm:h-3" />
                  </button> */}
                </div>

                {/* Member Since */}
                <div className="flex items-center gap-1.5 sm:gap-2 mt-1 text-xs sm:text-sm text-gray-400">
                  {/* <Calendar size={12} className="sm:w-3.5 sm:h-3.5" /> */}
                  {/* <span>Member since {formatDate(userdata.createdAt)}</span> */}
                </div>
              </div>

              {/* Edit Profile Button */}
              <button
                onClick={() => setShowProfileEdit(true)}
                className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-green-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <User size={14} className="sm:w-4 sm:h-4" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Rejection Reason */}
            {userdata.kycStatus === 'rejected' && userdata.kycRejectionReason && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <XCircle size={16} className="sm:w-4.5 sm:h-4.5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-500">KYC Verification Failed</p>
                    <p className="text-xs text-red-400 mt-1">{userdata.kycRejectionReason}</p>
                    <button
                      onClick={() => navigate('/kyc')}
                      className="text-xs text-red-400 hover:text-red-300 underline mt-2"
                    >
                      Resubmit Documents
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Balance Overview Card */}
          <div className="rounded-xl sm:rounded-2xl sm:border sm:border-gray-700 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Balance Overview</h2>
                {marketPrices && lastUpdated && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-gray-400 text-[10px] sm:text-xs">Live • Updated {formatTimeAgo(lastUpdated)}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* {priceLoading && (
                  //<span className="text-[10px] sm:text-xs text-gray-400">Refreshing...</span>
                )} */}
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2  hover:bg-gray-700 rounded-lg transition-colors text-xs sm:text-sm font-medium text-gray-300 border border-gray-700"
                >
                  {showBalance ? <EyeOff size={14} className="sm:w-4 sm:h-4" /> : <Eye size={14} className="sm:w-4 sm:h-4" />}
                  <span>{showBalance ? "Hide" : "Show"}</span>
                </button>
              </div>
            </div>

            {/* Total Balance */}
            <div className="bg-gray-800/50 rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 ">
              <div className="flex justify-between items-start mb-2">
                <p className="text-gray-400 text-xs sm:text-sm">Total Balance</p>
                <button
                  onClick={getMarketPrices}
                  disabled={priceLoading}
                  className="text-[10px] sm:text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                >
                  {priceLoading ? "Refreshing..." : "Refresh Prices"}
                </button>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white mb-2 break-all">
                  {showBalance ? `$${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••"}
                </p>
                {showBalance && marketPrices && totalChange !== 0 && (
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                    <div className={`flex items-center gap-0.5 sm:gap-1 ${totalChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {totalChange >= 0 ? <TrendingUp size={12} className="sm:w-3.5 sm:h-3.5" /> : <TrendingDown size={12} className="sm:w-3.5 sm:h-3.5" />}
                      <span className="text-xs sm:text-sm font-medium">
                        {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
                      </span>
                      <span className="text-xs sm:text-sm">
                        ({totalChange >= 0 ? '+' : ''}${Math.abs(totalChangeAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                      </span>
                    </div>
                    <span className="text-gray-500 text-[10px] sm:text-sm">(24h)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Assets */}
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base mb-3 sm:mb-4">Wallet Assets</h3>
              <div className="space-y-2 sm:space-y-3">
                <AssetRow
                  currency="USDT"
                  balance={userdata.wallet?.usdt || 0}
                  showBalance={showBalance}
                  logo={assets.tether}
                  usdValue={userdata.wallet?.usdt || 0}
                  price={1}
                  change={0}
                  marketPrices={marketPrices}
                />
                <AssetRow
                  currency="BTC"
                  balance={userdata.wallet?.btc || 0}
                  showBalance={showBalance}
                  logo={assets.bitcoin}
                  usdValue={(userdata.wallet?.btc || 0) * (marketPrices?.BTC?.price || 45000)}
                  price={marketPrices?.BTC?.price || 0}
                  change={marketPrices?.BTC?.change24h || 0}
                  marketPrices={marketPrices}
                />
                <AssetRow
                  currency="ETH"
                  balance={userdata.wallet?.eth || 0}
                  showBalance={showBalance}
                  logo={assets.ethereum}
                  usdValue={(userdata.wallet?.eth || 0) * (marketPrices?.ETH?.price || 3000)}
                  price={marketPrices?.ETH?.price || 0}
                  change={marketPrices?.ETH?.change24h || 0}
                  marketPrices={marketPrices}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-950 rounded-xl sm:rounded-2xl sm:border sm:border-gray-700 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {quickActions.map((action, index) => (
                <ActionButton
                  key={index}
                  icon={action.icon}
                  label={action.label}
                  color={action.color}
                  onClick={() => navigate(action.path)}
                />
              ))}
            </div>
          </div>

          {/* Security & Settings */}
          <div className="bg-gray-950 rounded-xl sm:rounded-2xl sm:border sm:border-gray-700 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Security & Settings</h2>
            <div className="space-y-1 sm:space-y-2">
              <SettingItem
                icon={<IdCard size={16} className="sm:w-4.5 sm:h-4.5" />}
                label="KYC Verification"
                description={getKYCStatusDescription(userdata.kycStatus)}
                status={userdata.kycStatus}
                statusText={kycStatus.text}
                statusColor={kycStatus.color}
                onClick={() => navigate('/kyc')}
                showChevron={userdata.kycStatus !== 'approved' && userdata.kycStatus !== 'pending' && userdata.kycStatus !== 'under_review'}
              />

              <SettingItem
                icon={<Key size={16} className="sm:w-4.5 sm:h-4.5" />}
                label={isPasswordSet ? "Change Password" : "Set Password"}
                description={isPasswordSet ? "Update your password regularly" : "Set a password for added security"}
                onClick={() => setShowChangePassword(true)}
              />

              <SettingItem
                icon={<HelpCircle size={16} className="sm:w-4.5 sm:h-4.5" />}
                label="Help & Support"
                description="Get help with your account"
                onClick={() => {
                  if (window.Tawk_API) {
                    window.Tawk_API.showWidget();
                    window.Tawk_API.maximize();
                  }
                }}
              />

              <SettingItem
                icon={<LogOut size={16} className="sm:w-4.5 sm:h-4.5" />}
                label="Sign Out"
                description="Logout from your account"
                danger
                onClick={handleLogout}
              />
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-gray-950 rounded-xl sm:rounded-2xl border border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-gray-400">Account ID</h3>
                <p className="text-xs sm:text-sm text-white font-mono mt-1 break-all">{userdata._id}</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(userdata._id);
                  toast.success('Account ID copied');
                }}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Copy size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePasswordModal
          passwordErrors={passwordErrors}
          setShowChangePassword={setShowChangePassword}
          handlePasswordChange={handlePasswordChange}
          setPasswordData={setPasswordData}
          passwordData={passwordData}
          updatingPassword={updatingPassword}
          isPasswordSet={isPasswordSet}
          setIsPasswordSet={setIsPasswordSet}
          setPasswordErrors={setPasswordErrors}
        />
      )}

      {/* Edit Profile Modal */}
      {showProfileEdit && (
        <ProfileEditModal
          handleProfileUpdate={handleProfileUpdate}
          setShowProfileEdit={setShowProfileEdit}
          setProfileForm={setProfileForm}
          loading={loading}
          profileForm={profileForm}
          userdata={userdata}
          setPasswordErrors={setPasswordErrors}
        />
      )}
    </div>
  );
}

// ============= Helper Components =============

// Asset Row Component
function AssetRow({ currency, balance, showBalance, logo, usdValue, price, change, marketPrices }) {
  const isStablecoin = currency === "USDT";

  return (
    <div className="flex items-center justify-between p-2 sm:p-3 hover:bg-gray-800/50 rounded-xl transition-colors border border-transparent hover:border-gray-700">
      <div className="flex items-center gap-2 sm:gap-3">
        <img src={logo} alt={currency} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
        <div>
          <div className="font-medium text-white text-sm sm:text-base">{currency}</div>
          <div className="text-gray-400 text-xs sm:text-sm">
            {showBalance ? `${balance.toLocaleString(undefined, { maximumFractionDigits: 8 })} ${currency}` : "••••"}
          </div>
          {showBalance && marketPrices && !isStablecoin && price > 0 && (
            <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
              <span className="text-[10px] sm:text-xs text-gray-500">
                ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-[10px] sm:text-xs ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {change >= 0 ? '+' : ''}{change?.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-white text-sm sm:text-base">
          {showBalance ? `$${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••"}
        </div>
        {showBalance && !isStablecoin && (
          <div className="text-[10px] sm:text-xs text-gray-400">
            {balance.toFixed(6)} {currency}
          </div>
        )}
      </div>
    </div>
  );
}

// Action Button Component
function ActionButton({ icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center p-3 sm:p-4 hover:bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-all group"
    >
      <div className={`mb-1.5 sm:mb-2 ${color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="text-xs sm:text-sm font-medium text-gray-300">{label}</span>
    </button>
  );
}

// Setting Item Component
function SettingItem({ icon, label, description, status, statusText, statusColor, danger = false, onClick, showChevron = true }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all hover:bg-gray-800/50 border border-transparent hover:border-gray-700 ${danger ? 'text-red-400 hover:text-red-300' : 'text-gray-300'}`}
    >
      <div className={`${danger ? 'text-red-500' : status ? statusColor : 'text-gray-400'}`}>
        {icon}
      </div>

      <div className="flex-1 text-left">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <span className="font-medium text-xs sm:text-sm">{label}</span>
          {status && (
            <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${statusColor} bg-opacity-10 border border-current`}>
              {statusText}
            </span>
          )}
        </div>
        <div className="text-gray-500 text-[10px] sm:text-xs mt-0.5">{description}</div>
      </div>

      {showChevron && <ChevronRight size={14} className="sm:w-4 sm:h-4 text-gray-500" />}
    </button>
  );
}

// Helper function for KYC status description
function getKYCStatusDescription(status) {
  switch (status) {
    case 'approved':
      return 'Your identity has been verified';
    case 'under_review':
      return 'Your documents are being reviewed';
    case 'pending':
      return 'Verification in progress';
    case 'rejected':
      return 'Resubmit your documents';
    default:
      return 'Verify your identity to unlock all features';
  }
}