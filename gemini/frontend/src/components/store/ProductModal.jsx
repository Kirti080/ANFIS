import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { formatINR } from "../../data/products";

const STARS = (r) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 1200);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "#00000088", display: "flex",
        alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20,
          width: "min(720px, 95vw)", maxHeight: "90vh",
          overflow: "auto", display: "flex",
          boxShadow: "0 32px 80px #00000055",
        }}
      >
        <div style={{
          background: product.gradient, flex: "0 0 280px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 100, borderRadius: "20px 0 0 20px",
        }}>
          {product.emoji}
        </div>

        <div style={{ flex: 1, padding: 32, position: "relative" }}>
          <button onClick={onClose} style={{
            position: "absolute", top: 16, right: 16,
            background: "#f1f5f9", border: "none", borderRadius: "50%",
            width: 32, height: 32, fontSize: 16, cursor: "pointer",
          }}>X</button>

          <div style={{ color: "#7c3aed", fontSize: 12, fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>
            {product.category.toUpperCase()}
          </div>

          <h2 style={{ color: "#0f172a", fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>
            {product.name}
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ color: "#f59e0b", fontSize: 14 }}>{STARS(product.rating)}</span>
            <span style={{ color: "#64748b", fontSize: 12 }}>{product.rating} · {product.reviews.toLocaleString()} reviews</span>
          </div>

          <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.7, marginBottom: 18 }}>
            {product.description}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {product.features.map(f => (
              <span key={f} style={{
                background: "#f1f5f9", color: "#475569",
                padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
              }}>
                {f}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: "#0f172a" }}>{formatINR(product.price)}</span>
            <span style={{ fontSize: 14, color: "#94a3b8", textDecoration: "line-through" }}>{formatINR(product.originalPrice)}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}>Save {discount}%</span>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={qtyBtn}>-</button>
              <span style={{ padding: "0 18px", color: "#0f172a", fontWeight: 700 }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} style={qtyBtn}>+</button>
            </div>

            <button onClick={handleAdd} style={{
              flex: 1, padding: "12px 0",
              background: added ? "#10b981" : "#7c3aed",
              color: "#fff", border: "none", borderRadius: 10,
              fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "background .3s",
            }}>
              {added ? "Added to Cart!" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const qtyBtn = {
  background: "none", border: "none", padding: "10px 14px",
  fontSize: 18, cursor: "pointer", color: "#0f172a",
};
