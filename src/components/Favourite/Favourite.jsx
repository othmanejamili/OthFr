import React from "react";
import { useFavourite } from "../../context/FavouriteContext";
import { useNavigate } from "react-router-dom";
import FavouriteItem from "./FavouriteItem";
import '../../styles/Cart.css'; 

const Favourite = () => {
    const {items, totalitems, clearFavourite} = useFavourite();
    const navigate = useNavigate();

    const handleContinueShopping = () => {
        navigate('/product');
    }

    if(items.length === 0) {
        return(
            <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="luxury-cart-container luxury-empty-cart">
              <h1>Your Favourite Collection is Empty</h1>
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
            <h1>Your Exclusive Favourite Collection</h1>
          </div>
          <div className="mb-8">
            <p className="col-span-3">Total items: {totalitems}</p>
          </div>
          

            {items.map((item, index) => (
              <FavouriteItem key={item.id} item={item} index={index} />
            ))}
          </div>
          

            

            <div>
                <button
                  onClick={handleContinueShopping}
                  className="luxury-btn-secondary"
                >
                  Continue Exploring
                </button>
                
                <button
                  onClick={clearFavourite}
                  className="luxury-btn-text"
                >
                  Clear Favourite
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

      
         
    );
};
export default Favourite;