/**
 * MembershipFunctionChart
 * =======================
 * Renders the three Gaussian MFs (Low / Medium / High) for a single input feature.
 * A vertical cursor line shows the current slider value.
 * Uses recharts LineChart — no canvas hacks needed.
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from "recharts";
import { useMemo } from "react";

const MF_COLOURS = ["#ef4444", "#f59e0b", "#10b981"];  // Low=red, Med=amber, High=green

function gaussian(x, c, sigma) {
  return Math.exp(-0.5 * Math.pow((x - c) / (sigma + 1e-8), 2));
}

function buildPoints(centers, sigmas, n = 100) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const x = i / n;
    const pt = { x: parseFloat(x.toFixed(3)) };
    centers.forEach((c, idx) => {
      pt[`mf${idx}`] = parseFloat(gaussian(x, c, sigmas[idx]).toFixed(4));
    });
    return pt;
  });
}

const MF_NAMES = ["Low", "Medium", "High"];

export default function MembershipFunctionChart({ featureName, centers, sigmas, currentValue }) {
  const data = useMemo(
    () => buildPoints(centers, sigmas),
    [JSON.stringify(centers), JSON.stringify(sigmas)]
  );

  return (
    <div style={{
      background: "#12132a", borderRadius: 12, padding: "16px 12px 8px",
      border: "1px solid #1e2035",
    }}>
      <div style={{ color: "#c4b5fd", fontWeight: 600, fontSize: 13, marginBottom: 10, letterSpacing: 0.5 }}>
        {featureName}
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2035" />
          <XAxis dataKey="x" type="number" domain={[0, 1]} tickCount={6}
            tick={{ fill: "#6b7280", fontSize: 10 }} />
          <YAxis domain={[0, 1]} tickCount={5}
            tick={{ fill: "#6b7280", fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: "#12132a", border: "1px solid #1e2035", borderRadius: 8, fontSize: 11 }}
            labelStyle={{ color: "#94a3b8" }}
            formatter={(v, name) => [v.toFixed(3), MF_NAMES[parseInt(name.replace("mf", ""))]]}
          />
          <Legend
            formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 11 }}>{MF_NAMES[parseInt(v.replace("mf", ""))]}</span>}
          />

          {/* Vertical cursor for current slider value */}
          {currentValue !== undefined && (
            <ReferenceLine x={currentValue} stroke="#7c3aed" strokeDasharray="4 3" strokeWidth={2} />
          )}

          {["mf0", "mf1", "mf2"].map((key, i) => (
            <Line key={key} type="monotone" dataKey={key}
              stroke={MF_COLOURS[i]} strokeWidth={2} dot={false} isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
