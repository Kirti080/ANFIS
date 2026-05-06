/**
 * AuditLog — MongoDB prediction audit trail.
 * Upgraded with glowing stat cards, colour-coded rows, and a live-refresh indicator.
 * Polls every 10 s to stay fresh.
 */

import { useState, useEffect } from "react";
import { fetchAuditLog, fetchStats } from "../services/api";

const STAT_CONFIG = [
  { key: "total_predictions", label: "Total Predictions", colour: "#a78bfa", icon: "∑" },
  { key: "purchases",         label: "Purchases",         colour: "#10b981",  icon: "✓" },
  { key: "dropoffs",          label: "Drop-offs",         colour: "#ef4444",  icon: "✗" },
  { key: "conversion_rate",   label: "Conversion Rate",   colour: "#f59e0b",  icon: "%" },
];

export default function AuditLog() {
  const [logs,     setLogs]     = useState([]);
  const [stats,    setStats]    = useState(null);
  const [err,      setErr]      = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [ticking,  setTicking]  = useState(false);

  const load = async () => {
    setTicking(true);
    try {
      const [l, s] = await Promise.all([fetchAuditLog({ limit: 20 }), fetchStats()]);
      setLogs(l);
      setStats(s);
      setLastSync(new Date());
      setErr(null);
    } catch {
      setErr("MongoDB unavailable — start the backend and database.");
    } finally {
      setTicking(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 10_000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (d) =>
    d ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Live sync bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "8px 14px",
        background: "rgba(124,58,237,0.06)",
        border: "1px solid rgba(124,58,237,0.15)",
        borderRadius: 9,
        fontSize: 11,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#a78bfa" }}>
          <span style={{
            display: "inline-block", width: 7, height: 7, borderRadius: "50%",
            background: ticking ? "#7c3aed" : "#10b981",
            boxShadow: ticking ? "0 0 8px #7c3aed" : "0 0 8px #10b981",
            animation: "statusPulse 2s ease-in-out infinite",
          }} />
          {ticking ? "Syncing with MongoDB…" : "Live · auto-refresh every 10 s"}
        </div>
        <span style={{ color: "#4b5280" }}>
          Last sync: <span style={{ color: "#6b7280" }}>{formatTime(lastSync)}</span>
        </span>
      </div>

      {/* Stat cards */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {STAT_CONFIG.map(({ key, label, colour, icon }) => {
            const raw   = stats[key];
            const value = key === "conversion_rate" ? `${raw}%` : raw;
            return (
              <div
                key={key}
                className="stat-card"
                style={{ borderColor: colour + "22" }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = colour + "55";
                  e.currentTarget.style.boxShadow   = `0 0 24px ${colour}18`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = colour + "22";
                  e.currentTarget.style.boxShadow   = "none";
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: colour + "18",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 10px",
                  fontSize: 16, color: colour, fontWeight: 700,
                  boxShadow: `0 0 12px ${colour}22`,
                }}>
                  {icon}
                </div>
                <div style={{
                  color: colour, fontSize: 24, fontWeight: 700,
                  fontFamily: "JetBrains Mono, monospace",
                  textShadow: `0 0 12px ${colour}66`,
                  lineHeight: 1,
                }}>
                  {value ?? "—"}
                </div>
                <div style={{ color: "#6b7280", fontSize: 11, marginTop: 5, letterSpacing: 0.3 }}>
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {err && (
        <div style={{
          padding: "10px 14px", borderRadius: 9,
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.25)",
          color: "#ef4444", fontSize: 12,
        }}>
          ⚠ {err}
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #1a1d3a" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{
              background: "rgba(255,255,255,0.025)",
              borderBottom: "1px solid #1a1d3a",
            }}>
              {["Time", "Session", "Interaction", "Cart", "Score", "Decision", "Confidence"].map(h => (
                <th key={h} style={{
                  color: "#6b7280", padding: "10px 14px",
                  textAlign: "left", fontWeight: 600,
                  fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={7} style={{
                  color: "#4b5280", textAlign: "center", padding: 32,
                  fontSize: 13,
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>📭</div>
                  No predictions logged yet — run the simulator first.
                </td>
              </tr>
            )}
            {logs.map((log, idx) => {
              const isPurchase = log.outputs?.decision === "PURCHASE";
              const colour     = isPurchase ? "#10b981" : "#ef4444";
              return (
                <tr
                  key={log._id}
                  className="audit-row"
                  style={{
                    borderBottom: "1px solid #0d0f1e",
                    animation: `fadeSlideUp .25s ease ${Math.min(idx, 10) * 0.03}s both`,
                  }}
                >
                  <td style={{ color: "#6b7280", padding: "9px 14px", whiteSpace: "nowrap" }}>
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </td>
                  <td style={{ padding: "9px 14px" }}>
                    <MiniBar value={log.inputs?.session_duration ?? 0} colour="#7c3aed" />
                  </td>
                  <td style={{ padding: "9px 14px" }}>
                    <MiniBar value={log.inputs?.interaction_intensity ?? 0} colour="#60a5fa" />
                  </td>
                  <td style={{ padding: "9px 14px" }}>
                    <MiniBar value={log.inputs?.cart_depth ?? 0} colour="#34d399" />
                  </td>
                  <td style={{
                    color: "#a78bfa", padding: "9px 14px",
                    fontFamily: "JetBrains Mono, monospace", fontWeight: 700,
                  }}>
                    {log.outputs?.fuzzy_score?.toFixed(1)}%
                  </td>
                  <td style={{ padding: "9px 14px" }}>
                    <span style={{
                      background: colour + "18", color: colour,
                      padding: "3px 11px", borderRadius: 999,
                      fontWeight: 700, fontSize: 11, letterSpacing: 0.5,
                      border: `1px solid ${colour}44`,
                      boxShadow: `0 0 8px ${colour}22`,
                    }}>
                      {log.outputs?.decision}
                    </span>
                  </td>
                  <td style={{ padding: "9px 14px" }}>
                    <span style={{
                      color: "#94a3b8", fontFamily: "JetBrains Mono, monospace",
                    }}>
                      {((log.outputs?.confidence ?? 0) * 100).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {logs.length > 0 && (
        <div style={{ fontSize: 11, color: "#4b5280", textAlign: "right" }}>
          Showing latest {logs.length} entries
        </div>
      )}
    </div>
  );
}

/* Inline progress bar for input values in the table */
function MiniBar({ value, colour }) {
  const pct = Math.round(value * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 72 }}>
      <div style={{
        flex: 1, height: 4, borderRadius: 3, background: "#1a1d3a", overflow: "hidden",
      }}>
        <div style={{
          height: "100%", borderRadius: 3,
          width: `${pct}%`,
          background: colour,
          boxShadow: `0 0 4px ${colour}88`,
        }} />
      </div>
      <span style={{
        color: "#94a3b8", fontSize: 11,
        fontFamily: "JetBrains Mono, monospace",
        minWidth: 28, textAlign: "right",
      }}>
        {pct}%
      </span>
    </div>
  );
}
