/**
 * DiscountAdvisor — Dashboard card showing AI-driven discount recommendation.
 * Driven by ANFIS conversion probability + behavioural signal heuristics.
 */

const TIER_META = {
  NO_DISCOUNT: { colour: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.25)", emoji: "✅" },
  MICRO:       { colour: "#60a5fa", bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.25)",  emoji: "💙" },
  NUDGE:       { colour: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)",  emoji: "💛" },
  INCENTIVE:   { colour: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.25)",  emoji: "🟠" },
  AGGRESSIVE:  { colour: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)",   emoji: "🔴" },
};

const URGENCY_COLOUR = { low: "#10b981", medium: "#f59e0b", high: "#ef4444" };
const URGENCY_WIDTH  = { low: "30%",     medium: "60%",     high: "95%" };

export default function DiscountAdvisor({ discount, loading = false }) {
  if (loading) return <Skeleton />;

  if (!discount) {
    return (
      <Empty message="Run the simulator to get an AI discount recommendation." />
    );
  }

  const meta   = TIER_META[discount.tier] ?? TIER_META.NUDGE;
  const uc     = URGENCY_COLOUR[discount.urgency] ?? "#f59e0b";
  const uw     = URGENCY_WIDTH[discount.urgency]  ?? "60%";
  const convPct = ((discount.conversion_probability ?? 0) * 100).toFixed(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* ── Top row: discount number + tier info ── */}
      <div style={{ display: "flex", alignItems: "stretch", gap: 16, flexWrap: "wrap" }}>

        {/* Big number */}
        <div style={{
          minWidth: 130, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "20px 24px",
          background: meta.bg, border: `1px solid ${meta.border}`,
          borderRadius: 14, flexShrink: 0,
        }}>
          <div style={{
            fontSize: discount.discount_pct === 0 ? 36 : 52,
            fontWeight: 900, color: meta.colour,
            fontFamily: "JetBrains Mono, monospace",
            textShadow: `0 0 28px ${meta.colour}66`,
            lineHeight: 1,
          }}>
            {discount.discount_pct === 0 ? "—" : `${discount.discount_pct}%`}
          </div>
          <div style={{ color: meta.colour, fontSize: 11, fontWeight: 700, marginTop: 6, letterSpacing: 0.5 }}>
            {discount.discount_pct === 0 ? "FULL PRICE" : "OFF"}
          </div>
        </div>

        {/* Tier + message */}
        <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Tier badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{
              background: meta.bg, border: `1px solid ${meta.border}`,
              color: meta.colour, padding: "5px 14px", borderRadius: 999,
              fontSize: 12, fontWeight: 800, letterSpacing: 0.5,
            }}>
              {meta.emoji} {discount.tier_label}
            </span>
            <span style={{
              background: URGENCY_COLOUR[discount.urgency] + "18",
              border: `1px solid ${uc}44`,
              color: uc, padding: "4px 12px", borderRadius: 999,
              fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
            }}>
              {discount.urgency.toUpperCase()} URGENCY
            </span>
          </div>

          {/* Message quote */}
          <div style={{
            background: "rgba(255,255,255,0.025)", border: "1px solid #1a1d3a",
            borderRadius: 10, padding: "12px 16px",
            color: "#94a3b8", fontSize: 13, lineHeight: 1.65, fontStyle: "italic",
            flex: 1,
          }}>
            "{discount.message}"
          </div>
        </div>
      </div>

      {/* ── Urgency bar ── */}
      <div>
        <div style={{
          display: "flex", justifyContent: "space-between",
          marginBottom: 7, fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
        }}>
          <span style={{ color: "#6b7280" }}>URGENCY LEVEL</span>
          <span style={{ color: uc }}>{discount.urgency.toUpperCase()}</span>
        </div>
        <div style={{ background: "#0d0f24", borderRadius: 6, height: 9, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: uw, borderRadius: 6,
            background: `linear-gradient(90deg, ${uc}88, ${uc})`,
            boxShadow: `0 0 10px ${uc}66`,
            transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
          }} />
        </div>
      </div>

      {/* ── Why this recommendation ── */}
      <div>
        <div style={{
          color: "#6b7280", fontSize: 11, fontWeight: 700,
          letterSpacing: 1, marginBottom: 10,
        }}>
          WHY THIS RECOMMENDATION
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {discount.reasons.map((reason, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "9px 13px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid #1a1d3a", borderRadius: 9,
              fontSize: 12.5, color: "#94a3b8", lineHeight: 1.5,
              animation: `fadeUp .3s ease ${i * 0.06}s both`,
            }}>
              <span style={{
                color: meta.colour, fontWeight: 700, flexShrink: 0, marginTop: 1,
              }}>
                →
              </span>
              {reason}
            </div>
          ))}
        </div>
      </div>

      {/* ── Conversion context row ── */}
      <div style={{
        display: "flex", gap: 10, flexWrap: "wrap",
        paddingTop: 14, borderTop: "1px solid #1a1d3a",
      }}>
        {[
          { label: "Conversion Probability", value: `${convPct}%`,          color: meta.colour },
          { label: "Base Discount",          value: `${discount.base_pct}%`, color: "#7c3aed"   },
          { label: "Behaviour Adjustment",
            value: discount.adjustment > 0 ? `+${discount.adjustment}%` : discount.adjustment < 0 ? `${discount.adjustment}%` : "0%",
            color: discount.adjustment > 0 ? "#ef4444" : discount.adjustment < 0 ? "#10b981" : "#6b7280",
          },
          { label: "Final Recommendation", value: discount.discount_pct === 0 ? "No discount" : `${discount.discount_pct}% off`, color: meta.colour },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            flex: "1 1 120px",
            background: "rgba(255,255,255,0.025)",
            border: "1px solid #1a1d3a", borderRadius: 10,
            padding: "10px 14px", textAlign: "center",
          }}>
            <div style={{ color: "#6b7280", fontSize: 10, marginBottom: 5, letterSpacing: 0.3 }}>{label}</div>
            <div style={{
              color, fontSize: 16, fontWeight: 800,
              fontFamily: "JetBrains Mono, monospace",
              textShadow: `0 0 10px ${color}55`,
            }}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Empty({ message }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 10, padding: "32px 0", color: "#4b5280", textAlign: "center",
    }}>
      <span style={{ fontSize: 30 }}>💰</span>
      <div style={{ fontSize: 13 }}>{message}</div>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "4px 0" }}>
      {[80, 100, 60].map((w, i) => (
        <div key={i} style={{
          height: i === 0 ? 80 : 14, width: `${w}%`,
          background: "#1a1d3a", borderRadius: 8,
          animation: "pulse 1.5s ease-in-out infinite",
        }} />
      ))}
    </div>
  );
}
