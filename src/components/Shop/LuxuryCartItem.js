import React from 'react';
import { useCart } from '../../context/CartContext';
import '../../styles/Cart.css';

const LuxuryCartItem = ({ item, index }) => {
  const { removeItem, updateQuantity } = useCart();
  
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(item.id, newQuantity);
    }
  };

  // Calculate item discount if original price exists
  const hasDiscount = item.originalPrice && item.originalPrice > item.price;
  const discountPercentage = hasDiscount ? 
    Math.round((1 - item.price / item.originalPrice) * 100) : 0;

  return (
    <div className="luxury-item" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="md:grid md:grid-cols-6 gap-6 items-center">
        {/* Product Image and Details */}
        <div className="md:col-span-3 flex items-center space-x-5">
          <div className="flex-shrink-0 w-24 h-24 luxury-image-container">
            <img 
              src={item.image} 
              alt={item.name}
              className="luxury-image h-full w-full object-cover" 
            />
          </div>
          
          <div>
            <h3 className="luxury-product-title">{item.name}</h3>
            <p className="luxury-product-desc">{item.description}</p>
            
            {hasDiscount && (
              <div className="mt-1">
                <span className="luxury-savings text-xs">Save {discountPercentage}%</span>
              </div>
            )}
            
            <button 
              onClick={() => removeItem(item.id)}
              className="luxury-remove-btn mt-2 md:hidden"
            >
              Remove
            </button>
          </div>
        </div>
        
        {/* Price */}
        <div className="text-center mt-4 md:mt-0">
          <div className="luxury-price">${item.price.toFixed(2)}</div>
          {hasDiscount && (
            <div className="text-gray-400 line-through text-sm mt-1">
              ${item.originalPrice.toFixed(2)}
            </div>
          )}
        </div>
        
        {/* Quantity Controls */}
        <div className="text-center mt-4 md:mt-0">
          <div className="luxury-quantity-controls mx-auto">
            <button 
              className="luxury-quantity-btn"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <input 
              type="text" 
              value={item.quantity}
              onChange={(e) => {
                const newQty = parseInt(e.target.value);
                if (!isNaN(newQty)) handleQuantityChange(newQty);
              }}
              className="luxury-quantity-input"
              aria-label="Item quantity"
            />
            <button 
              className="luxury-quantity-btn"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
        
        {/* Total and Remove button */}
        <div className="text-right flex flex-col items-end mt-4 md:mt-0">
          <span className="luxury-total">${(item.price * item.quantity).toFixed(2)}</span>
          
          {hasDiscount && (
            <span className="text-gray-400 line-through text-sm">
              ${(item.originalPrice * item.quantity).toFixed(2)}
            </span>
          )}
          
          <button 
            onClick={() => removeItem(item.id)}
            className="luxury-remove-btn mt-3 hidden md:flex"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default LuxuryCartItem;