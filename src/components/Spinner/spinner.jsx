import React, { useState } from 'react';
import { RotateCcw, Bell, Gift } from 'lucide-react';
import '../../styles/Spinner/spinner.css';

const SpinToWinUnavailable = ({ 
  title = "Spin to Win!",
  message = "Prize wheel is temporarily unavailable" 
}) => {
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
    <div>
        <div className="header">
            <h1>This Part unavailable</h1>
            <p>This item is currently unavailable</p>
        </div>
        <div className="spin-unavailable-container">
        <div className="wheel-container">
            <div className="wheel-disabled">
            <div className="wheel-segments">
                <div className="segment segment-1"></div>
                <div className="segment segment-2"></div>
                <div className="segment segment-3"></div>
                <div className="segment segment-4"></div>
                <div className="segment segment-5"></div>
                <div className="segment segment-6"></div>
            </div>
            <div className="wheel-center">
                <RotateCcw size={24} />
            </div>
            </div>
            <div className="unavailable-overlay">
            <span>Coming Soon</span>
            </div>
        </div>
        
        <h2 className="title">{title}</h2>
        <p className="message">{message}</p>
        
        <div className="prizes-preview">
            <div className="prize-item">
            <Gift size={16} />
            <span>Free Gift</span>
            </div>
            <div className="prize-item">
            <span>🎁</span>
            <span>10% Off</span>
            </div>
            <div className="prize-item">
            <span>💎</span>
            <span>Points</span>
            </div>
        </div>
        
        {!isNotified ? (
            <div className="notify-section">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Get notified when available"
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
            <p>We'll notify you when the wheel is ready!</p>
            </div>
        )}
        </div>
    </div>
  );
};

export default SpinToWinUnavailable;