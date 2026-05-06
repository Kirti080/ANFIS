/**
 * BehaviorSimulator
 * =================
 * Three sliders (session duration, interaction intensity, cart depth).
 * Calls /api/predict on every slider change (debounced 300 ms).
 * Passes results up to parent via onResult callback.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { predict } from "../services/api";

const FEATURES = [
  {
    key:   "session_duration",
    label: "Session Duration",
    icon:  "⏱",
    hint:  "Time the user has spent on-site (normalised 0–1)",
    low:   "< 1 min",
    high:  "> 20 min",
  },
  {
    key:   "interaction_intensity",
    label: "Interaction Intensity",
    icon:  "🖱",
    hint:  "Clicks, scrolls, hover events (normalised 0–1)",
    low:   "Passive",
    high:  "Very active",
  },
  {
    key:   "cart_depth",
    label: "Cart Depth",
    icon:  "🛒",
    hint:  "Number of distinct items added to cart (normalised 0–1)",
    low:   "Empty",
    high:  "Full cart",
  },
];

function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

export default function BehaviorSimulator({ onResult, onInputChange }) {
  const [values, setValues]   = useState({ session_duration: 0.5, interaction_intensity: 0.5, cart_depth: 0.5 });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const callPredict = useCallback(async (vals) => {
    setLoading(true);
    setError(null);
    try {
      const result = await predict(vals);
      onResult?.(result);
    } catch (e) {
      setError("Engine unreachable — is Flask running?");
    } finally {
      setLoading(false);
    }
  }, [onResult]);

  const debouncedPredict = useDebounce(callPredict, 300);

  const handleChange = (key, raw) => {
    const v = parseFloat(raw);
    const next = { ...values, [key]: v };
    setValues(next);
    onInputChange?.(next);
    debouncedPredict(next);
  };

  // Initial call on mount
  useEffect(() => { callPredict(values); }, []);  // eslint-disable-line

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {FEATURES.map(({ key, label, icon, hint, low, high }) => {
        const v = values[key];
        const pct = Math.round(v * 100);
        return (
          <div key={key}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#c4b5fd", fontWeight: 600, fontSize: 13 }}>
                {icon} {label}
              </span>
              <span style={{ color: "#7c3aed", fontWeight: 700, fontFamily: "monospace", fontSize: 14 }}>
                {pct}%
              </span>
            </div>

            <div style={{ position: "relative", marginBottom: 4 }}>
              <input
                type="range" min={0} max={1} step={0.01} value={v}
                onChange={(e) => handleChange(key, e.target.value)}
                style={{ width: "100%", accentColor: "#7c3aed", cursor: "pointer", height: 6 }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#4a5568", fontSize: 10 }}>{low}</span>
              <span style={{ color: "#4a5568", fontSize: 10, fontStyle: "italic" }}>{hint}</span>
              <span style={{ color: "#4a5568", fontSize: 10 }}>{high}</span>
            </div>
          </div>
        );
      })}

      {/* Status row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 18 }}>
        {loading && (
          <>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c3aed",
              display: "inline-block", animation: "pulse 1s infinite" }} />
            <span style={{ color: "#7c3aed", fontSize: 12 }}>Running ANFIS inference…</span>
          </>
        )}
        {error && <span style={{ color: "#ef4444", fontSize: 12 }}>{error}</span>}
      </div>
    </div>
  );
}
