import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  // Cart survives a page refresh because it is saved in localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1) =>
    setItems((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i._id === product._id
            ? { ...i, stock: product.stock, quantity: Math.min(i.quantity + qty, product.stock) }
            : i
        );
      }
      return [
        ...prev,
        {
          _id: product._id,
          title: product.title,
          price: product.price,
          image: product.images?.[0] || '',
          stock: product.stock,
          quantity: Math.min(qty, product.stock),
        },
      ];
    });

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i._id !== id));

  const setQuantity = (id, qty) =>
    setItems((prev) =>
      prev.map((i) =>
        i._id === id ? { ...i, quantity: Math.max(1, Math.min(Number(qty) || 1, i.stock)) } : i
      )
    );

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, setQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}
