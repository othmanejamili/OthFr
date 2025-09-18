import React from "react";
import { useFavourite } from "../../context/FavouriteContext";
import '../../styles/Cart.css'; 

const FavouriteItem = ({item, index}) => {
    const {removeItem} = useFavourite();

    return(
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
            </div>
          </div>
          
          {/* Price */}
          <div className="text-center mt-4 md:mt-0">
            <div className="luxury-price">DHD{item.price.toFixed(2)}</div>
          </div>
          
                  
          {/* Total and Remove button */}
          <div className="text-right flex flex-col items-end mt-4 md:mt-0">
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

export default FavouriteItem;