import { useState } from "react";
import { useCart }     from "../context/CartContext";
import { useBehavior } from "../context/BehaviorContext";
import { formatINR }   from "../data/products";
import ANFISOverlay    from "../components/store/ANFISOverlay";

export default function CheckoutPage({ onBack }) {
  const { items, totalPrice, clearCart } = useCart();
  const behavior = useBehavior();
  const [placed, setPlaced] = useState(false);
  const [step,   setStep]   = useState(1);

  const score = Math.round(
    behavior.session_duration * 40 +
    behavior.interaction_intensity * 40 +
    behavior.cart_depth * 20
  );
  const isHighIntent = score >= 40;
  const discount     = isHighIntent ? 0 : Math.round(totalPrice * 0.1);
  const finalPrice   = totalPrice - discount;

  if (placed) return <OrderSuccess onBack={onBack} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      {/* Header */}
      <div style={{
        background: "#0f172a", padding: "16px 32px",
        display: "flex", alignItems: "center", gap: 20, borderBottom: "1px solid #1e293b",
      }}>
        <button onClick={onBack} style={{
          background: "none", border: "1px solid #334155", color: "#94a3b8",
          padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13,
        }}>
          Back to Store
        </button>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>Checkout</span>
      </div>

      <div style={{
        maxWidth: 960, margin: "32px auto", padding: "0 24px",
        display: "grid", gridTemplateColumns: "1fr 360px", gap: 24,
      }}>

        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ANFIS banner */}
          <div style={{
            background: isHighIntent
              ? "linear-gradient(135deg,#065f46,#064e3b)"
              : "linear-gradient(135deg,#7f1d1d,#450a0a)",
            border: `1px solid ${isHighIntent ? "#10b981" : "#ef4444"}44`,
            borderRadius: 14, padding: 18,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <span style={{ fontSize: 32 }}>{isHighIntent ? "🎯" : "💡"}</span>
              <div>
                <div style={{ color: isHighIntent ? "#10b981" : "#f87171", fontWeight: 800, fontSize: 15, marginBottom: 6 }}>
                  {isHighIntent ? "ANFIS: High Purchase Intent Detected" : "ANFIS: Special Offer for You!"}
                </div>
                <p style={{ color: "#cbd5e1", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                  {isHighIntent
                    ? `Your session of ${behavior.raw.seconds}s, ${behavior.raw.interactions} interactions and ${behavior.raw.cartItems} cart item(s) signals strong intent. Our ANFIS model is confident you will complete this purchase.`
                    : `Our ANFIS model detected lower engagement. Here is an exclusive 10% discount: SAVE10 — already applied below!`}
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div style={{ display: "flex", gap: 0, background: "#fff", borderRadius: 12, padding: 4, border: "1px solid #e2e8f0" }}>
            {["Delivery", "Payment", "Confirm"].map((s, i) => (
              <div key={s} onClick={() => setStep(i + 1)} style={{
                flex: 1, padding: "10px 0", textAlign: "center",
                background: step === i + 1 ? "#7c3aed" : "none",
                borderRadius: 9, cursor: "pointer",
                color: step === i + 1 ? "#fff" : "#94a3b8",
                fontWeight: step === i + 1 ? 700 : 400, fontSize: 13, transition: "all .2s",
              }}>
                {i + 1}. {s}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div style={card}>
              <SectionTitle>Delivery Details</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <FormField label="First Name"  placeholder="Rahul" />
                <FormField label="Last Name"   placeholder="Sharma" />
                <FormField label="Email"       placeholder="rahul@example.com" full />
                <FormField label="Phone"       placeholder="+91 98765 43210" />
                <FormField label="Address"     placeholder="123, MG Road" full />
                <FormField label="City"        placeholder="Mumbai" />
                <FormField label="PIN Code"    placeholder="400001" />
              </div>
              <button onClick={() => setStep(2)} style={primaryBtn}>Continue to Payment</button>
            </div>
          )}

          {step === 2 && (
            <div style={card}>
              <SectionTitle>Payment</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <FormField label="Card Number" placeholder="4242 4242 4242 4242" full />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <FormField label="Expiry"  placeholder="MM/YY" />
                  <FormField label="CVV"     placeholder="123" />
                </div>
                {!isHighIntent && (
                  <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8, padding: 12, fontSize: 13, color: "#92400e" }}>
                    Discount code SAVE10 applied — you save {formatINR(discount)}!
                  </div>
                )}
              </div>
              <button onClick={() => setStep(3)} style={primaryBtn}>Review Order</button>
            </div>
          )}

          {step === 3 && (
            <div style={card}>
              <SectionTitle>Confirm Your Order</SectionTitle>
              {items.map(item => (
                <div key={item.id} style={{ display: "flex", gap: 12, marginBottom: 12, padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: item.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {item.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>{item.name}</div>
                    <div style={{ color: "#94a3b8", fontSize: 12 }}>Qty: {item.qty}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{formatINR(item.price * item.qty)}</div>
                </div>
              ))}
              <button onClick={() => { clearCart(); setPlaced(true); }} style={{
                ...primaryBtn,
                background: "linear-gradient(135deg,#10b981,#059669)",
                boxShadow: "0 4px 16px #10b98155",
              }}>
                Place Order — {formatINR(finalPrice)}
              </button>
            </div>
          )}
        </div>

        {/* Right — summary */}
        <div>
          <div style={card}>
            <SectionTitle>Order Summary</SectionTitle>
            {items.map(item => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 }}>
                <span style={{ color: "#475569" }}>{item.name} x{item.qty}</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>{formatINR(item.price * item.qty)}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #f1f5f9", margin: "14px 0", paddingTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b", marginBottom: 6 }}>
                <span>Subtotal</span><span>{formatINR(totalPrice)}</span>
              </div>
              {!isHighIntent && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#10b981", marginBottom: 6 }}>
                  <span>ANFIS Discount (10%)</span><span>- {formatINR(discount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b", marginBottom: 14 }}>
                <span>Shipping</span><span style={{ color: "#10b981" }}>FREE</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18, color: "#0f172a" }}>
                <span>Total</span><span>{formatINR(finalPrice)}</span>
              </div>
            </div>

            {/* ANFIS session summary */}
            <div style={{ background: "#f8faff", borderRadius: 10, padding: 12, marginTop: 14, border: "1px solid #e0e7ff" }}>
              <div style={{ color: "#7c3aed", fontWeight: 700, fontSize: 11, marginBottom: 8, letterSpacing: 0.5 }}>
                ANFIS SESSION METRICS
              </div>
              {[
                ["Session",  `${Math.floor(behavior.raw.seconds / 60)}m ${behavior.raw.seconds % 60}s`, Math.round(behavior.session_duration * 100)],
                ["Activity", `${behavior.raw.interactions} events`,                                      Math.round(behavior.interaction_intensity * 100)],
                ["Cart",     `${behavior.raw.cartItems} items`,                                          Math.round(behavior.cart_depth * 100)],
              ].map(([label, val, pct]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: "#6b7280" }}>{label}</span>
                  <span style={{ color: "#374151" }}>{val}</span>
                  <span style={{ color: "#7c3aed", fontWeight: 700 }}>{pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ANFISOverlay />
    </div>
  );
}

function OrderSuccess({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{ fontSize: 80, marginBottom: 20 }}>🎉</div>
        <h1 style={{ color: "#0f172a", fontSize: 28, fontWeight: 800 }}>Order Placed!</h1>
        <p style={{ color: "#64748b", fontSize: 15, margin: "12px 0 28px" }}>
          The ANFIS model correctly predicted your purchase intent. Your order is confirmed and will arrive in 3-5 business days.
        </p>
        <button onClick={onBack} style={{ ...primaryBtn, display: "inline-block", padding: "12px 32px" }}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

function FormField({ label, placeholder, full }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : "auto" }}>
      <label style={{ display: "block", color: "#475569", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{label}</label>
      <input placeholder={placeholder} style={{
        width: "100%", padding: "10px 12px", borderRadius: 8,
        border: "1.5px solid #e2e8f0", background: "#fff", color: "#0f172a",
        fontSize: 14, outline: "none", boxSizing: "border-box",
      }} />
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={{ color: "#0f172a", fontWeight: 800, fontSize: 16, marginBottom: 18 }}>{children}</div>;
}

const card = {
  background: "#fff", borderRadius: 14, padding: 24, border: "1px solid #e2e8f0",
  boxShadow: "0 2px 12px #00000009",
};

const primaryBtn = {
  display: "block", width: "100%", marginTop: 20, padding: "13px 0",
  background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
  color: "#fff", border: "none", borderRadius: 10,
  fontWeight: 800, fontSize: 15, cursor: "pointer",
  boxShadow: "0 4px 16px #7c3aed44",
};
