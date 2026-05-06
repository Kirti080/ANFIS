/**
 * ANFISOverlay — The Star of the Demo
 * =====================================
 * Floats in the bottom-right corner of the store.
 * Reads live behaviour metrics, calls the ANFIS engine every 3 s,
 * and shows:
 *   • Real-time session metrics (formatted for the teacher)
 *   • Mini conversion probability gauge
 *   • Top firing fuzzy rules
 *   • Expandable math explanation
 */

import { useState, useEffect, useCallback } from "react";
import { useBehavior } from "../../context/BehaviorContext";
import { predict } from "../../services/api";

const BAR = (pct, colour) => (
  <div style={{ background: "#1e293b", borderRadius: 4, height: 6, flex: 1 }}>
    <div style={{
      width: `${Math.max(pct, 2)}%`, height: "100%", borderRadius: 4,
      background: colour, transition: "width 0.8s ease",
    }} />
  </div>
);

const formatTime = (s) => `${Math.floor(s / 60)}m ${s % 60}s`;

const SCORE_COLOUR = (s) => s >= 65 ? "#10b981" : s >= 40 ? "#f59e0b" : "#ef4444";
const SCORE_LABEL  = (s) => s >= 65 ? "LIKELY TO PURCHASE" : s >= 40 ? "BORDERLINE" : "LIKELY TO LEAVE";
const SCORE_EMOJI  = (s) => s >= 65 ? "🟢" : s >= 40 ? "🟡" : "🔴";

// Mini SVG arc gauge
function MiniGauge({ score }) {
  const cx = 60, cy = 55, r = 42;
  const START = -210, SWEEP = 240;
  const toXY = (deg) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const arc = (a, b) => {
    const s = toXY(a), e = toXY(b);
    return `M${s.x} ${s.y} A${r} ${r} 0 ${b - a > 180 ? 1 : 0} 1 ${e.x} ${e.y}`;
  };
  const fill = START + (score / 100) * SWEEP;
  const colour = SCORE_COLOUR(score);

  return (
    <svg width={120} height={80} viewBox="0 0 120 80">
      <path d={arc(START, START + SWEEP)} fill="none" stroke="#1e293b" strokeWidth={10} strokeLinecap="round" />
      <path d={arc(START, fill)} fill="none" stroke={colour} strokeWidth={10} strokeLinecap="round"
        style={{ transition: "all 0.8s ease" }} />
      <text x={cx} y={cy + 2} textAnchor="middle" fill={colour}
        style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace" }}>
        {score.toFixed(0)}%
      </text>
    </svg>
  );
}

export default function ANFISOverlay() {
  const behavior = useBehavior();
  const [result,   setResult]   = useState(null);
  const [expanded, setExpanded] = useState(true);
  const [showMath, setShowMath] = useState(false);
  const [pulse,    setPulse]    = useState(false);

  const runInference = useCallback(async () => {
    try {
      const r = await predict({
        session_duration:      behavior.session_duration,
        interaction_intensity: behavior.interaction_intensity,
        cart_depth:            behavior.cart_depth,
      });
      setResult(r);
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    } catch { /* Flask not running — silently wait */ }
  }, [behavior.session_duration, behavior.interaction_intensity, behavior.cart_depth]);

  // Call ANFIS every 3 seconds
  useEffect(() => {
    runInference();
    const t = setInterval(runInference, 3000);
    return () => clearInterval(t);
  }, [runInference]);

  const score  = result?.fuzzy_score ?? 50;
  const colour = SCORE_COLOUR(score);
  const rules  = result?.explainability?.top_rules ?? [];
  const { raw } = behavior;

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 900,
      width: expanded ? 340 : 220,
      background: "#0a0b1e",
      border: `1.5px solid ${colour}55`,
      borderRadius: 16,
      boxShadow: `0 8px 40px #00000088, 0 0 0 1px ${colour}22`,
      transition: "all 0.4s cubic-bezier(.4,0,.2,1)",
      overflow: "hidden",
    }}>

      {/* ── Header ── */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          padding: "12px 16px", cursor: "pointer",
          background: "#12132a", borderBottom: expanded ? "1px solid #1e2035" : "none",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%", background: "#10b981",
            boxShadow: "0 0 6px #10b981",
            animation: pulse ? "none" : "pulse 2s infinite",
          }} />
          <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: 13 }}>🧠 ANFIS Live</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!expanded && result && (
            <span style={{ color: colour, fontWeight: 800, fontSize: 13 }}>
              {score.toFixed(0)}%
            </span>
          )}
          <span style={{ color: "#6b7280", fontSize: 12 }}>{expanded ? "▼" : "▲"}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* ── Live metrics ── */}
          <div>
            <div style={{ color: "#6b7280", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
              TRACKING YOUR SESSION
            </div>

            {[
              {
                icon: "⏱", label: "Session Time",
                value: formatTime(raw.seconds),
                pct: Math.round(behavior.session_duration * 100),
                colour: "#3b82f6",
                tip: "session_duration",
              },
              {
                icon: "🖱", label: "Activity",
                value: `${raw.interactions} events`,
                pct: Math.round(behavior.interaction_intensity * 100),
                colour: "#f59e0b",
                tip: "interaction_intensity",
              },
              {
                icon: "🛒", label: "Cart Depth",
                value: `${raw.cartItems} items`,
                pct: Math.round(behavior.cart_depth * 100),
                colour: "#10b981",
                tip: "cart_depth",
              },
            ].map(({ icon, label, value, pct, colour: c, tip }) => (
              <div key={label} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ color: "#94a3b8", fontSize: 11 }}>{icon} {label}</span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ color: "#64748b", fontSize: 10, fontFamily: "monospace" }}>{value}</span>
                    <span style={{ color: c, fontWeight: 700, fontSize: 12, minWidth: 32, textAlign: "right" }}>{pct}%</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {BAR(pct, c)}
                </div>
                <div style={{ color: "#374151", fontSize: 9, marginTop: 2, fontFamily: "monospace" }}>
                  ANFIS input: {tip} = {(pct / 100).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* ── Mini gauge + decision ── */}
          <div style={{
            background: "#12132a", borderRadius: 12, padding: "12px 16px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            border: `1px solid ${colour}33`,
          }}>
            <MiniGauge score={score} />
            <div style={{
              color: colour, fontWeight: 800, fontSize: 13, letterSpacing: 1,
              transition: "color 0.4s",
            }}>
              {SCORE_EMOJI(score)} {SCORE_LABEL(score)}
            </div>
            <div style={{ color: "#4a5568", fontSize: 10 }}>
              Confidence: <span style={{ color: "#94a3b8" }}>{((result?.confidence ?? 0) * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* ── Top firing rules ── */}
          {rules.length > 0 && (
            <div>
              <div style={{ color: "#6b7280", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
                TOP FIRING RULES
              </div>
              {rules.slice(0, 3).map(rule => (
                <div key={rule.rank} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ color: "#c4b5fd", fontSize: 10, fontFamily: "monospace" }}>
                      R{rule.rank}: {rule.condition}
                    </span>
                    <span style={{ color: colour, fontSize: 11, fontWeight: 700, minWidth: 36, textAlign: "right" }}>
                      {rule.percentage.toFixed(1)}%
                    </span>
                  </div>
                  {BAR(rule.percentage, colour)}
                </div>
              ))}
            </div>
          )}

          {/* ── Math explainer toggle ── */}
          <button
            onClick={() => setShowMath(m => !m)}
            style={{
              background: "#12132a", border: "1px solid #1e2035",
              color: "#7c3aed", padding: "8px 12px", borderRadius: 8,
              fontSize: 11, fontWeight: 600, cursor: "pointer", textAlign: "left",
            }}
          >
            {showMath ? "▲ Hide" : "▼ Show"} How does ANFIS decide?
          </button>

          {showMath && (
            <div style={{
              background: "#0d0e1f", borderRadius: 10, padding: 12,
              border: "1px solid #1e2035", fontSize: 11, color: "#94a3b8", lineHeight: 1.8,
            }}>
              <div style={{ color: "#a78bfa", fontWeight: 700, marginBottom: 6 }}>5-Layer ANFIS Pipeline:</div>
              {[
                ["L1 Fuzzify",  `μ(x) = exp(−(x−c)²/2σ²)`, "Maps your raw values to Low/Med/High"],
                ["L2 Rules",   `w_r = μ₁ × μ₂ × μ₃`,      "27 rules fire simultaneously"],
                ["L3 Normalise",`w̄_r = w_r / Σw`,          "Strengths sum to 1"],
                ["L4 TSK",     `f_r = p·x₁+q·x₂+s·x₃+b`,  "Linear function per rule"],
                ["L5 Output",  `ŷ = σ(Σ w̄_r·f_r)`,        "Final probability"],
              ].map(([name, formula, desc]) => (
                <div key={name} style={{ marginBottom: 6 }}>
                  <span style={{ color: "#7c3aed", fontWeight: 700 }}>{name}: </span>
                  <code style={{ color: "#10b981", background: "#0a0b1e", padding: "1px 5px", borderRadius: 4 }}>
                    {formula}
                  </code>
                  <div style={{ color: "#4b5563", fontSize: 10, marginTop: 2 }}>{desc}</div>
                </div>
              ))}
            </div>
          )}

          {/* Footer timestamp */}
          <div style={{ color: "#374151", fontSize: 9, textAlign: "center", fontFamily: "monospace" }}>
            Updated every 3 s · {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}
