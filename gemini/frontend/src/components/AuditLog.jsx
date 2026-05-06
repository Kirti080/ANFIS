/**
 * AuditLog — MongoDB prediction audit trail
 * Polls every 10 s to stay fresh.
 */

import { useState, useEffect } from "react";
import { fetchAuditLog, fetchStats } from "../services/api";

export default function AuditLog() {
  const [logs,  setLogs]  = useState([]);
  const [stats, setStats] = useState(null);
  const [err,   setErr]   = useState(null);

  const load = async () => {
    try {
      const [l, s] = await Promise.all([fetchAuditLog({ limit: 20 }), fetchStats()]);
      setLogs(l);
      setStats(s);
      setErr(null);
    } catch {
      setErr("MongoDB unavailable — start the backend and database.");
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 10_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stats cards */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "Total Predictions", value: stats.total_predictions, colour: "#a78bfa" },
            { label: "Purchases",         value: stats.purchases,         colour: "#10b981" },
            { label: "Dropoffs",          value: stats.dropoffs,          colour: "#ef4444" },
            { label: "Conversion Rate",   value: stats.conversion_rate + "%", colour: "#f59e0b" },
          ].map(({ label, value, colour }) => (
            <div key={label} style={{
              background: "#12132a", border: "1px solid #1e2035", borderRadius: 10,
              padding: "12px 16px", textAlign: "center",
            }}>
              <div style={{ color: colour, fontSize: 22, fontWeight: 700 }}>{value}</div>
              <div style={{ color: "#6b7280", fontSize: 11, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {err && <div style={{ color: "#ef4444", fontSize: 12, padding: 8 }}>{err}</div>}

      {/* Log table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e2035" }}>
              {["Time", "Session", "Interaction", "Cart", "Score", "Decision", "Confidence"].map(h => (
                <th key={h} style={{ color: "#6b7280", padding: "6px 10px", textAlign: "left", fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={7} style={{ color: "#4a5568", textAlign: "center", padding: 24 }}>
                  No predictions logged yet.
                </td>
              </tr>
            )}
            {logs.map((log) => {
              const isPurchase = log.outputs?.decision === "PURCHASE";
              const colour     = isPurchase ? "#10b981" : "#ef4444";
              return (
                <tr key={log._id} style={{ borderBottom: "1px solid #0d0e1f" }}>
                  <td style={{ color: "#6b7280", padding: "7px 10px" }}>
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </td>
                  <td style={{ color: "#e2e8f0", padding: "7px 10px" }}>
                    {(log.inputs?.session_duration * 100).toFixed(0)}%
                  </td>
                  <td style={{ color: "#e2e8f0", padding: "7px 10px" }}>
                    {(log.inputs?.interaction_intensity * 100).toFixed(0)}%
                  </td>
                  <td style={{ color: "#e2e8f0", padding: "7px 10px" }}>
                    {(log.inputs?.cart_depth * 100).toFixed(0)}%
                  </td>
                  <td style={{ color: "#a78bfa", padding: "7px 10px", fontFamily: "monospace" }}>
                    {log.outputs?.fuzzy_score?.toFixed(1)}%
                  </td>
                  <td style={{ padding: "7px 10px" }}>
                    <span style={{
                      background: colour + "22", color: colour,
                      padding: "2px 10px", borderRadius: 999, fontWeight: 700, fontSize: 11,
                    }}>
                      {log.outputs?.decision}
                    </span>
                  </td>
                  <td style={{ color: "#94a3b8", padding: "7px 10px" }}>
                    {((log.outputs?.confidence ?? 0) * 100).toFixed(0)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
