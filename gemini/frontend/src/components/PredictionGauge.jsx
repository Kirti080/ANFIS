/**
 * PredictionGauge — Custom SVG semicircular gauge
 * Shows conversion probability 0–100% with animated needle.
 */

const polarToXY = (cx, cy, r, angleDeg) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const arcPath = (cx, cy, r, startDeg, endDeg) => {
  const s = polarToXY(cx, cy, r, startDeg);
  const e = polarToXY(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
};

export default function PredictionGauge({ score = 50, decision = "—", confidence = 0 }) {
  const cx = 150, cy = 150, r = 110;
  // Gauge arc: -210° → 30°  (240° sweep, centred at bottom)
  const START = -210, SWEEP = 240;
  const fillEnd = START + (score / 100) * SWEEP;

  // Colour gradient based on score
  const colour =
    score >= 70 ? "#10b981" :   // green  → high conversion
    score >= 45 ? "#f59e0b" :   // amber  → borderline
                  "#ef4444";    // red    → dropout

  // Needle angle (maps 0→START, 100→START+SWEEP)
  const needleDeg = START + (score / 100) * SWEEP;
  const needleTip = polarToXY(cx, cy, r - 15, needleDeg);
  const needleBase1 = polarToXY(cx, cy, 12, needleDeg + 90);
  const needleBase2 = polarToXY(cx, cy, 12, needleDeg - 90);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={300} height={180} viewBox="0 0 300 180">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#ef4444" />
            <stop offset="50%"  stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* Background arc track */}
        <path
          d={arcPath(cx, cy, r, START, START + SWEEP)}
          fill="none" stroke="#1e2035" strokeWidth={18} strokeLinecap="round"
        />

        {/* Filled arc (progress) */}
        <path
          d={arcPath(cx, cy, r, START, fillEnd)}
          fill="none" stroke="url(#gaugeGrad)" strokeWidth={18} strokeLinecap="round"
          style={{ transition: "all 0.6s ease" }}
        />

        {/* Tick marks at 0, 25, 50, 75, 100 */}
        {[0, 25, 50, 75, 100].map((v) => {
          const ang = START + (v / 100) * SWEEP;
          const outer = polarToXY(cx, cy, r + 6, ang);
          const inner = polarToXY(cx, cy, r - 6, ang);
          return (
            <line key={v} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
              stroke="#4a5568" strokeWidth={2} />
          );
        })}

        {/* Needle */}
        <polygon
          points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
          fill={colour}
          style={{ transition: "all 0.6s ease" }}
        />
        <circle cx={cx} cy={cy} r={10} fill="#0a0b1e" stroke={colour} strokeWidth={3} />

        {/* Centre score label */}
        <text x={cx} y={cy + 38} textAnchor="middle" fill={colour}
          style={{ fontSize: 32, fontWeight: 700, fontFamily: "monospace", transition: "fill 0.4s" }}>
          {score.toFixed(1)}%
        </text>
        <text x={cx} y={cy + 57} textAnchor="middle" fill="#94a3b8" style={{ fontSize: 12 }}>
          Fuzzy Score
        </text>

        {/* Min / max labels */}
        <text x={28}  y={cy + 6} fill="#6b7280" style={{ fontSize: 11 }}>0%</text>
        <text x={262} y={cy + 6} fill="#6b7280" style={{ fontSize: 11 }}>100%</text>
      </svg>

      {/* Decision badge */}
      <div style={{
        padding: "6px 24px", borderRadius: 999, fontWeight: 700, fontSize: 15, letterSpacing: 2,
        background: colour + "22", border: `1.5px solid ${colour}`, color: colour,
        transition: "all 0.4s",
      }}>
        {decision}
      </div>

      <div style={{ color: "#94a3b8", fontSize: 12 }}>
        Confidence: <span style={{ color: "#e2e8f0", fontWeight: 600 }}>
          {(confidence * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
