import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { formatINR } from "../../data/products";

const STARS = (r) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));

export default function ProductCard({ product, onClick }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff", borderRadius: 16, overflow: "hidden", cursor: "pointer",
        boxShadow: hovered ? "0 12px 40px #00000022" : "0 2px 12px #00000011",
        transform: hovered ? "translateY(-4px)" : "none",
        transition: "all 0.25s ease", position: "relative",
        border: "1px solid #e2e8f0",
      }}
    >
      {product.badge && (
        <div style={{
          position: "absolute", top: 12, left: 12, zIndex: 2,
          background: "#7c3aed", color: "#fff",
          padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
        }}>
          {product.badge}
        </div>
      )}

      {discount > 0 && (
        <div style={{
          position: "absolute", top: 12, right: 12, zIndex: 2,
          background: "#ef4444", color: "#fff",
          padding: "3px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700,
        }}>
          -{discount}%
        </div>
      )}

      <div style={{
        background: product.gradient, height: 180,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 72, userSelect: "none",
        transition: "transform 0.3s",
        transform: hovered ? "scale(1.05)" : "scale(1)",
      }}>
        {product.emoji}
      </div>

      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ color: "#7c3aed", fontSize: 11, fontWeight: 600, marginBottom: 4, letterSpacing: 0.5 }}>
          {product.category.toUpperCase()}
        </div>
        <div style={{ color: "#0f172a", fontWeight: 700, fontSize: 15, marginBottom: 6, lineHeight: 1.3 }}>
          {product.name}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <span style={{ color: "#f59e0b", fontSize: 12 }}>{STARS(product.rating)}</span>
          <span style={{ color: "#64748b", fontSize: 11 }}>{product.rating} ({product.reviews.toLocaleString()})</span>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
          <span style={{ color: "#0f172a", fontWeight: 800, fontSize: 18 }}>{formatINR(product.price)}</span>
          <span style={{ color: "#94a3b8", fontSize: 12, textDecoration: "line-through" }}>{formatINR(product.originalPrice)}</span>
        </div>

        <button onClick={handleAdd} style={{
          width: "100%", padding: "10px 0",
          background: added ? "#10b981" : "#7c3aed",
          color: "#fff", border: "none", borderRadius: 10,
          fontWeight: 700, fontSize: 13, cursor: "pointer",
          transition: "background 0.3s",
        }}>
          {added ? "✓ Added!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
