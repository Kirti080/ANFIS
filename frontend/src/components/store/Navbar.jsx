import { useCart } from "../../context/CartContext";

export default function Navbar({ onCartOpen, onViewDashboard, activeCategory, onCategory, categories, search, onSearch }) {
  const { totalItems } = useCart();

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 200,
      background: "#0f172a", borderBottom: "1px solid #1e293b",
      boxShadow: "0 2px 20px #00000066",
    }}>
      {/* ── Top bar ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: 64,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26 }}>🛍</span>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>
              ShopSense
            </div>
            <div style={{ color: "#7c3aed", fontSize: 10, fontWeight: 600, letterSpacing: 1.5 }}>
              AI POWERED
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 480, margin: "0 32px", position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>
            🔍
          </span>
          <input
            value={search} onChange={e => onSearch(e.target.value)}
            placeholder="Search products..."
            style={{
              width: "100%", padding: "9px 12px 9px 38px", borderRadius: 8,
              background: "#1e293b", border: "1px solid #334155",
              color: "#e2e8f0", fontSize: 14, outline: "none",
            }}
          />
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={onViewDashboard} style={{
            background: "#7c3aed22", border: "1px solid #7c3aed",
            color: "#a78bfa", padding: "7px 14px", borderRadius: 8,
            fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>
            🧠 ANFIS Dashboard
          </button>

          {/* Cart */}
          <button onClick={onCartOpen} style={{
            position: "relative", background: "none", border: "none",
            cursor: "pointer", padding: 8, borderRadius: 8,
          }}>
            <span style={{ fontSize: 24 }}>🛒</span>
            {totalItems > 0 && (
              <span style={{
                position: "absolute", top: 2, right: 2,
                background: "#7c3aed", color: "#fff",
                borderRadius: "50%", width: 18, height: 18,
                fontSize: 11, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Category bar ── */}
      <div style={{
        display: "flex", gap: 0, padding: "0 32px",
        borderTop: "1px solid #1e293b", overflowX: "auto",
      }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => onCategory(cat)} style={{
            padding: "10px 20px", background: "none", border: "none",
            color: activeCategory === cat ? "#a78bfa" : "#94a3b8",
            borderBottom: activeCategory === cat ? "2px solid #7c3aed" : "2px solid transparent",
            fontWeight: activeCategory === cat ? 700 : 400,
            fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", transition: "all .2s",
          }}>
            {cat}
          </button>
        ))}
      </div>
    </header>
  );
}
