/**
 * ExplainableLogic — Explainable AI panel.
 * Shows which of the 27 fuzzy rules fired and their normalised firing strength.
 * Upgraded with gradient glow bars, rank badges, and fade-in animation.
 */

const STRENGTH_COLOUR = (pct) =>
  pct >= 60 ? "#10b981" : pct >= 35 ? "#f59e0b" : "#ef4444";

const STRENGTH_LABEL = (pct) =>
  pct >= 60 ? "STRONG" : pct >= 35 ? "MEDIUM" : "WEAK";

export default function ExplainableLogic({ rules = [], loading = false }) {
  /* ── Loading state ── */
  if (loading) {
    return (
      <div>
        <SectionTitle>Firing Rules</SectionTitle>
        <div style={{
          display: "flex", flexDirection: "column", gap: 10, paddingTop: 8,
        }}>
          {[1, 2, 3].map(i => (
            <SkeletonBar key={i} />
          ))}
        </div>
      </div>
    );
  }

  /* ── Empty state ── */
  if (!rules.length) {
    return (
      <div>
        <SectionTitle>Explainable AI</SectionTitle>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 10, padding: "28px 0", color: "#4b5280", fontSize: 13,
          textAlign: "center",
        }}>
          <span style={{ fontSize: 28 }}>🔍</span>
          <div>Adjust the sliders to see</div>
          <div style={{ color: "#7c3aed", fontWeight: 600 }}>which fuzzy rules fire</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle>Active Fuzzy Rules</SectionTitle>

      <p style={{
        color: "#4b5280", fontSize: 11.5, marginBottom: 18, lineHeight: 1.65,
        padding: "8px 12px",
        background: "rgba(124,58,237,0.05)",
        border: "1px solid rgba(124,58,237,0.12)",
        borderRadius: 8,
      }}>
        The ANFIS evaluates all <strong style={{ color: "#a78bfa" }}>27 rules</strong> simultaneously.
        Bars show normalised firing strength <em>w̄ᵣ</em> — how much each rule shapes the final output.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rules.map((rule, idx) => {
          const colour = STRENGTH_COLOUR(rule.percentage);
          const label  = STRENGTH_LABEL(rule.percentage);

          return (
            <div
              key={rule.rule_id ?? rule.rank}
              style={{
                padding: "11px 14px",
                background: "rgba(255,255,255,0.018)",
                border: `1px solid ${colour}22`,
                borderRadius: 10,
                borderLeft: `3px solid ${colour}`,
                animation: `fadeSlideUp .3s ease ${idx * 0.05}s both`,
                transition: "border-color .3s, box-shadow .3s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = `0 0 16px ${colour}18`;
                e.currentTarget.style.background = `${colour}06`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.background = "rgba(255,255,255,0.018)";
              }}
            >
              {/* Rule header */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 9,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                  {/* Rank badge */}
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 22, height: 22, borderRadius: 6,
                    background: colour + "22",
                    color: colour, fontSize: 10, fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    R{rule.rank}
                  </span>

                  {/* Condition text */}
                  <span style={{
                    color: "#94a3b8", fontSize: 11.5,
                    fontFamily: "JetBrains Mono, Courier New, monospace",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    <span style={{ color: "#6b7280" }}>IF </span>
                    <span style={{ color: "#c4b5fd" }}>{rule.condition}</span>
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 10 }}>
                  {/* Strength label */}
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: 1.2,
                    color: colour, background: colour + "18",
                    padding: "2px 7px", borderRadius: 999,
                    border: `1px solid ${colour}44`,
                  }}>
                    {label}
                  </span>
                  {/* Percentage */}
                  <span style={{
                    color: colour, fontWeight: 700, fontSize: 14,
                    fontFamily: "JetBrains Mono, monospace",
                    minWidth: 44, textAlign: "right",
                    textShadow: `0 0 8px ${colour}66`,
                  }}>
                    {rule.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{
                background: "#0d0f24", borderRadius: 4, height: 7,
                overflow: "hidden",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)",
              }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  width: `${Math.max(rule.percentage, 0.5)}%`,
                  background: `linear-gradient(90deg, ${colour}88, ${colour})`,
                  boxShadow: `0 0 8px ${colour}66`,
                  transition: "width 0.55s cubic-bezier(0.34,1.56,0.64,1), background 0.3s",
                  transformOrigin: "left",
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Rule count footer */}
      <div style={{
        marginTop: 14, paddingTop: 12, borderTop: "1px solid #1a1d3a",
        display: "flex", justifyContent: "space-between",
        fontSize: 11, color: "#4b5280",
      }}>
        <span>Showing top {rules.length} of 27 rules</span>
        <span style={{ color: "#7c3aed" }}>
          Total active: {rules.filter(r => r.percentage > 1).length}
        </span>
      </div>
    </div>
  );
}

/* ── Sub-components ── */
function SectionTitle({ children }) {
  return (
    <div style={{
      color: "#c4b5fd", fontWeight: 700, fontSize: 13.5,
      letterSpacing: 0.5, marginBottom: 16,
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span style={{
        display: "inline-block", width: 3, height: 16, borderRadius: 2,
        background: "linear-gradient(to bottom, #7c3aed, #60a5fa)",
        flexShrink: 0,
      }} />
      {children}
    </div>
  );
}

function SkeletonBar() {
  return (
    <div style={{
      padding: "11px 14px", background: "rgba(255,255,255,0.02)",
      border: "1px solid #1a1d3a", borderRadius: 10,
      animation: "pulse 1.5s ease-in-out infinite",
    }}>
      <div style={{ height: 12, background: "#1a1d3a", borderRadius: 6, marginBottom: 10, width: "75%" }} />
      <div style={{ height: 7, background: "#1a1d3a", borderRadius: 4 }} />
    </div>
  );
}
