import { useCart } from "../../context/CartContext";
import { formatINR } from "../../data/products";

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { items, totalItems, totalPrice, removeFromCart, increment, decrement } = useCart();

  return (
    <>
      {open && (
        <div onClick={onClose} style={{
          position: "fixed", inset: 0, background: "#00000055",
          zIndex: 300, backdropFilter: "blur(2px)",
        }} />
      )}

      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 400,
        width: 400, background: "#fff",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.35s cubic-bezier(.4,0,.2,1)",
        display: "flex", flexDirection: "column",
        boxShadow: "-8px 0 40px #00000033",
      }}>
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#0f172a" }}>Your Cart</div>
            <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>{totalItems} item{totalItems !== 1 ? "s" : ""}</div>
          </div>
          <button onClick={onClose} style={{
            background: "#f1f5f9", border: "none", borderRadius: "50%",
            width: 34, height: 34, fontSize: 16, cursor: "pointer",
          }}>X</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
          {items.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", gap: 16, color: "#94a3b8",
            }}>
              <span style={{ fontSize: 64 }}>🛒</span>
              <p style={{ fontSize: 16, fontWeight: 600 }}>Your cart is empty</p>
              <button onClick={onClose} style={{
                background: "#7c3aed", color: "#fff", border: "none",
                padding: "10px 24px", borderRadius: 10, fontWeight: 700, cursor: "pointer",
              }}>Continue Shopping</button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 24px", borderBottom: "1px solid #f8fafc",
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 10, flexShrink: 0,
                  background: item.gradient,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28,
                }}>
                  {item.emoji}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 2 }}>{item.name}</div>
                  <div style={{ color: "#7c3aed", fontWeight: 700, fontSize: 13 }}>{formatINR(item.price)}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <button onClick={() => decrement(item.id)} style={smallBtn}>-</button>
                    <span style={{ fontSize: 13, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                    <button onClick={() => increment(item.id)} style={smallBtn}>+</button>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, color: "#0f172a" }}>{formatINR(item.price * item.qty)}</div>
                  <button onClick={() => removeFromCart(item.id)} style={{
                    marginTop: 8, background: "none", border: "none",
                    color: "#ef4444", fontSize: 12, cursor: "pointer",
                  }}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div style={{ padding: 24, borderTop: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ color: "#64748b", fontSize: 14 }}>Subtotal ({totalItems} items)</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: "#0f172a" }}>{formatINR(totalPrice)}</span>
            </div>
            <div style={{ color: "#10b981", fontSize: 12, marginBottom: 16, textAlign: "center" }}>
              Free shipping on orders above Rs.999
            </div>
            <button onClick={onCheckout} style={{
              width: "100%", padding: "14px 0",
              background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
              color: "#fff", border: "none", borderRadius: 12,
              fontWeight: 800, fontSize: 15, cursor: "pointer",
              boxShadow: "0 4px 16px #7c3aed55",
            }}>
              Checkout — {formatINR(totalPrice)}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

const smallBtn = {
  background: "#f1f5f9", border: "none", borderRadius: 6,
  width: 24, height: 24, cursor: "pointer", fontSize: 14,
  display: "flex", alignItems: "center", justifyContent: "center",
};
