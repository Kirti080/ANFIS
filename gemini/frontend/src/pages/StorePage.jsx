import { useState } from "react";
import { PRODUCTS, CATEGORIES } from "../data/products";
import Navbar       from "../components/store/Navbar";
import ProductCard  from "../components/store/ProductCard";
import ProductModal from "../components/store/ProductModal";
import CartDrawer   from "../components/store/CartDrawer";
import ANFISOverlay from "../components/store/ANFISOverlay";
import CheckoutPage from "./CheckoutPage";

export default function StorePage({ onViewDashboard }) {
  const [category,  setCategory]  = useState("All");
  const [cartOpen,  setCartOpen]  = useState(false);
  const [selected,  setSelected]  = useState(null);
  const [checkout,  setCheckout]  = useState(false);

  const filtered = category === "All"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === category);

  if (checkout) return <CheckoutPage onBack={() => setCheckout(false)} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      <Navbar
        onCartOpen={() => setCartOpen(true)}
        onViewDashboard={onViewDashboard}
        activeCategory={category}
        onCategory={setCategory}
        categories={CATEGORIES}
      />

      {/* ── Hero Banner ── */}
      <div style={{
        background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#312e81 100%)",
        padding: "48px 40px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles */}
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: [400,300,200][i], height: [400,300,200][i],
            borderRadius: "50%",
            background: "#7c3aed11",
            border: "1px solid #7c3aed22",
            top: ["-100px","-50px","20px"][i], left: ["60%","70%","75%"][i],
          }} />
        ))}

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-block", background: "#7c3aed33", border: "1px solid #7c3aed",
            color: "#a78bfa", padding: "4px 16px", borderRadius: 999,
            fontSize: 12, fontWeight: 700, letterSpacing: 1.5, marginBottom: 16,
          }}>
            🧠 AI-POWERED SHOPPING INTELLIGENCE
          </div>
          <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 900, margin: "0 0 12px", lineHeight: 1.2 }}>
            Shop Smarter with <span style={{ color: "#a78bfa" }}>Neuro-Fuzzy AI</span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 16, maxWidth: 500, margin: "0 auto 24px" }}>
            Our ANFIS engine watches your session in real time and predicts your intent.
            Watch the overlay in the bottom-right corner as you browse.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              ["🧠", "27 Fuzzy Rules"],
              ["⚡", "Real-time Inference"],
              ["👁", "Behaviour Tracking"],
              ["📊", "Explainable AI"],
            ].map(([icon, label]) => (
              <div key={label} style={{
                background: "#ffffff11", border: "1px solid #ffffff22",
                padding: "6px 16px", borderRadius: 999, color: "#e2e8f0", fontSize: 13,
              }}>
                {icon} {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div style={{ padding: "32px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ color: "#0f172a", fontSize: 22, fontWeight: 800, margin: 0 }}>
              {category === "All" ? "All Products" : category}
            </h2>
            <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>
              {filtered.length} products · Add items to cart and watch the AI prediction change!
            </p>
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 20,
        }}>
          {filtered.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => setSelected(product)}
            />
          ))}
        </div>
      </div>

      {/* ── Modals & Drawers ── */}
      <ProductModal product={selected} onClose={() => setSelected(null)} />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => { setCartOpen(false); setCheckout(true); }}
      />

      {/* ── ANFIS Live Overlay ── */}
      <ANFISOverlay />
    </div>
  );
}
