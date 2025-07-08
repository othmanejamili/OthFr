import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Clock, ShoppingBag, Star, Award, LogOut, AlertCircle, Settings, Crown, TrendingUp, Calendar, Gift, Zap, ChevronRight, Eye, Download } from 'lucide-react';
import axios from 'axios';
import '../styles/profile.css';

const API_URL =  'http://localhost:8000/api';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [pointHistory, setPointHistory] = useState([]);
  const [spinnerHistory, setSpinnerHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userId } = useParams(); // Get userId from URL params
  const navigate = useNavigate();
  // API configuration
  
  const { currentUser, isAuthenticated ,logout } = useContext(AuthContext);

  // API helper function
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Use the userId from params or from currentUser context
        const userIdToFetch = userId || currentUser?.id;
        // Get token from localStorage or sessionStorage as implemented in AuthContext
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!userIdToFetch || !token) {
          throw new Error('You must be logged in to view this page');
        }
        
        // Using axios instead of fetch to be consistent with AuthContext
        const response = await axios.get(`${API_URL}/users/${userIdToFetch}/`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        
        setUserData(response.data);
        
        // Load initial data for the active tab
        if (activeTab === 'orders') {
          fetchOrders(userIdToFetch, token);
        } else if (activeTab === 'points') {
          fetchPointHistory(userIdToFetch, token);
        } else if (activeTab === 'spinner') {
          fetchSpinnerHistory(userIdToFetch, token);
        }
        
      } catch (err) {
        console.error('Error fetching user data:', err);
        
        // Enhanced error handling similar to AuthContext
        if (err.response) {
          setError(err.response.data?.error || `Error: ${err.response.status}`);
        } else if (err.request) {
          setError('No response from server. Please check your connection.');
        } else {
          setError(err.message || 'Failed to load user profile');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [activeTab, userId, isAuthenticated, navigate, currentUser]);

    const fetchOrders = async (userIdToFetch, token) => {
    try {
      const response = await axios.get(`${API_URL}/orders/users/${userIdToFetch}/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      setOrders(response.data);
      
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (err.response) {
        setError(err.response.data?.error || 'Failed to load orders');
      } else {
        setError('Failed to load orders');
      }
    }
  };

    const fetchPointHistory = async (userIdToFetch, token) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userIdToFetch}/point_history/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      setPointHistory(response.data);
      
    } catch (err) {
      console.error('Error fetching point history:', err);
      if (err.response) {
        setError(err.response.data?.error || 'Failed to load point history');
      } else {
        setError('Failed to load point history');
      }
    }
  };

    const fetchSpinnerHistory = async (userIdToFetch, token) => {
    try {
      const response = await axios.get(`${API_URL}/spinner-history/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      setSpinnerHistory(response.data);
      
    } catch (err) {
      console.error('Error fetching spinner history:', err);
      if (err.response) {
        setError(err.response.data?.error || 'Failed to load spinner history');
      } else {
        setError('Failed to load spinner history');
      }
    }
  };

  // Calculate membership level based on total spent or points
  const calculateMembershipLevel = (totalSpent, points) => {
    if (totalSpent >= 1000 || points >= 2000) return 'Platinum';
    if (totalSpent >= 500 || points >= 1000) return 'Gold';
    if (totalSpent >= 200 || points >= 500) return 'Silver';
    return 'Bronze';
  };



  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getMembershipClass = (level) => {
    switch(level) {
      case 'Platinum': return 'membership-platinum';
      case 'Gold': return 'membership-gold';
      case 'Silver': return 'membership-silver';
      default: return 'membership-default';
    }
  };

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'shipped': return 'status-shipped';
      case 'processing': return 'status-processing';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-processing';
    }
  };

  const getTransactionClass = (type) => {
    switch(type?.toLowerCase()) {
      case 'earned': return 'transaction-earned';
      case 'spent': return 'transaction-spent';
      default: return 'transaction-bonus';
    }
  };

  const handleLogout = () => {
    // Use the logout function from AuthContext
    logout();
    // Navigate to login page
    navigate('/login');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'points', label: 'Points', icon: Star },
    { id: 'rewards', label: 'Rewards', icon: Gift }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-ring animate-spin"></div>
          <div className="spinner-ring-secondary animate-spin animation-delay-150"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <div className="error-header">
            <AlertCircle />
            <span>Error Loading Profile</span>
          </div>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        <button onClick={logout}>Logout</button>

        {/* Header Card */}
        <div className="header-card">
          <div className="header-gradient">
            <div className="bg-pattern"></div>
            <div className="header-content">
              {/* Avatar */}
              <div className="avatar-container">
                <div className="avatar">
                    
                </div>
                <div className={`membership-badge ${getMembershipClass(userData.membershipLevel)}`}>
                  <Crown />
                </div>
              </div>

              {/* User Info */}
              <div className="user-info">
                <div className="user-header">
                  <h1 className="user-name">{userData.username}</h1>
                  {userData.isAdmin && (
                    <div className="admin-badge">ADMIN</div>
                  )}
                </div>
                <p className="user-email">{userData.email}</p>
                <div className="user-meta">
                  <div className="user-meta-item">
                    <Calendar />
                    <span>Member since {formatDate(userData?.created_at)}</span>
                  </div>
                  <div className="user-meta-item">
                    <Crown />
                    <span>Member</span>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="stats-container">
                <div className="stat-card">
                  <div className="stat-content">
                    <div className="stat-icon stat-icon-points">
                      <Star />
                    </div>
                    <div>
                      <p className="stat-value">{userData?.points.toLocaleString()}</p>
                      <p className="stat-label">Points</p>
                    </div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-content">
                    <div className="stat-icon stat-icon-spent">
                      <TrendingUp />
                    </div>
                    <div>
                      <p className="stat-value">$</p>
                      <p className="stat-label">Total Spent</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <div className="tabs-wrapper">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <Icon />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          
                <div className="section-header">
                  <h2 className="section-title">Account Information</h2>
                  <button className="edit-profile-btn">
                    <span>Edit Profile</span>
                  </button>
                </div>

                <div className="profile-grid">
                  <div className="info-card">
                    <h3 className="card-title">Personal Details</h3>
                    <div className="info-list">
                      <div className="info-item">
                        <span className="info-label">Username</span>
                        <span className="info-value">{userData?.username}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Email</span>
                        <span className="info-value">{userData.email}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Member Level</span>
                        <span className={`info-value membership-text ${getMembershipClass(userData.membershipLevel)}`}>
                          {userData.membershipLevel}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Last Updated</span>
                        <span className="info-value">{formatDate(userData.updated_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="stats-card">
                    <h3 className="card-title">Account Statistics</h3>
                    <div className="info-list">
                      <div className="info-item">
                        <span className="info-label">Total Orders</span>
                        <span className="info-value stat-number">{userData.totalOrders}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Points Balance</span>
                        <span className="info-value stat-number points">{userData.points}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Total Spent</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="action-buttons">
                  <button className="logout-btn" onClick={logout}>

                    <span>Log Out</span>
                  </button>
                  {userData.isAdmin && (
                    <button className="admin-btn">
                      <Crown />
                      <span>Admin Dashboard</span>
                    </button>
                  )}
                </div>
            
            {activeTab === 'orders' && (
              <div className="profile-section">
                <div className="orders-header">
                  <h2 className="section-title">Order History</h2>
                  <div className="orders-count">
                    <span>{orders.length} total orders</span>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="empty-state">
                    <ShoppingBag />
                    <p>No orders yet</p>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.map((order) => (
                      <div key={order.id} className="order-card">
                        <div className="order-header">
                          <div className="order-meta">
                            <span className="order-id">Order #{order.id}</span>
                            <span className={`order-status ${getStatusClass(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <button className="view-order-btn">
                            <Eye />
                          </button>
                        </div>
                        
                        <div className="order-content">
                          <div className="order-info">
                            <div className="order-date">
                              <Clock />
                              <span>{formatDate(order.created_at)}</span>
                            </div>
                            <div className="order-total">${order.total_amount}</div>
                          </div>
                          
                          <div className="order-items">
                            <h4>Items:</h4>
                            {order.items.map((item) => (
                              <div key={item.id} className="order-item">
                                <span className="item-name">{item.quantity} × {item.product_details.name}</span>
                                <span className="item-price">${item.price_at_purchase}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'points' && (
              <div className="profile-section">
                <div className="section-header">
                  <h2 className="section-title">Points History</h2>
                  <button className="export-btn">
                    <Download />
                    <span>Export</span>
                  </button>
                </div>

                {pointHistory.length === 0 ? (
                  <div className="empty-state">
                    <Star />
                    <p>No points history</p>
                  </div>
                ) : (
                  <div className="points-table-container">
                    <div className="points-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Transaction</th>
                            <th>Points</th>
                            <th>Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pointHistory.map((record) => (
                            <tr key={record.id}>
                              <td>{formatDate(record.created_at)}</td>
                              <td>
                                <span className={`transaction-badge ${getTransactionClass(record.transaction_type)}`}>
                                  {record.transaction_type.charAt(0).toUpperCase() + record.transaction_type.slice(1)}
                                </span>
                              </td>
                              <td>
                                <span className={`points-change ${record.points > 0 ? 'points-positive' : 'points-negative'}`}>
                                  {record.points > 0 ? '+' : ''}{record.points}
                                </span>
                              </td>
                              <td>
                                <span className="points-description">{record.description}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rewards' && (
              <div className="profile-section">
                <div className="rewards-header">
                  <h2 className="section-title">Spinner Rewards History</h2>
                  <div className="rewards-count">
                    <Zap />
                    <span>{spinnerHistory.length} rewards claimed</span>
                  </div>
                </div>

                {spinnerHistory.length === 0 ? (
                  <div className="empty-state">
                    <Gift />
                    <p>No rewards claimed yet</p>
                    <button className="try-luck-btn">
                      Try Your Luck Now!
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="rewards-list">
                      {spinnerHistory.map((record) => (
                        <div key={record.id} className="reward-card">
                          <div className="reward-header">
                            <div className="reward-info">
                              <div className="reward-icon">
                                <Gift />
                              </div>
                              <div>
                                <h3 className="reward-name">{record.spinner_reward?.name}</h3>
                                <p className="reward-date">{formatDate(record.created_at)}</p>
                              </div>
                            </div>
                            <div className="reward-cost">
                              <div className="cost-amount">-{record.points_spent}</div>
                              <div className="cost-label">points spent</div>
                            </div>
                          </div>
                          
                          <div className="reward-details">
                            <div className="reward-detail">
                              <div className="detail-label">Reward Type</div>
                              <div className="detail-value detail-type">{record.spinner_reward?.reward_type}</div>
                            </div>
                            <div className="reward-detail">
                              <div className="detail-label">Value</div>
                              <div className="detail-value detail-reward-value">{record.spinner_reward?.value}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="spinner-cta">
                      <div className="spinner-cta-content">
                        <div className="spinner-cta-header">
                          <Zap />
                          <h3 className="spinner-cta-title">Ready for More Rewards?</h3>
                        </div>
                        <p className="spinner-cta-text">
                          Spin the wheel of fortune and unlock amazing rewards! Use your points to get discounts, free products, and bonus points.
                        </p>
                        <button className="spinner-cta-btn">
                          <span>Go to Spinner</span>
                          <ChevronRight />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 