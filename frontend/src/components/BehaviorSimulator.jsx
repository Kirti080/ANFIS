/**
 * BehaviorSimulator — three sliders that feed real-time ANFIS inference.
 * Upgraded with gradient slider fill, level badges, and animated loading state.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { predict, suggestDiscount } from "../services/api";

const FEATURES = [
  {
    key:   "session_duration",
    label: "Session Duration",
    icon:  "⏱",
    hint:  "Time on-site (normalised 0–1)",
    low:   "< 1 min",
    high:  "> 20 min",
    colour: "#7c3aed",
  },
  {
    key:   "interaction_intensity",
    label: "Interaction Intensity",
    icon:  "🖱",
    hint:  "Clicks, scrolls, hover events (normalised 0–1)",
    low:   "Passive",
    high:  "Very active",
    colour: "#60a5fa",
  },
  {
    key:   "cart_depth",
    label: "Cart Depth",
    icon:  "🛒",
    hint:  "Items added to cart (normalised 0–1)",
    low:   "Empty",
    high:  "Full cart",
    colour: "#34d399",
  },
];

function levelLabel(v) {
  if (v >= 0.67) return { text: "HIGH",   colour: "#10b981", bg: "rgba(16,185,129,0.12)"  };
  if (v >= 0.34) return { text: "MEDIUM", colour: "#f59e0b", bg: "rgba(245,158,11,0.12)"  };
  return               { text: "LOW",    colour: "#ef4444", bg: "rgba(239,68,68,0.12)"    };
}

function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

export default function BehaviorSimulator({ onResult, onInputChange, onDiscount }) {
  const [values, setValues]   = useState({ session_duration: 0.5, interaction_intensity: 0.5, cart_depth: 0.5 });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const callPredict = useCallback(async (vals) => {
    setLoading(true);
    setError(null);
    try {
      const result = await predict(vals);
      onResult?.(result);
    } catch {
      setError("Engine unreachable — is Flask running?");
      setLoading(false);
      return;
    }

    // Discount is best-effort; failures don't block the prediction display
    try {
      const discount = await suggestDiscount(vals);
      onDiscount?.(discount);
    } catch {
      // silently skip — prediction already shown
    }

    setLoading(false);
  }, [onResult, onDiscount]);

  const debouncedPredict = useDebounce(callPredict, 300);

  const handleChange = (key, raw) => {
    const v = parseFloat(raw);
    const next = { ...values, [key]: v };
    setValues(next);
    onInputChange?.(next);
    debouncedPredict(next);
  };

  useEffect(() => { callPredict(values); }, []); // eslint-disable-line

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {FEATURES.map(({ key, label, icon, hint, low, high, colour }) => {
        const v   = values[key];
        const pct = Math.round(v * 100);
        const lvl = levelLabel(v);

        /* Dynamic gradient fill on the range track */
        const trackBg = `linear-gradient(to right, ${colour} 0%, ${colour}aa ${pct}%, #1a1d3a ${pct}%, #1a1d3a 100%)`;

        return (
          <div key={key} style={{
            padding: "14px 16px",
            background: "rgba(255,255,255,0.018)",
            border: "1px solid #1a1d3a",
            borderRadius: 11,
            transition: "border-color .25s, box-shadow .25s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = colour + "44";
            e.currentTarget.style.boxShadow   = `0 0 18px ${colour}12`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "#1a1d3a";
            e.currentTarget.style.boxShadow   = "none";
          }}
          >
            {/* Header row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{
                color: colour, fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 28, height: 28, borderRadius: 8,
                  background: colour + "18", fontSize: 14,
                }}>
                  {icon}
                </span>
                {label}
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  padding: "2px 10px", borderRadius: 999,
                  fontSize: 10, fontWeight: 700, letterSpacing: 1,
                  color: lvl.colour, background: lvl.bg,
                  border: `1px solid ${lvl.colour}44`,
                  transition: "all .3s",
                }}>
                  {lvl.text}
                </span>
                <span style={{
                  color: colour, fontWeight: 700,
                  fontFamily: "JetBrains Mono, monospace", fontSize: 15,
                  minWidth: 42, textAlign: "right",
                  textShadow: `0 0 10px ${colour}88`,
                  transition: "color .3s",
                }}>
                  {pct}%
                </span>
              </div>
            </div>

            {/* Slider */}
            <input
              type="range" min={0} max={1} step={0.01} value={v}
              onChange={(e) => handleChange(key, e.target.value)}
              style={{ width: "100%", background: trackBg, accentColor: colour }}
            />

            {/* Footer hints */}
            <div style={{
              display: "flex", justifyContent: "space-between", marginTop: 6,
            }}>
              <span style={{ color: "#4b5280", fontSize: 10 }}>{low}</span>
              <span style={{ color: "#4b5280", fontSize: 10, fontStyle: "italic" }}>{hint}</span>
              <span style={{ color: "#4b5280", fontSize: 10 }}>{high}</span>
            </div>
          </div>
        );
      })}

      {/* Status row */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px",
        background: loading ? "rgba(124,58,237,0.06)" : error ? "rgba(239,68,68,0.06)" : "transparent",
        borderRadius: 9,
        border: `1px solid ${loading ? "rgba(124,58,237,0.2)" : error ? "rgba(239,68,68,0.2)" : "transparent"}`,
        minHeight: 40,
        transition: "all .3s",
      }}>
        {loading && (
          <>
            <span style={{
              width: 9, height: 9, borderRadius: "50%", background: "#7c3aed",
              display: "inline-block", flexShrink: 0,
              animation: "pulse 1s ease-in-out infinite",
              boxShadow: "0 0 8px #7c3aed",
            }} />
            <span style={{ color: "#a78bfa", fontSize: 12, fontWeight: 500 }}>
              Running ANFIS inference across 27 fuzzy rules…
            </span>
          </>
        )}
        {!loading && !error && (
          <span style={{ color: "#4b5280", fontSize: 12 }}>
            ✓ Prediction ready · adjust sliders to re-run
          </span>
        )}
        {error && (
          <span style={{ color: "#ef4444", fontSize: 12 }}>⚠ {error}</span>
        )}
      </div>
    </div>
  );
}
