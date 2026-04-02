import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Item structure: { id, name, size, price, tempId: Symbol/UUID, quantity }
  const addToCart = (product, sizeName, price) => {
    setCart((prevCart) => {
      // Check if exact same item and size exists
      const existingProduct = prevCart.find(
        (item) => item.id === product.id && item.size === sizeName
      );

      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id && item.size === sizeName
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        { ...product, size: sizeName, price, quantity: 1, tempId: Math.random().toString() },
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (tempId) => {
    setCart((prevCart) => prevCart.filter((item) => item.tempId !== tempId));
  };

  const updateQuantity = (tempId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(tempId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.tempId === tempId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setIsCartOpen(false);
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
