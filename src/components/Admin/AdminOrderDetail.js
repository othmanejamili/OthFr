import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/orderDetails.css'

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');





  useEffect(() => {
    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`https://othy.pythonanywhere.com/api/orders/${id}/`, {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            }
          });
          setOrder(response.data);
          setStatus(response.data.status);
          setNotes(response.data.notes || '');
          setLoading(false);
        } catch (err) {
          console.error('Error fetching order details:', err);
          setError('Failed to load order details. Please try again.');
          setLoading(false);
        }
      };

    fetchOrderDetails();
  }, [id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `https://othy.pythonanywhere.com/api/orders/${id}/`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update the local state
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status. Please try again.');
      // Revert to the previous status
      setStatus(order.status);
    }
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const saveNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `https://othy.pythonanywhere.com/api/orders/${id}/`,
        { notes },
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update the local state
      setOrder({ ...order, notes });
      alert('Notes saved successfully!');
    } catch (err) {
      console.error('Error saving notes:', err);
      alert('Failed to save notes. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

  const calculateTotalWithAdditions = () => {
    if (!order) return 0;
    
    const subtotal = order.items?.reduce((sum, item) => 
      sum + (item.price_at_purchase * item.quantity), 0) || 0;
    
    const shippingCost = order.shipping_cost || 0;
    const tax = order.tax || 0;
    
    return subtotal + shippingCost + tax;
  };

  const handlePrintOrder = () => {
    window.print();
  };

  const handleEmailCustomer = () => {
    // Implement email functionality or open email client
    const email = order.user.email || order.guest_email;
    if (email) {
      window.location.href = `mailto:${email}?subject=Your Order #${id}`;
    } else {
      alert('No email address available for this customer.');
    }
  };

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

    const getCustomerEmail = (order) => {
    if (order.user_details) {
      return order.user_details.email || 'No email';
    } else if (order.user) {
      return order.user.email || 'No email';
    }
    return order.guest_email || 'No email provided';
  };

  const getCustomerPhone = (order) => {
    if (order.user_details) {
      return order.user_details.phone_number || 'No email';
    } else if (order.user) {
      return order.user.phone_number || 'No Phone Number';
    }
    return order.guest_phone_numbre || 'No Phone Number provided';
  };

  return (
    <div className="admin-order-detail">
      <div className="order-detail-header">
        <button onClick={() => navigate('/admin/orders')} className="back-button">
          &larr; Back to Orders
        </button>
        <h1>Order #{id}</h1>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading order details...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : order ? (
        <div className="order-details-container">
          <div className="order-details-grid">
            {/* Order Summary */}
            <div className="order-summary">
              <h2>Order Summary</h2>
              <div className="summary-content">
                <div className="summary-row">
                  <span>Order Date:</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
                <div className="summary-row">
                  <span>Status:</span>
                  <div className="status-select-container">
                    <select 
                      value={status}
                      onChange={handleStatusChange}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <span className={getStatusBadgeClass(status)}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="summary-row">
                  <span>Payment Method:</span>
                  <span>{order.payment_method || 'Not specified'}</span>
                </div>
                <div className="summary-row">
                  <span>Total Amount:</span>
                  <span className="total-amount">${calculateTotalWithAdditions()}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="customer-details">
              <h2>Customer Information</h2>
              <div className="details-content">
                <div className="customer-name">
                  {order.user ? (
                    <>
                      <span className="label">Name:</span>
                      <span>{getCustomerName(order)}</span>
                    </>
                  ) : (
                    <>
                      <span className="label">Guest Order</span>
                    </>
                  )}
                </div>
                <div className="customer-email">
                  <span className="label">Email:</span>
                  <span>{getCustomerEmail(order)}</span>
                </div>
                <div className="customer-phone">
                  <span className="label">Phone:</span>
                  <span>{getCustomerPhone(order)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="shipping-details">
              <h2>Shipping Information</h2>
              <div className="details-content">
                <div className="shipping-address">
                  <div className="shipping-address">
                    <span className="label">Address :</span>
                    <span>{order.address || 'No address provided'}</span>
                  </div>
                  <div className="shipping-address">
                    <span className="label">City :</span>
                    <span>{order.city || 'No city provided'}</span>
                  </div>
                  <div className="shipping-address">
                    <span className="label">Region :</span>
                    <span>{order.region || 'No city provided'}</span>
                  </div>
                  <div className="shipping-address">
                    <span className="label">Note for order :</span>
                    <span>{order.note || 'No Note provided'}</span>
                  </div>
                </div>
                <div className="shipping-method">
                  <span className="label">Shipping Method:</span>
                  <span>Pay cash on delivery.</span>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div className="order-notes">
              <h2>Order Notes</h2>
              <div className="notes-content">
                <textarea 
                  placeholder="Add notes about this order"
                  value={notes}
                  onChange={handleNotesChange}
                  className="notes-textarea"
                ></textarea>
                <button className="save-notes-btn" onClick={saveNotes}>Save Notes</button>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="order-items-section">
            <h2>Order Items</h2>
            <div className="order-items-table-container">
              <table className="order-items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                {order?.items && order.items.length > 0 ? (
                    order.items.map((item) => (
                    <tr key={item.id}>
                        <td className="product-cell">
                        <div className="product-info">
                        {item.product_details?.image_list?.length > 0 && (
                          <img
                            src={item.product_details.image_list[0].image}
                            alt={item.product_details.name || 'Product'}
                            className="product-thumbnail"
                          />
                        )}

                            <div className="product-name">
                            {item.product?.name || 'Unknown Product'}
                            </div>
                        </div>
                        </td>
                        <td>${(item.price_at_purchase || 0)}</td>
                        <td>{item.quantity || 0}</td>
                        <td>
                        ${((item.price_at_purchase || 0) * (item.quantity || 0))}
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan="4" className="no-items">
                        No items found
                    </td>
                    </tr>
                )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="subtotal-label">Subtotal</td>
                    <td className="subtotal-value">
                      ${order.items?.reduce((sum, item) => sum + ((item.price_at_purchase || 0) * (item.quantity || 0)), 0)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="shipping-label">Shipping</td>
                    <td className="shipping-value">${order.shipping_cost ? order.shipping_cost : '0.00'}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="tax-label">Tax</td>
                    <td className="tax-value">${order.tax ? order.tax : '0.00'}</td>
                  </tr>
                  <tr className="total-row">
                    <td colSpan="3" className="total-label">Total</td>
                    <td className="total-value">${calculateTotalWithAdditions()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="order-actions-footer">
            <button className="print-order-btn" onClick={handlePrintOrder}>Print Order</button>
            <button className="email-customer-btn" onClick={handleEmailCustomer}>Email Customer</button>
            {status !== 'cancelled' && (
              <button 
                className="cancel-order-btn"
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel this order?')) {
                    const event = { target: { value: 'cancelled' } };
                    setStatus('cancelled');
                    handleStatusChange(event);
                  }
                }}
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="not-found">Order not found</div>
      )}
    </div>
  );
};

export default AdminOrderDetail;
