import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import '../styles/checkout.css';

const Checkout = () => {
  const { items, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: isAuthenticated && currentUser ? currentUser.email : '',
    phone_number: isAuthenticated && currentUser ? currentUser.phone_number : '',
    address: '',
    city: '',
    region: '',
    note: '',
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/product'); 
    }
  }, [items, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    try {
      const token = localStorage.getItem('token');
      
      // Setup headers with token authentication
      const headers = token ? { 
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      } : {
        'Content-Type': 'application/json'
      };
  
      // First create the order - Make sure total_amount is formatted properly
      const orderData = {
        total_amount: parseFloat(totalAmount.toFixed(2)), // Ensure it's a valid number
        status: 'pending',
        address: formData.address,
        city: formData.city,
        region: formData.region,
        note: formData.note,
      };
      
      // Add guest_email only if user is not authenticated
      if (!isAuthenticated && formData.email) {
        orderData.guest_email = formData.email;
      }

      if (!isAuthenticated && formData.phone_number) {
        orderData.guest_phone_numbre = formData.phone_number; 
      }
  
      console.log('Sending order data:', orderData);
      
      const orderResponse = await axios.post(
        'https://othy.pythonanywhere.com/api/orders/',
        orderData,
        { headers }
      );
  
      console.log('Order created successfully:', orderResponse.data);
  
      // Then add each item to the order
      const orderId = orderResponse.data.id;
      
      // Use the same headers for order item creation
      // Create an array of promises for each item
      const itemPromises = items.map((item) => {
        const orderItemData = {
          order: orderId,
          product_id: item.id,  // Changed from 'product' to 'product_id' to match serializer
          quantity: item.quantity,
        };
        
        console.log('Adding item to order:', orderItemData);
        
        return axios.post(
          'https://othy.pythonanywhere.com/api/order-items/',
          orderItemData,
          { headers }
        );
      });
  
      // Wait for all items to be added
      await Promise.all(itemPromises);
      console.log('All items added to order successfully');
  
      // Clear the cart and redirect to success page
      clearCart();
      navigate('/checkout/success', { state: { orderId: orderId } });
    } catch (err) {
      console.error('Checkout error:', err);
      
      // More detailed error logging
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        
        // Use specific error message from the server if available
        if (err.response.data) {
          if (typeof err.response.data === 'string') {
            setError(err.response.data);
          } else if (err.response.data.error) {
            setError(err.response.data.error);
          } else if (err.response.data.detail) {
            setError(err.response.data.detail);
          } else {
            // Try to extract error messages from the response data object
            const errorMessages = [];
            Object.keys(err.response.data).forEach(key => {
              const value = err.response.data[key];
              if (Array.isArray(value)) {
                errorMessages.push(`${key}: ${value.join(', ')}`);
              } else {
                errorMessages.push(`${key}: ${value}`);
              }
            });
            
            if (errorMessages.length > 0) {
              setError(errorMessages.join('\n'));
            } else {
              setError(`Request failed with status code ${err.response.status}`);
            }
          }
        } else {
          setError(`Request failed with status code ${err.response.status}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Error request:', err.request);
        setError('No response received from server. Please check your connection and try again.');
      } else {
        // Something happened in setting up the request
        console.error('Error message:', err.message);
        setError('An error occurred while setting up the request: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="luxury-checkout-container">
        <div className="md:flex md:gap-8">
          {/* Left side - Order Summary */}
          <div className="md:w-1/2">
            <div className="luxury-section-header">
              <h2>Order Summary</h2>
            </div>
            <div className="luxury-order-summary">
              {items.map((item) => (
                <div key={item.id} className="luxury-order-item">
                  <div className="luxury-item-image">
                    {item.image && <img src={item.image} alt={item.name} />}
                  </div>
                  <div className="luxury-item-details">
                    <p className="luxury-item-name">{item.name}</p>
                    <p className="luxury-item-quantity">Qty: {item.quantity}</p>
                  </div>
                  <p className="luxury-item-price">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              
              <div className="luxury-divider"></div>
              
              <div className="luxury-summary-row">
                <p>Subtotal</p>
                <p>${totalAmount.toFixed(2)}</p>
              </div>
              <div className="luxury-summary-row">
                <p>Shipping</p>
                <p>Calculated at next step</p>
              </div>
              <div className="luxury-divider"></div>
              <div className="luxury-summary-total">
                <p>Total</p>
                <p>${totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Right side - Checkout Form */}
          <div className="md:w-1/2 mt-8 md:mt-0">
            <div className="luxury-section-header">
              <h2>Shipping Information</h2>
            </div>

            {error && (
              <div className="luxury-error-message">
                {error}
              </div>
            )}

            <div className="luxury-form-container">
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isAuthenticated && (
                  <div className="luxury-form-group">
                    <label htmlFor="email" className="luxury-form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="luxury-form-input"
                    />
                  </div>
                )}

                {!isAuthenticated && (
                  <div className="luxury-form-group">
                    <label htmlFor="phone_number" className="luxury-form-label">
                      Phone Number Address
                    </label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      required
                      className="luxury-form-input"
                    />
                  </div>
                )}

                <div className="luxury-form-group">
                  <label htmlFor="address" className="luxury-form-label">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="luxury-form-input"
                  />
                </div>

                <div className="luxury-form-grid">
                  <div className="luxury-form-group">
                    <label htmlFor="city" className="luxury-form-label">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="luxury-form-input"
                    />
                  </div>
                  <div className="luxury-form-group">
                    <label htmlFor="region" className="luxury-form-label">
                      Region/Province
                    </label>
                    <input
                      type="text"
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      required
                      className="luxury-form-input"
                    />
                  </div>
                </div>

                <div className="luxury-form-grid">
                  <div className="luxury-form-group">
                    <label htmlFor="note" className="luxury-form-label">
                      note
                    </label>
                    <textarea
                      placeholder="Add notes about this order"
                      id="note"
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      required
                      className="luxury-form-input"
                    ></textarea>
                  </div>
                </div>

                <div className="luxury-support-info">
                  <strong>Payment on delivery : Pay cash on delivery.</strong> 
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`luxury-btn-primary ${isLoading ? 'loading' : ''}`}
                  >
                    {isLoading ? 'Processing...' : 'Place Order'}
                  </button>
                </div>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/product')}
                    className="luxury-btn-secondary"
                  >
                    Continue Shopping
                  </button>
                </div>
              </form>
            </div>
            
            <div className="luxury-support-info">
              <strong>Need help?</strong> Our customer service team is available 24/7 to assist you with your order.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
