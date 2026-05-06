import { createContext, useContext, useReducer } from "react";

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const exists = state.find(i => i.id === action.product.id);
      if (exists) return state.map(i => i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...state, { ...action.product, qty: 1 }];
    }
    case "REMOVE":   return state.filter(i => i.id !== action.id);
    case "INCREMENT":return state.map(i => i.id === action.id ? { ...i, qty: i.qty + 1 } : i);
    case "DECREMENT":return state.map(i => i.id === action.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i);
    case "CLEAR":    return [];
    default:         return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  const totalItems    = items.reduce((s, i) => s + i.qty, 0);
  const totalPrice    = items.reduce((s, i) => s + i.price * i.qty, 0);
  const addToCart     = (product) => dispatch({ type: "ADD", product });
  const removeFromCart= (id)      => dispatch({ type: "REMOVE", id });
  const increment     = (id)      => dispatch({ type: "INCREMENT", id });
  const decrement     = (id)      => dispatch({ type: "DECREMENT", id });
  const clearCart     = ()        => dispatch({ type: "CLEAR" });

  return (
    <CartContext.Provider value={{ items, totalItems, totalPrice, addToCart, removeFromCart, increment, decrement, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
