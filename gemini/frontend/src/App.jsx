import { useState } from "react";
import { CartProvider }     from "./context/CartContext";
import { BehaviorProvider } from "./context/BehaviorContext";
import StorePage            from "./pages/StorePage";

// Existing ANFIS Dashboard components
import PredictionGauge         from "./components/PredictionGauge";
import BehaviorSimulator       from "./components/BehaviorSimulator";
import MembershipFunctionChart from "./components/MembershipFunctionChart";
import ExplainableLogic        from "./components/ExplainableLogic";
import AuditLog                from "./components/AuditLog";
import NeuroFuzzyExplainer     from "./components/NeuroFuzzyExplainer";
import { fetchMFs, retrain, healthCheck } from "./services/api";
import { useEffect, useCallback } from "react";
import "./App.css";

const DASH_TABS = ["Simulator", "Model Visualiser", "Understand ANFIS", "Audit Trail"];

const DEFAULT_RESULT = { fuzzy_score: 50, decision: "—", confidence: 0, explainability: { top_rules: [] } };
const DEFAULT_MFS = {
  "Session Duration":     { centers: [0.17, 0.5, 0.83], sigmas: [0.3, 0.3, 0.3] },
  "Interaction Intensity":{ centers: [0.17, 0.5, 0.83], sigmas: [0.3, 0.3, 0.3] },
  "Cart Depth":           { centers: [0.17, 0.5, 0.83], sigmas: [0.3, 0.3, 0.3] },
};
const INPUT_TO_FEATURE = {
  session_duration: "Session Duration",
  interaction_intensity: "Interaction Intensity",
  cart_depth: "Cart Depth",
};

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("store"); // "store" | "dashboard"

  return (
    <CartProvider>
      <BehaviorProvider>
        {view === "store"
          ? <StorePage onViewDashboard={() => setView("dashboard")} />
          : <Dashboard onViewStore={() => setView("store")} />
        }
      </BehaviorProvider>
    </CartProvider>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ onViewStore }) {
  const [tab,       setTab]       = useState(0);
  const [result,    setResult]    = useState(DEFAULT_RESULT);
  const [mfs,       setMfs]       = useState(DEFAULT_MFS);
  const [inputs,    setInputs]    = useState({ session_duration: 0.5, interaction_intensity: 0.5, cart_depth: 0.5 });
  const [health,    setHealth]    = useState(null);
  const [retraining,setRetraining]= useState(false);

  const loadMFs = useCallback(async () => {
    try { setMfs(await fetchMFs()); } catch { /* use defaults */ }
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
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button onClick={onViewStore} style={{
            background: "#7c3aed22", border: "1px solid #7c3aed",
            color: "#a78bfa", padding: "7px 14px", borderRadius: 8,
            fontSize: 12, fontWeight: 600, cursor: "pointer", marginRight: 16,
          }}>← Back to Store</button>
          <span className="header-logo">⬡</span>
          <div>
            <div className="header-title">ANFIS Conversion Intelligence</div>
            <div className="header-sub">Adaptive Neuro-Fuzzy Inference System · E-commerce Edition</div>
          </div>
        </div>
        <div className="header-right">
          {health && (
            <div className="health-badges">
              <Badge label="Flask"   ok={health.flask?.status === "ok"} />
              <Badge label="Node"    ok={health.node === "ok"} />
              <Badge label="MongoDB" ok={health.mongodb === "ok"} />
            </div>
          )}
          <button className="retrain-btn" onClick={handleRetrain} disabled={retraining}>
            {retraining ? "Training…" : "Retrain Model"}
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="tabs">
        {DASH_TABS.map((t, i) => (
          <button key={t} className={`tab ${tab === i ? "tab-active" : ""}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </nav>

      {/* Content */}
      <main className="main">
        {tab === 0 && (
          <div className="grid-simulator">
            <div className="card">
              <div className="section-title">User Behaviour Inputs</div>
              <BehaviorSimulator onResult={setResult} onInputChange={setInputs} />
            </div>
            <div className="card card-center">
              <div className="section-title">Conversion Prediction</div>
              <PredictionGauge score={result.fuzzy_score ?? 50} decision={result.decision ?? "—"} confidence={result.confidence ?? 0} />
              <div className="result-meta">
                {[["Fuzzy Score", `${(result.fuzzy_score ?? 0).toFixed(1)}%`],
                  ["Probability", `${((result.conversion_probability ?? 0) * 100).toFixed(1)}%`],
                  ["Confidence", `${((result.confidence ?? 0) * 100).toFixed(1)}%`]].map(([k, v]) => (
                  <div key={k} className="meta-row">
                    <span className="meta-key">{k}</span>
                    <span className="meta-val">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <ExplainableLogic rules={result.explainability?.top_rules ?? []} />
            </div>
          </div>
        )}
        {tab === 1 && (
          <div className="card">
            <div className="section-title">Gaussian Membership Functions</div>
            <p className="help-text">Gaussian curves for Low / Medium / High per feature. Purple line = current slider value.</p>
            <div className="mf-grid">
              {Object.entries(mfs).map(([name, mfData]) => (
                <MembershipFunctionChart key={name} featureName={name} centers={mfData.centers} sigmas={mfData.sigmas}
                  currentValue={inputs[Object.keys(INPUT_TO_FEATURE).find(k => INPUT_TO_FEATURE[k] === name)]} />
              ))}
            </div>
          </div>
        )}
        {tab === 2 && (
          <div className="card">
            <div className="section-title">Understanding the Neuro-Fuzzy Hybrid System</div>
            <NeuroFuzzyExplainer />
          </div>
        )}
        {tab === 3 && (
          <div className="card">
            <div className="section-title">Prediction Audit Trail</div>
            <AuditLog />
          </div>
        )}
      </main>
    </div>
  );
}

function Badge({ label, ok }) {
  return (
    <div className="badge" style={{ borderColor: ok ? "#10b98166" : "#ef444466" }}>
      <span className="badge-dot" style={{ background: ok ? "#10b981" : "#ef4444" }} />
      <span style={{ color: ok ? "#10b981" : "#ef4444" }}>{label}</span>
    </div>
  );
}
