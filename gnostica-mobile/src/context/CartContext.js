import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (course) => {
        if (!cartItems.find(item => item.id === course.id)) {
            setCartItems([...cartItems, course]);
            return true; // Added
        }
        return false; // Already in cart
    };

    const removeFromCart = (courseId) => {
        setCartItems(cartItems.filter(item => item.id !== courseId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
