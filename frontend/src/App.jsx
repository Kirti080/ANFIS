import { useState } from "react";
import { CartProvider }     from "./context/CartContext";
import { BehaviorProvider } from "./context/BehaviorContext";
import LandingPage          from "./pages/LandingPage";
import StorePage            from "./pages/StorePage";

import PredictionGauge         from "./components/PredictionGauge";
import BehaviorSimulator       from "./components/BehaviorSimulator";
import MembershipFunctionChart from "./components/MembershipFunctionChart";
import ExplainableLogic        from "./components/ExplainableLogic";
import AuditLog                from "./components/AuditLog";
import NeuroFuzzyExplainer     from "./components/NeuroFuzzyExplainer";
import { fetchMFs, retrain, healthCheck } from "./services/api";
import DiscountAdvisor from "./components/DiscountAdvisor";
import { useEffect, useCallback } from "react";
import "./App.css";

const DASH_TABS = [
  { label: "Live Simulator",    icon: "⚡" },
  { label: "Model Visualiser",  icon: "📊" },
  { label: "ANFIS Architecture",icon: "🧠" },
  { label: "Audit Trail",       icon: "📋" },
];

const DEFAULT_RESULT = {
  fuzzy_score: 50, decision: "—", confidence: 0,
  explainability: { top_rules: [] },
};
const DEFAULT_MFS = {
  "Session Duration":      { centers: [0.17, 0.5, 0.83], sigmas: [0.3, 0.3, 0.3] },
  "Interaction Intensity": { centers: [0.17, 0.5, 0.83], sigmas: [0.3, 0.3, 0.3] },
  "Cart Depth":            { centers: [0.17, 0.5, 0.83], sigmas: [0.3, 0.3, 0.3] },
};
const INPUT_TO_FEATURE = {
  session_duration:      "Session Duration",
  interaction_intensity: "Interaction Intensity",
  cart_depth:            "Cart Depth",
};

/* ─── Root ──────────────────────────────────────────────────────────── */
export default function App() {
  const [view, setView] = useState("landing");
  return (
    <CartProvider>
      <BehaviorProvider>
        {view === "landing" && (
          <LandingPage
            onEnterStore={() => setView("store")}
            onViewDashboard={() => setView("dashboard")}
          />
        )}
        {view === "store" && (
          <StorePage
            onViewDashboard={() => setView("dashboard")}
            onViewLanding={() => setView("landing")}
          />
        )}
        {view === "dashboard" && (
          <Dashboard onViewStore={() => setView("store")} />
        )}
      </BehaviorProvider>
    </CartProvider>
  );
}

/* ─── Dashboard ─────────────────────────────────────────────────────── */
function Dashboard({ onViewStore }) {
  const [tab,        setTab]        = useState(0);
  const [result,     setResult]     = useState(DEFAULT_RESULT);
  const [discount,   setDiscount]   = useState(null);
  const [mfs,        setMfs]        = useState(DEFAULT_MFS);
  const [inputs,     setInputs]     = useState({ session_duration: 0.5, interaction_intensity: 0.5, cart_depth: 0.5 });
  const [health,     setHealth]     = useState(null);
  const [retraining, setRetraining] = useState(false);

  const loadMFs = useCallback(async () => {
    try { setMfs(await fetchMFs()); } catch { /* defaults */ }
  }, []);

  useEffect(() => {
    loadMFs();
    healthCheck().then(setHealth).catch(() => setHealth(null));
  }, [loadMFs]);

  const handleRetrain = async () => {
    if (!window.confirm("Retrain the ANFIS model? This takes ~30 seconds.")) return;
    setRetraining(true);
    try { await retrain(); await loadMFs(); alert("Retraining complete!"); }
    catch { alert("Retraining failed."); }
    setRetraining(false);
  };

  return (
    <div className="app">
      {/* ════════════════════════════ HEADER ════════════════════════════ */}
      <header className="header">
        <div className="header-left">
          <button className="btn-back" onClick={onViewStore}>← Store</button>
          <span className="logo-hex">⬡</span>
          <div>
            <div className="header-title">
              AI-Powered Customer Behavior Prediction Dashboard
            </div>
            <div className="header-sub">
              Real-time insights using Neuro-Fuzzy Intelligence (ANFIS) · 126 learnable parameters · 27 fuzzy rules
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className="ai-status">
            <span className="ai-status-dot" />
            AI Model Active
          </div>

          {health && (
            <div style={{ display: "flex", gap: 7 }}>
              {[
                ["Flask",   health.flask?.status === "ok"],
                ["Node",    health.node === "ok"],
                ["MongoDB", health.mongodb === "ok"],
              ].map(([label, ok]) => (
                <ServiceBadge key={label} label={label} ok={ok} />
              ))}
            </div>
          )}

          <button className="btn-retrain" onClick={handleRetrain} disabled={retraining}>
            {retraining ? "⏳ Training…" : "⟳ Retrain"}
          </button>
        </div>
      </header>

      {/* ════════════════════════════ LIVE METRICS STRIP ════════════════ */}
      <LiveMetricsStrip result={result} inputs={inputs} />

      {/* ════════════════════════════ TABS ══════════════════════════════ */}
      <nav className="tabs">
        {DASH_TABS.map(({ label, icon }, i) => (
          <button
            key={label}
            className={`tab ${tab === i ? "tab-active" : ""}`}
            onClick={() => setTab(i)}
          >
            <span className="tab-icon">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      {/* ════════════════════════════ CONTENT ═══════════════════════════ */}
      <main className="main">

        {/* ── Tab 0: Live Simulator ── */}
        {tab === 0 && (
          <>
          <div className="grid-sim" style={{ animation: "fadeUp .35s ease" }}>

            {/* Left — inputs */}
            <div className="card">
              <SectionHeading icon="🎛️">User Behaviour Inputs</SectionHeading>
              <BehaviorSimulator onResult={setResult} onInputChange={setInputs} onDiscount={setDiscount} />
            </div>

            {/* Centre — prediction */}
            <div className="card-glow">
              <SectionHeading icon="🎯">Conversion Prediction</SectionHeading>
              <PredictionGauge
                score={result.fuzzy_score ?? 50}
                decision={result.decision ?? "—"}
                confidence={result.confidence ?? 0}
              />
              <div className="meta-table">
                {[
                  ["Fuzzy Score",   `${(result.fuzzy_score ?? 0).toFixed(1)}%`],
                  ["Probability",   `${((result.conversion_probability ?? 0)*100).toFixed(1)}%`],
                  ["Confidence",    `${((result.confidence ?? 0)*100).toFixed(1)}%`],
                ].map(([k, v]) => (
                  <div key={k} className="meta-row">
                    <span className="meta-key">{k}</span>
                    <span className="meta-val">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — explainability */}
            <div className="card">
              <ExplainableLogic rules={result.explainability?.top_rules ?? []} />
            </div>
          </div>

          {/* Full-width Discount Advisor */}
          <div className="card" style={{ marginTop: 18 }}>
            <SectionHeading icon="💰">AI Discount Recommendation</SectionHeading>
            <DiscountAdvisor discount={discount} />
          </div>
          </>
        )}

        {/* ── Tab 1: Model Visualiser ── */}
        {tab === 1 && (
          <div className="card" style={{ animation: "fadeUp .35s ease" }}>
            <SectionHeading icon="📈">Gaussian Membership Functions</SectionHeading>
            <p style={{ color: "var(--muted)", fontSize: 12, marginBottom: 4, lineHeight: 1.65 }}>
              Gaussian bell curves for <span style={{ color: "#ef4444" }}>Low</span> /{" "}
              <span style={{ color: "#f59e0b" }}>Medium</span> /{" "}
              <span style={{ color: "#10b981" }}>High</span> per input feature.
              The <span style={{ color: "#7c3aed" }}>purple dashed line</span> = current slider position.
            </p>
            <div className="mf-grid">
              {Object.entries(mfs).map(([name, mfData]) => (
                <MembershipFunctionChart
                  key={name}
                  featureName={name}
                  centers={mfData.centers}
                  sigmas={mfData.sigmas}
                  currentValue={inputs[Object.keys(INPUT_TO_FEATURE).find(k => INPUT_TO_FEATURE[k] === name)]}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 2: ANFIS Architecture ── */}
        {tab === 2 && (
          <div className="card" style={{ animation: "fadeUp .35s ease" }}>
            <SectionHeading icon="🔬">5-Layer ANFIS Architecture</SectionHeading>
            <NeuroFuzzyExplainer />
          </div>
        )}

        {/* ── Tab 3: Audit Trail ── */}
        {tab === 3 && (
          <div className="card" style={{ animation: "fadeUp .35s ease" }}>
            <SectionHeading icon="🗂️">Prediction Audit Trail</SectionHeading>
            <AuditLog />
          </div>
        )}
      </main>
    </div>
  );
}

/* ─── Live Metrics Strip ────────────────────────────────────────────── */
function LiveMetricsStrip({ result, inputs }) {
  const score  = result?.fuzzy_score ?? 50;
  const colour = score >= 70 ? "#10b981" : score >= 45 ? "#f59e0b" : "#ef4444";

  const metrics = [
    { label: "Fuzzy Score",          value: `${score.toFixed(1)}%`,                   colour: colour  },
    { label: "Decision",             value: result?.decision ?? "—",                   colour: colour  },
    { label: "Session",              value: `${Math.round((inputs.session_duration ?? 0.5) * 100)}%`, colour: "#7c3aed" },
    { label: "Interaction",          value: `${Math.round((inputs.interaction_intensity ?? 0.5) * 100)}%`, colour: "#60a5fa" },
    { label: "Cart Depth",           value: `${Math.round((inputs.cart_depth ?? 0.5) * 100)}%`,      colour: "#34d399" },
    { label: "Confidence",           value: `${((result?.confidence ?? 0) * 100).toFixed(0)}%`,       colour: "#f59e0b" },
  ];

  return (
    <div style={{
      display: "flex", gap: 0,
      background: "rgba(5,7,20,0.7)",
      borderBottom: "1px solid #1a1d3a",
      backdropFilter: "blur(16px)",
      overflowX: "auto",
      flexShrink: 0,
    }}>
      {metrics.map(({ label, value, colour: c }, i) => (
        <div key={label} style={{
          flex: "0 0 auto", padding: "8px 20px",
          borderRight: i < metrics.length - 1 ? "1px solid #1a1d3a" : "none",
          display: "flex", flexDirection: "column", gap: 2,
          minWidth: 110,
        }}>
          <span style={{ color: "#4b5280", fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600 }}>
            {label}
          </span>
          <span style={{
            color: c, fontSize: 14, fontWeight: 800,
            fontFamily: "JetBrains Mono, monospace",
            textShadow: `0 0 10px ${c}66`,
            transition: "color .4s, text-shadow .4s",
          }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Helpers ───────────────────────────────────────────────────────── */
function SectionHeading({ icon, children }) {
  return (
    <div className="section-heading">
      <span className="section-heading-bar" />
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      {children}
    </div>
  );
}

function ServiceBadge({ label, ok }) {
  const c = ok ? "#10b981" : "#ef4444";
  return (
    <div className="svc-badge" style={{ borderColor: c + "44" }}>
      <span className="svc-dot" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
      <span style={{ color: c }}>{label}</span>
    </div>
  );
}
