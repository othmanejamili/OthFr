import React, { useState } from 'react';
import { Gift, Bell } from 'lucide-react';
import '../../styles/Gift/gift.css';

const GiftOutOfStock = ({ productName = "Premium Gift Set" }) => {
  const [email, setEmail] = useState('');
  const [isNotified, setIsNotified] = useState(false);

  const handleNotifyMe = () => {
    if (email.trim()) {
      setIsNotified(true);
      setEmail('');
      setTimeout(() => setIsNotified(false), 3000);
    }
  };

  return (
    <div className="out-of-stock-container">
      <div className="gift-icon">
        <Gift size={48} />
      </div>
      
      <h2 className="title">Out of Stock</h2>
      <p className="product-name">{productName}</p>
      <p className="message">This item is currently unavailable</p>
      
      {!isNotified ? (
        <div className="notify-section">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="email-input"
          />
          <button onClick={handleNotifyMe} className="notify-btn">
            <Bell size={16} />
            Notify Me
          </button>
        </div>
      ) : (
        <div className="success-message">
          <div className="checkmark">✓</div>
          <p>We'll notify you when it's back!</p>
        </div>
      )}
      
    </div>
  );
};

export default GiftOutOfStock;