import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/order.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`https://othy.pythonanywhere.com/api/orders/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Fetched Orders:', response.data);
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      
      if (err.response) {
        console.error('Response Error Details:', {
          status: err.response.status,
          data: err.response.data
        });
      }
      
      if (err.response) {
        switch (err.response.status) {
          case 401:
            localStorage.removeItem('token');
            navigate('/login');
            break;
          case 403:
            setError('You do not have permission to view orders');
            break;
          case 404:
            setError('Orders endpoint not found');
            break;
          default:
            setError(err.response.data?.message || 'Failed to load orders. Please try again.');
        }
      } else if (err.request) {
        setError('No response from server. Please check your network connection.');
      } else {
        setError('Error setting up the request. Please try again.');
      }
      
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      await axios.patch(
        `https://othy.pythonanywhere.com/api/orders/${orderId}/`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update the order in the local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      
      if (err.response) {
        switch (err.response.status) {
          case 401:
            localStorage.removeItem('token');
            navigate('/login');
            break;
          case 403:
            alert('You do not have permission to update order status');
            break;
          default:
            alert(err.response?.data?.message || 'Failed to update order status. Please try again.');
        }
      } else {
        alert('Network error. Please check your connection and try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Updated function to correctly get customer name
  const getCustomerName = (order) => {
    // First try to use the customer_name field from the serializer
    if (order.customer_name) {
      return order.customer_name;
    }
    
    // Fall back to checking if order has user_details
    if (order.user_details) {
      const { first_name, last_name, username, email } = order.user_details;
      if (first_name && last_name) {
        return `${first_name} ${last_name}`;
      }
      return first_name || last_name || username || email || 'Guest';
    }
    
    // Finally fall back to direct user object if it exists
    if (order.user) {
      return `${order.user.first_name || ''} ${order.user.last_name || ''}`.trim() || 
             order.user.username || order.user.email || 'Guest';
    }
    
    // If no user details are available, use guest email or default to Guest
    return order.guest_email || 'Guest';
  };

  // Get customer email appropriately
  const getCustomerEmail = (order) => {
    if (order.user_details) {
      return order.user_details.email || 'No email';
    } else if (order.user) {
      return order.user.email || 'No email';
    }
    return order.guest_email || 'No email provided';
  };

  // Filtering orders based on status
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  // Searching orders
  const searchedOrders = filteredOrders.filter(order => {
    if (!searchTerm) return true;
    
    const orderNumber = order.id.toString();
    const customerName = getCustomerName(order);
    const email = getCustomerEmail(order);
    
    const search = searchTerm.toLowerCase();
    return (
      orderNumber.includes(search) || 
      customerName.toLowerCase().includes(search) ||
      email.toLowerCase().includes(search)
    );
  });

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = searchedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(searchedOrders.length / ordersPerPage);

  const paginate = (pageNumber) => {
    // Ensure page number is within valid range
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Status badge styling
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-badge pending';
      case 'processing':
        return 'status-badge processing';
      case 'shipped':
        return 'status-badge shipped';
      case 'delivered':
        return 'status-badge delivered';
      case 'cancelled':
        return 'status-badge cancelled';
      default:
        return 'status-badge';
    }
  };

  // Handle refresh orders
  const handleRefreshOrders = () => {
    fetchOrders();
  };

  return (
    <div className="content"> 
      <div className="admin-orders">
        <div className="orders-header">
          <h1>Order Management</h1>
          <div className="orders-actions">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by order #, customer, or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search orders"
              />
              <button 
                className="refresh-btn" 
                onClick={handleRefreshOrders}
                aria-label="Refresh orders"
              >
                ↻ Refresh
              </button>
            </div>
            <div className="filter-controls">
              <button 
                className={filter === 'all' ? 'active' : ''} 
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={filter === 'pending' ? 'active' : ''} 
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
              <button 
                className={filter === 'processing' ? 'active' : ''} 
                onClick={() => setFilter('processing')}
              >
                Processing
              </button>
              <button 
                className={filter === 'shipped' ? 'active' : ''} 
                onClick={() => setFilter('shipped')}
              >
                Shipped
              </button>
              <button 
                className={filter === 'delivered' ? 'active' : ''} 
                onClick={() => setFilter('delivered')}
              >
                Delivered
              </button>
              <button 
                className={filter === 'cancelled' ? 'active' : ''} 
                onClick={() => setFilter('cancelled')}
              >
                Cancelled
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            {error}
            <button onClick={handleRefreshOrders} className="retry-btn">Retry</button>
          </div>
        ) : (
          <>
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Items</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.length > 0 ? (
                    currentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>
                          <div className="customer-info">
                            <div className="customer-name">
                              {getCustomerName(order)}
                            </div>
                            <div className="customer-email">
                              {getCustomerEmail(order)}
                            </div>
                          </div>
                        </td>
                        <td>{formatDate(order.created_at)}</td>
                        <td>
                          <span className={getStatusBadgeClass(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td>${(order.total_amount || 0)}</td>
                        <td>{order.items?.length || 0}</td>
                        <td>
                          <div className="order-actions">
                            <Link to={`/admin/orders/details/${order.id}`} className="view-btn">
                              View
                            </Link>
                            <select 
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className="status-select"
                              aria-label={`Change status for order #${order.id}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-orders">
                        {searchTerm || filter !== 'all' ? 'No orders match your search/filter criteria' : 'No orders found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="pagination">
                <button 
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                  aria-label="Previous page"
                >
                  &laquo; Previous
                </button>
                <div className="page-numbers">
                  {[...Array(totalPages).keys()].map(number => (
                    <button
                      key={number + 1}
                      onClick={() => paginate(number + 1)}
                      className={`pagination-btn ${currentPage === number + 1 ? 'active' : ''}`}
                      aria-label={`Page ${number + 1}`}
                      aria-current={currentPage === number + 1 ? 'page' : undefined}
                    >
                      {number + 1}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="pagination-btn"
                  aria-label="Next page"
                >
                  Next &raquo;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div> 
  );
};

export default AdminOrders;
