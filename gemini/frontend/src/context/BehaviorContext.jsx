/**
 * BehaviorContext
 * ===============
 * Silently tracks three real user behaviour signals and normalises them
 * to [0,1] so they can be fed directly into the ANFIS engine.
 *
 *  session_duration      : seconds on store / 1800  (cap 30 min → 1.0)
 *  interaction_intensity : total events / 200        (cap 200 → 1.0)
 *  cart_depth            : items in cart / 10        (cap 10 items → 1.0)
 */

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useCart } from "./CartContext";

const BehaviorContext = createContext(null);

export function BehaviorProvider({ children }) {
  const { totalItems } = useCart();
  const [seconds,      setSeconds]      = useState(0);
  const [interactions, setInteractions] = useState(0);
  const startRef = useRef(Date.now());

  // ── Timer ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setSeconds(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Interaction counter (click + scroll + keydown) ──────────────────
  useEffect(() => {
    const inc = () => setInteractions(n => n + 1);
    window.addEventListener("click",   inc);
    window.addEventListener("scroll",  inc);
    window.addEventListener("keydown", inc);
    return () => {
      window.removeEventListener("click",   inc);
      window.removeEventListener("scroll",  inc);
      window.removeEventListener("keydown", inc);
    };
  }, []);

  // ── Normalised values ───────────────────────────────────────────────
  const metrics = {
    session_duration:      Math.min(seconds / 1800, 1),
    interaction_intensity: Math.min(interactions / 200, 1),
    cart_depth:            Math.min(totalItems / 10, 1),
    // Raw (for display)
    raw: { seconds, interactions, cartItems: totalItems },
  };

  return (
    <BehaviorContext.Provider value={metrics}>
      {children}
    </BehaviorContext.Provider>
  );
}

export const useBehavior = () => useContext(BehaviorContext);
