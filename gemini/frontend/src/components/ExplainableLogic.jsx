/**
 * ExplainableLogic
 * ================
 * Horizontal bar chart showing which fuzzy rules fired and with what strength.
 * This is the "Explainable AI" panel — the teacher's favourite section.
 */

const DECISION_COLOUR = (pct) =>
  pct >= 60 ? "#10b981" : pct >= 35 ? "#f59e0b" : "#ef4444";

export default function ExplainableLogic({ rules = [], loading = false }) {
  if (loading) {
    return (
      <div style={cardStyle}>
        <SectionTitle>Firing Rules</SectionTitle>
        <div style={{ color: "#6b7280", textAlign: "center", padding: 24 }}>Analysing…</div>
      </div>
    );
  }

  if (!rules.length) {
    return (
      <div style={cardStyle}>
        <SectionTitle>Firing Rules</SectionTitle>
        <div style={{ color: "#4a5568", textAlign: "center", padding: 24, fontSize: 13 }}>
          Move the sliders to see which rules fire.
        </div>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <SectionTitle>Active Fuzzy Rules</SectionTitle>
      <p style={{ color: "#6b7280", fontSize: 11, marginBottom: 16, lineHeight: 1.5 }}>
        The ANFIS evaluates all 27 rules simultaneously. The bars below show the
        normalised firing strength w̄_r — how much each rule contributes to the final output.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rules.map((rule) => {
          const colour = DECISION_COLOUR(rule.percentage);
          return (
            <div key={rule.rule_id ?? rule.rank}>
              {/* Rule text */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#c4b5fd", fontSize: 12, fontFamily: "monospace" }}>
                  <span style={{ color: "#6b7280" }}>R{rule.rank}: </span>
                  IF {rule.condition}
                </span>
                <span style={{ color: colour, fontWeight: 700, fontSize: 13, minWidth: 48, textAlign: "right" }}>
                  {rule.percentage.toFixed(1)}%
                </span>
              </div>

              {/* Bar */}
              <div style={{ background: "#1e2035", borderRadius: 4, height: 8 }}>
                <div style={{
                  width: `${Math.max(rule.percentage, 0.5)}%`,
                  height: "100%", borderRadius: 4,
                  background: colour,
                  transition: "width 0.5s ease, background 0.3s",
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: 14, marginBottom: 12, letterSpacing: 0.5 }}>
      {children}
    </div>
  );
}

const cardStyle = {
  background: "#12132a",
  border: "1px solid #1e2035",
  borderRadius: 12,
  padding: 20,
};
