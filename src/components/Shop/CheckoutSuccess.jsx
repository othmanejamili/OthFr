import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../styles/checkoutSeccuss.css'; // Make sure the filename matches

const CheckoutSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;
  
  useEffect(() => {
    // Set page title
    document.title = 'Order Confirmation';
  }, []);

  // If somehow user got here without an orderId, redirect them
  if (!orderId) {
    return (
      <div className="error-container">
        <h1 className="error-title">Order Information Not Found</h1>
        <p className="error-message">
          We couldn't find information about your order. You may have refreshed the page or accessed this page directly.
        </p>
        <button
          onClick={() => navigate('/product')}  
          className="action-btn primary-btn"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-success-container">
      <div className="success-card">
        <div className="success-header">
          <div className="success-icon-wrapper">
            <svg className="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="success-title">Order Confirmed!</h1>
          <p className="success-subtitle">Thank you for your purchase</p>
        </div>
        
        <div className="order-info-panel">
          <div className="info-row">
            <span className="info-label">Order Number:</span>
            <span className="info-value order-id">{orderId}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Order Date:</span>
            <span className="info-value">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="details-section">
          <h2 className="section-title">Order Details</h2>
          <p className="details-text">
            We've sent a confirmation email with your order details and tracking information.
          </p>
          <p className="details-text">
            Your order will be processed within 1-2 business days.
          </p>
        </div>
        
        <div className="help-section">
          <h2 className="section-title">Need Help?</h2>
          <p className="details-text">
            If you have any questions or concerns about your order, please contact our customer service:
          </p>
          <a href="mailto:support@example.com" className="contact-link">
            support@example.com
          </a>
        </div>
        
        <div className="actions-container">
          {/* Only show this button if you actually have an order history page */}
          <button
            onClick={() => navigate('/profile/orders')}
            className="action-btn primary-btn"
          >
            View My Orders
          </button>
          
          <button
            onClick={() => navigate('/product')}
            className="action-btn secondary-btn"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;