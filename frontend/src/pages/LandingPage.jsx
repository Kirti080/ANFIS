import { useEffect, useState } from "react";

const STATS = [
  { value: 27,  suffix: "",  label: "Fuzzy Rules",      colour: "#7c3aed" },
  { value: 126, suffix: "",  label: "Learnable Params",  colour: "#10b981" },
  { value: 16,  suffix: "+", label: "Products",          colour: "#60a5fa" },
  { value: 4,   suffix: "",  label: "Categories",        colour: "#f59e0b" },
];

const FEATURES = [
  { icon: "⚡", title: "Real-Time Inference",   colour: "#7c3aed", desc: "ANFIS evaluates all 27 fuzzy rules in milliseconds as you browse — zero lag, full precision." },
  { icon: "🔍", title: "Explainable AI",        colour: "#10b981", desc: "See exactly which fuzzy rules fired and why the model predicts PURCHASE or DROPOUT." },
  { icon: "📊", title: "Membership Functions",  colour: "#60a5fa", desc: "Visualize learned Gaussian bell curves for Low, Medium, and High behavioral signals." },
  { icon: "🗂️", title: "Audit Trail",           colour: "#f59e0b", desc: "Every prediction is logged to MongoDB. Track conversion patterns over time." },
];

const STEPS = [
  { icon: "🛍", step: "01", title: "Browse the Store",  desc: "Explore 16 items across Electronics, Fashion, Books & Home. Add items to your cart." },
  { icon: "🧠", step: "02", title: "AI Watches in Real Time", desc: "ANFIS tracks session time, click intensity, and cart depth simultaneously." },
  { icon: "🎯", step: "03", title: "Prediction Score",  desc: "Receive a conversion probability plus an explainable fuzzy rule breakdown." },
];

const TECHS = ["React 18", "Vite", "TailwindCSS", "TensorFlow", "Flask", "Node.js", "Express", "MongoDB"];

function FeatureCard({ icon, title, desc, colour }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="lp-feat"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "30px 26px", borderRadius: 20, textAlign: "left",
        background: hov ? `${colour}0a` : "rgba(255,255,255,.022)",
        border: `1px solid ${hov ? colour + "55" : colour + "1e"}`,
        transition: "all .3s", cursor: "default",
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 15,
        background: colour + "18", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: 24, marginBottom: 18,
        boxShadow: hov ? `0 0 24px ${colour}44` : "none",
        transition: "box-shadow .3s",
      }}>
        {icon}
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0", marginBottom: 8 }}>{title}</div>
      <div style={{ color: "#64748b", fontSize: 13, lineHeight: 1.65 }}>{desc}</div>
    </div>
  );
}

function useCounter(target, delay = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let cur = 0;
      const step = Math.max(1, Math.ceil(target / 60));
      const id = setInterval(() => {
        cur += step;
        if (cur >= target) { setCount(target); clearInterval(id); }
        else setCount(cur);
      }, 20);
      return () => clearInterval(id);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return count;
}

function StatCard({ value, suffix, label, colour, delay }) {
  const count = useCounter(value, delay);
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        textAlign: "center", padding: "24px 16px",
        background: hov ? `${colour}0f` : "rgba(255,255,255,0.025)",
        border: `1px solid ${hov ? colour + "55" : colour + "22"}`,
        borderRadius: 18, transition: "all .3s",
        transform: hov ? "translateY(-4px)" : "none",
      }}
    >
      <div style={{
        fontSize: 44, fontWeight: 900, color: colour,
        fontFamily: "JetBrains Mono, monospace",
        textShadow: `0 0 24px ${colour}55`, lineHeight: 1,
      }}>
        {count}{suffix}
      </div>
      <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 8, fontWeight: 600, letterSpacing: 0.5 }}>
        {label}
      </div>
    </div>
  );
}

export default function LandingPage({ onEnterStore, onViewDashboard }) {
  const [navSolid, setNavSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#050714",
      color: "#e2e8f0",
      fontFamily: "Inter, system-ui, sans-serif",
      overflowX: "hidden",
    }}>
      <style>{`
        @keyframes lp-fadeup  { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:translateY(0) } }
        @keyframes lp-orb     { 0%,100%{transform:scale(1) translate(0,0)} 40%{transform:scale(1.06) translate(18px,-12px)} 70%{transform:scale(.94) translate(-12px,16px)} }
        @keyframes lp-spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes lp-pulse   { 0%,100%{opacity:.5} 50%{opacity:1} }
        .lp-pill:hover { background: rgba(255,255,255,0.09) !important; transform: translateY(-1px); }
        .lp-cta-primary:hover { filter: brightness(1.15); transform: translateY(-2px); box-shadow: 0 14px 36px #7c3aed55 !important; }
        .lp-cta-ghost:hover   { background: rgba(255,255,255,0.08) !important; transform: translateY(-2px); }
        .lp-step:hover  { transform: translateY(-6px) !important; border-color: #7c3aed55 !important; }
        .lp-feat:hover  { transform: translateY(-5px) !important; }
      `}</style>

      {/* ── Background Orbs ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {[
          { s: 600, t: "-15%", l: "-12%", c: "#7c3aed", d: "20s" },
          { s: 450, t:  "55%", l:  "65%", c: "#4f46e5", d: "25s" },
          { s: 350, t:  "25%", l:  "45%", c: "#10b981", d: "17s" },
          { s: 250, t:  "75%", l:  "15%", c: "#60a5fa", d: "22s" },
        ].map(({ s, t, l, c, d }, i) => (
          <div key={i} style={{
            position: "absolute", top: t, left: l,
            width: s, height: s, borderRadius: "50%",
            background: `radial-gradient(circle, ${c}16 0%, transparent 68%)`,
            animation: `lp-orb ${d} ease-in-out infinite`,
            animationDelay: `${i * 4}s`,
          }} />
        ))}
        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
      </div>

      {/* ══════════════ NAVBAR ══════════════ */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 64,
        background: navSolid ? "rgba(5,7,20,.96)" : "rgba(5,7,20,.7)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${navSolid ? "rgba(255,255,255,.08)" : "transparent"}`,
        transition: "all .3s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26, filter: "drop-shadow(0 0 8px #7c3aed88)" }}>⬡</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: "#fff", letterSpacing: "-0.4px" }}>ShopSense</div>
            <div style={{ fontSize: 9, color: "#7c3aed", fontWeight: 700, letterSpacing: 2.5 }}>ANFIS POWERED</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="lp-pill" onClick={onViewDashboard} style={{
            background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
            color: "#94a3b8", padding: "8px 18px", borderRadius: 9,
            fontSize: 13, cursor: "pointer", fontWeight: 600, transition: "all .2s",
          }}>
            📊 Dashboard
          </button>
          <button className="lp-cta-primary" onClick={onEnterStore} style={{
            background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
            border: "none", color: "#fff",
            padding: "8px 22px", borderRadius: 9,
            fontSize: 13, cursor: "pointer", fontWeight: 700, transition: "all .25s",
            boxShadow: "0 4px 16px #7c3aed44",
          }}>
            🛍 Shop Now
          </button>
        </div>
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "96px 40px 80px" }}>

        {/* Live badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#7c3aed1a", border: "1px solid #7c3aed44",
          color: "#a78bfa", padding: "6px 20px", borderRadius: 999,
          fontSize: 11.5, fontWeight: 700, letterSpacing: 1.5, marginBottom: 36,
          animation: "lp-fadeup .6s ease both",
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#10b981", display: "inline-block",
            boxShadow: "0 0 10px #10b981", animation: "lp-pulse 2s ease-in-out infinite",
          }} />
          LIVE ANFIS ENGINE · 27 FUZZY RULES ACTIVE
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(38px, 7vw, 76px)", fontWeight: 900,
          lineHeight: 1.08, margin: "0 0 24px",
          animation: "lp-fadeup .65s ease .1s both",
        }}>
          Shop Smarter with<br />
          <span style={{
            background: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 60%, #34d399 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Neuro-Fuzzy AI
          </span>
        </h1>

        <p style={{
          color: "#94a3b8", fontSize: "clamp(15px, 2.2vw, 18px)",
          maxWidth: 540, margin: "0 auto 44px", lineHeight: 1.75,
          animation: "lp-fadeup .65s ease .2s both",
        }}>
          An ANFIS engine with 126 learnable parameters watches your session
          in real time, predicts purchase intent, and explains every
          decision transparently through 27 fuzzy logic rules.
        </p>

        {/* CTAs */}
        <div style={{
          display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap",
          animation: "lp-fadeup .65s ease .3s both",
        }}>
          <button className="lp-cta-primary" onClick={onEnterStore} style={{
            background: "linear-gradient(135deg,#7c3aed,#4f46e5)", border: "none",
            color: "#fff", padding: "15px 36px", borderRadius: 13,
            fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all .25s",
            boxShadow: "0 8px 28px #7c3aed55",
          }}>
            Enter Store →
          </button>
          <button className="lp-cta-ghost" onClick={onViewDashboard} style={{
            background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.14)",
            color: "#e2e8f0", padding: "15px 36px", borderRadius: 13,
            fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all .25s",
          }}>
            🧠 View AI Dashboard
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
          gap: 16, maxWidth: 700, margin: "72px auto 0",
          animation: "lp-fadeup .65s ease .45s both",
        }}>
          {STATS.map((s, i) => <StatCard key={s.label} {...s} delay={500 + i * 120} />)}
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 40px", textAlign: "center" }}>
        <div style={{ color: "#7c3aed", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, marginBottom: 14, textTransform: "uppercase" }}>
          How It Works
        </div>
        <h2 style={{ fontSize: "clamp(22px, 4vw, 38px)", fontWeight: 800, margin: "0 0 56px", color: "#f1f5f9" }}>
          From Browsing to Prediction in Milliseconds
        </h2>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: 28, maxWidth: 900, margin: "0 auto",
        }}>
          {STEPS.map(({ icon, step, title, desc }) => (
            <div key={step} className="lp-step" style={{
              padding: "36px 28px 30px", borderRadius: 22,
              background: "rgba(255,255,255,.026)",
              border: "1px solid rgba(255,255,255,.07)",
              backdropFilter: "blur(12px)", position: "relative",
              transition: "all .3s", cursor: "default",
            }}>
              <div style={{
                position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)",
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, color: "#fff",
                boxShadow: "0 4px 14px #7c3aed55",
              }}>
                {step}
              </div>
              <div style={{ fontSize: 44, marginBottom: 18, filter: "drop-shadow(0 4px 12px rgba(0,0,0,.4))" }}>
                {icon}
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9", marginBottom: 10 }}>{title}</div>
              <div style={{ color: "#64748b", fontSize: 13.5, lineHeight: 1.65 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section style={{ position: "relative", zIndex: 1, padding: "60px 40px 80px", textAlign: "center" }}>
        <div style={{ color: "#10b981", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, marginBottom: 14, textTransform: "uppercase" }}>
          Capabilities
        </div>
        <h2 style={{ fontSize: "clamp(22px, 4vw, 38px)", fontWeight: 800, margin: "0 0 52px", color: "#f1f5f9" }}>
          Built for Transparency &amp; Performance
        </h2>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: 20, maxWidth: 1040, margin: "0 auto",
        }}>
          {FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* ══════════════ TECH STRIP ══════════════ */}
      <section style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(255,255,255,.05)",
        borderBottom: "1px solid rgba(255,255,255,.05)",
        padding: "22px 40px",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 10, flexWrap: "wrap",
      }}>
        <span style={{ color: "#374151", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, marginRight: 4 }}>
          POWERED BY
        </span>
        {TECHS.map(t => (
          <span key={t} style={{
            background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)",
            color: "#94a3b8", padding: "5px 14px", borderRadius: 999, fontSize: 12, fontWeight: 500,
          }}>
            {t}
          </span>
        ))}
      </section>

      {/* ══════════════ FINAL CTA ══════════════ */}
      <section style={{
        position: "relative", zIndex: 1,
        textAlign: "center", padding: "88px 40px 100px",
        background: "radial-gradient(ellipse 60% 50% at 50% 100%, #7c3aed12, transparent)",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg,#7c3aed22,#4f46e522)",
          border: "1px solid #7c3aed44", fontSize: 32, marginBottom: 24,
        }}>
          🛍
        </div>
        <h2 style={{ fontSize: "clamp(22px, 4vw, 42px)", fontWeight: 900, margin: "0 0 18px", color: "#f1f5f9" }}>
          Ready to Experience AI-Powered Shopping?
        </h2>
        <p style={{ color: "#64748b", fontSize: 15, maxWidth: 460, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Watch the ANFIS overlay predict your purchase intent live as you add
          items and browse the store.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="lp-cta-primary" onClick={onEnterStore} style={{
            background: "linear-gradient(135deg,#7c3aed,#4f46e5)", border: "none",
            color: "#fff", padding: "16px 44px", borderRadius: 14,
            fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "all .25s",
            boxShadow: "0 10px 32px #7c3aed44",
          }}>
            Start Shopping Now →
          </button>
          <button className="lp-cta-ghost" onClick={onViewDashboard} style={{
            background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.14)",
            color: "#94a3b8", padding: "16px 36px", borderRadius: 14,
            fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all .25s",
          }}>
            Explore Dashboard
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        position: "relative", zIndex: 1, textAlign: "center", padding: "22px",
        borderTop: "1px solid rgba(255,255,255,.04)",
        color: "#374151", fontSize: 12,
      }}>
        ShopSense · ANFIS E-Commerce Intelligence ·
        React 18 + TensorFlow + Node.js + MongoDB
      </footer>
    </div>
  );
}
