/**
 * PredictionGauge — Premium animated SVG gauge.
 * Features: dual pulsing rings, SVG glow filters, animated arc,
 * colour-coded status text, confidence bar, bouncy transitions.
 */

const toRad = (deg) => ((deg - 90) * Math.PI) / 180;

const polar = (cx, cy, r, deg) => ({
  x: cx + r * Math.cos(toRad(deg)),
  y: cy + r * Math.sin(toRad(deg)),
});

const arc = (cx, cy, r, a1, a2) => {
  const s = polar(cx, cy, r, a1);
  const e = polar(cx, cy, r, a2);
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${e.x} ${e.y}`;
};

const STATUS = [
  { min: 75, text: "High Purchase Intent",   emoji: "🟢", glow: "#10b981" },
  { min: 55, text: "Active Consideration",   emoji: "🟡", glow: "#f59e0b" },
  { min: 35, text: "Low Engagement",         emoji: "🟠", glow: "#f97316" },
  { min: 0,  text: "Unlikely to Purchase",   emoji: "🔴", glow: "#ef4444" },
];

function getColour(score) {
  if (score >= 70) return "#10b981";
  if (score >= 45) return "#f59e0b";
  return "#ef4444";
}

function getStatus(score) {
  return STATUS.find(s => score >= s.min) ?? STATUS[STATUS.length - 1];
}

export default function PredictionGauge({ score = 50, decision = "—", confidence = 0 }) {
  const cx = 150, cy = 160, r = 108;
  const START = -210, SWEEP = 240;
  const s = Math.max(0, Math.min(100, score));
  const fillEnd = START + (s / 100) * SWEEP;

  const colour  = getColour(s);
  const status  = getStatus(s);
  const needDeg = fillEnd;
  const tip     = polar(cx, cy, r - 16, needDeg);
  const b1      = polar(cx, cy, 10, needDeg + 90);
  const b2      = polar(cx, cy, 10, needDeg - 90);
  const edgeDot = polar(cx, cy, r, fillEnd);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>

      {/* ── SVG Gauge ── */}
      <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>

        {/* Outer ambient glow blob */}
        <div style={{
          position: "absolute",
          width: 280, height: 280, borderRadius: "50%",
          background: `radial-gradient(circle, ${colour}22 0%, transparent 70%)`,
          transition: "background 0.7s ease",
          animation: "pulse 3s ease-in-out infinite",
          pointerEvents: "none",
        }} />

        <svg
          width={300} height={210}
          viewBox="0 0 300 210"
          style={{ position: "relative", zIndex: 1 }}
        >
          <defs>
            {/* Arc glow */}
            <filter id="glow-arc" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {/* Needle glow */}
            <filter id="glow-needle" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {/* Score text glow */}
            <filter id="glow-text" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {/* Full rainbow gradient */}
            <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#ef4444" />
              <stop offset="35%"  stopColor="#f59e0b" />
              <stop offset="65%"  stopColor="#10b981" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            {/* Filled arc gradient */}
            <linearGradient id="fill-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={colour} stopOpacity="0.5" />
              <stop offset="100%" stopColor={colour} />
            </linearGradient>
          </defs>

          {/* ── Outer pulsing rings ── */}
          <circle cx={cx} cy={cy} r={r + 22}
            fill="none" stroke={colour} strokeWidth="1" strokeOpacity="0.2"
            style={{ animation: "ringPulse 2.5s ease-in-out infinite", transition: "stroke 0.6s" }}
          />
          <circle cx={cx} cy={cy} r={r + 34}
            fill="none" stroke={colour} strokeWidth="0.5" strokeOpacity="0.1"
            style={{ animation: "ringPulse 2.5s ease-in-out 1.2s infinite", transition: "stroke 0.6s" }}
          />

          {/* ── Background track ── */}
          <path
            d={arc(cx, cy, r, START, START + SWEEP)}
            fill="none" stroke="#1a1d3a" strokeWidth={22} strokeLinecap="round"
          />
          {/* subtle rainbow ghost track */}
          <path
            d={arc(cx, cy, r, START, START + SWEEP)}
            fill="none" stroke="url(#rainbow)" strokeWidth={22} strokeLinecap="round"
            strokeOpacity="0.06"
          />

          {/* ── Filled arc ── */}
          <path
            d={arc(cx, cy, r, START, fillEnd)}
            fill="none" stroke="url(#fill-grad)" strokeWidth={22} strokeLinecap="round"
            filter="url(#glow-arc)"
            style={{ transition: "all 0.75s cubic-bezier(0.34,1.56,0.64,1)" }}
          />

          {/* ── Leading edge bright dot ── */}
          {s > 1 && (
            <circle
              cx={edgeDot.x} cy={edgeDot.y} r={5}
              fill={colour} filter="url(#glow-needle)"
              style={{ transition: "all 0.75s cubic-bezier(0.34,1.56,0.64,1)" }}
            />
          )}

          {/* ── Tick marks ── */}
          {[0, 25, 50, 75, 100].map((v) => {
            const ang   = START + (v / 100) * SWEEP;
            const outer = polar(cx, cy, r + 9, ang);
            const inner = polar(cx, cy, r - 9, ang);
            const lbl   = polar(cx, cy, r + 22, ang);
            return (
              <g key={v}>
                <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                  stroke="#2d3050" strokeWidth={v % 50 === 0 ? 2.5 : 1.5} />
                <text x={lbl.x} y={lbl.y + 3} textAnchor="middle"
                  fill="#374060" style={{ fontSize: 9, fontFamily: "monospace" }}>
                  {v}
                </text>
              </g>
            );
          })}

          {/* ── Needle ── */}
          <polygon
            points={`${tip.x},${tip.y} ${b1.x},${b1.y} ${b2.x},${b2.y}`}
            fill={colour} filter="url(#glow-needle)"
            style={{ transition: "all 0.75s cubic-bezier(0.34,1.56,0.64,1)" }}
          />
          {/* pivot outer */}
          <circle cx={cx} cy={cy} r={15}
            fill="#0d0f24" stroke={colour} strokeWidth={2.5}
            style={{ transition: "stroke 0.6s", filter: `drop-shadow(0 0 8px ${colour}88)` }}
          />
          {/* pivot inner */}
          <circle cx={cx} cy={cy} r={6} fill={colour}
            style={{ transition: "fill 0.6s" }}
          />

          {/* ── Score text ── */}
          <text x={cx} y={cy + 40} textAnchor="middle" fill={colour}
            filter="url(#glow-text)"
            style={{
              fontSize: 36, fontWeight: 800,
              fontFamily: "JetBrains Mono, Courier New, monospace",
              transition: "fill 0.6s",
            }}
          >
            {s.toFixed(1)}%
          </text>
          <text x={cx} y={cy + 58} textAnchor="middle" fill="#374060"
            style={{ fontSize: 10, letterSpacing: 2, fontFamily: "monospace", textTransform: "uppercase" }}
          >
            fuzzy score
          </text>
        </svg>
      </div>

      {/* ── Status text ── */}
      <div style={{
        fontSize: 13, fontWeight: 800, letterSpacing: 1.8,
        color: colour, textTransform: "uppercase",
        textShadow: `0 0 18px ${colour}aa`,
        animation: "pulse 3s ease-in-out infinite",
        transition: "all 0.6s ease",
      }}>
        {status.emoji} {status.text}
      </div>

      {/* ── Decision badge ── */}
      <div style={{
        padding: "8px 32px", borderRadius: 999,
        fontWeight: 800, fontSize: 13, letterSpacing: 2.5,
        background: colour + "20",
        border: `1.5px solid ${colour}88`,
        color: colour,
        boxShadow: `0 0 20px ${colour}30, inset 0 0 12px ${colour}10`,
        transition: "all 0.6s ease",
      }}>
        {decision}
      </div>

      {/* ── Confidence bar ── */}
      <div style={{ width: "100%", maxWidth: 240 }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 11, marginBottom: 6,
        }}>
          <span style={{ color: "#4b5280" }}>Model Confidence</span>
          <span style={{
            color: "#c4b5fd", fontWeight: 700,
            fontFamily: "JetBrains Mono, monospace",
          }}>
            {(confidence * 100).toFixed(1)}%
          </span>
        </div>
        <div style={{
          height: 6, borderRadius: 4,
          background: "#1a1d3a",
          overflow: "hidden",
          boxShadow: "inset 0 1px 4px rgba(0,0,0,0.4)",
        }}>
          <div style={{
            height: "100%", borderRadius: 4,
            width: `${(confidence * 100)}%`,
            background: `linear-gradient(90deg, ${colour}80, ${colour})`,
            boxShadow: `0 0 10px ${colour}88`,
            transition: "width 0.75s cubic-bezier(0.34,1.56,0.64,1)",
          }} />
        </div>
      </div>
    </div>
  );
}
