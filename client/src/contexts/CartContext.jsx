import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cs_cart')) || { shopId: null, shopName: '', items: [] }; }
    catch { return { shopId: null, shopName: '', items: [] }; }
  });

  const save = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cs_cart', JSON.stringify(newCart));
  };

  const addItem = useCallback((shopId, shopName, item) => {
    setCart((prev) => {
      if (prev.shopId && prev.shopId !== shopId) {
        // Different shop — confirm clear in UI
        const newCart = { shopId, shopName, items: [{ ...item, quantity: 1 }] };
        localStorage.setItem('cs_cart', JSON.stringify(newCart));
        return newCart;
      }
      const existing = prev.items.find(i => i.id === item.id);
      const items = existing
        ? prev.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev.items, { ...item, quantity: 1 }];
      const newCart = { shopId, shopName, items };
      localStorage.setItem('cs_cart', JSON.stringify(newCart));
      return newCart;
    });
  }, []);

  const removeItem = useCallback((itemId) => {
    setCart((prev) => {
      const items = prev.items.filter(i => i.id !== itemId);
      const newCart = items.length === 0 ? { shopId: null, shopName: '', items: [] } : { ...prev, items };
      localStorage.setItem('cs_cart', JSON.stringify(newCart));
      return newCart;
    });
  }, []);

  const updateQuantity = useCallback((itemId, qty) => {
    if (qty <= 0) { removeItem(itemId); return; }
    setCart((prev) => {
      const items = prev.items.map(i => i.id === itemId ? { ...i, quantity: qty } : i);
      const newCart = { ...prev, items };
      localStorage.setItem('cs_cart', JSON.stringify(newCart));
      return newCart;
    });
  }, [removeItem]);

  const clearCart = useCallback(() => {
    const empty = { shopId: null, shopName: '', items: [] };
    save(empty);
  }, []);

  const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart, totalItems, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
