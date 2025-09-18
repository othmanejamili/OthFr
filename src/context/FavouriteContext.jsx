import React, {  createContext, useContext, useEffect, useState } from "react";

const FavouriteContext = createContext();

export  const useFavourite = () => {
    return useContext(FavouriteContext);
};

export const FavouriteProvider = ({children}) => {
    // intailize favourite from localStorage if avialable
    const [items, setItems] = useState(() => {
        const savedFavourite = localStorage.getItem('favourite');
        return savedFavourite ? JSON.parse(savedFavourite) : []; 
    });

    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        localStorage.setItem('favourite', JSON.stringify(items));

        const itemCount = items.length;
        
        setTotalItems(itemCount);
    }, [items])

    const addFavourite = (product) => {
        setItems(prevItem => {
            const ExistingItemIndex = prevItem.findIndex(item => item.id === product.id);

            if (ExistingItemIndex !== -1) {
                return prevItem.filter((item) => item.id !== product.id)
            } else {
                return [...prevItem, product];
            }
        });
    };

    const removeItem = (productId) => {
        setItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const clearFavourite = () => {
        setItems([])
    }

    const value = {
        items,
        totalItems,
        addFavourite,
        removeItem,
        clearFavourite
    }

    return(
        <FavouriteContext.Provider value={value}>
            {children}
        </FavouriteContext.Provider>
    );
};

export default FavouriteContext;