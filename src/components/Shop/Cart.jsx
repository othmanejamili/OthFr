import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import LuxuryCartItem from './LuxuryCartItem';
import '../../styles/Cart.css'; // Import the premium CSS

const LuxuryCart = () => {
  const { items, totalItems, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Your Cart (DHD{totalItems})`;
  }, [totalItems]);

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/product');
  };


  // If cart is empty, show elegant empty state
  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="luxury-cart-container luxury-empty-cart">
          <h1>Your Shopping Collection is Empty</h1>
          <p>
            Discover our curated selection of premium products and start building your collection.
            Our exclusive items are waiting for you.
          </p>
          <button 
            onClick={handleContinueShopping}
            className="luxury-btn-primary"
          >
            Explore Collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="luxury-cart-container">
        <div className="luxury-header">
          <h1>Your Exclusive Collection</h1>
        </div>
        
        {/* Cart Items Container */}
        <div className="mb-8">
          <div className="hidden md:grid md:grid-cols-6 luxury-table-header">
            <div className="col-span-3">PRODUCT</div>
            <div className="text-center">PRICE</div>
            <div className="text-center">QUANTITY</div>
            <div className="text-right">TOTAL</div>
          </div>
          
          {items.map((item, index) => (
            <LuxuryCartItem key={item.id} item={item} index={index} />
          ))}
        </div>
        
        {/* Cart Summary and Actions */}
        <div className="md:flex md:justify-between">
          {/* Cart Summary */}
          <div className="md:w-1/3 mb-6 md:mb-0">
            <div className="luxury-summary">
              <h2>Order Summary</h2>
              
              <div className="luxury-summary-row">
                <span>Subtotal ({totalItems} items)</span>
                <span>DHD{totalAmount.toFixed(2)}</span>
              </div>
              
              <div className="luxury-summary-row">
                <span>Shipping</span>
                <span>Complimentary</span>
              </div>
              
              <div className="luxury-summary-row">
                <span>Tax</span>
                <span>Calculated at checkout</span>
              </div>
              

              
              <div className="luxury-divider"></div>
              
              <div className="luxury-summary-total">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>DHD{totalAmount.toFixed(2)}</span>
                </div>
                

              </div>
            </div>
          </div>
          
          {/* Cart Actions */}
          <div className="md:w-1/2 md:pl-8">
            <div className="space-y-4">
              <button
                onClick={handleCheckout}
                className="luxury-btn-primary"
              >
                Complete Your Purchase
              </button>
              
              <button
                onClick={handleContinueShopping}
                className="luxury-btn-secondary"
              >
                Continue Exploring
              </button>
              
              <button
                onClick={clearCart}
                className="luxury-btn-text"
              >
                Clear Collection
              </button>
            </div>
            
            <div className="luxury-support-info">
              <p className="text-sm">
                For personalized assistance with your order, our dedicated concierge team is available at{" "}
                <a href="mailto:support@example.com" className="font-medium text-black hover:text-black">
                  support@oj.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuxuryCart;