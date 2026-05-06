import { useState, useMemo } from "react";
import { PRODUCTS, CATEGORIES } from "../data/products";
import Navbar       from "../components/store/Navbar";
import ProductCard  from "../components/store/ProductCard";
import ProductModal from "../components/store/ProductModal";
import CartDrawer   from "../components/store/CartDrawer";
import ANFISOverlay from "../components/store/ANFISOverlay";
import CheckoutPage from "./CheckoutPage";

const SORT_OPTIONS = [
  { value: "featured",    label: "Featured" },
  { value: "price-asc",  label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating",     label: "Top Rated" },
  { value: "popular",    label: "Most Popular" },
];

export default function StorePage({ onViewDashboard, onViewLanding }) {
  const [category, setCategory] = useState("All");
  const [search,   setSearch]   = useState("");
  const [sort,     setSort]     = useState("featured");
  const [cartOpen, setCartOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [checkout, setCheckout] = useState(false);

  const filtered = useMemo(() => {
    let list = PRODUCTS;

    if (category !== "All") {
      list = list.filter(p => p.category === category);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.features.some(f => f.toLowerCase().includes(q))
      );
    }

    switch (sort) {
      case "price-asc":  return [...list].sort((a, b) => a.price - b.price);
      case "price-desc": return [...list].sort((a, b) => b.price - a.price);
      case "rating":     return [...list].sort((a, b) => b.rating - a.rating);
      case "popular":    return [...list].sort((a, b) => b.reviews - a.reviews);
      default:           return list;
    }
  }, [category, search, sort]);

  const hasFilters = search.trim() !== "" || sort !== "featured" || category !== "All";

  const clearAll = () => {
    setSearch("");
    setSort("featured");
    setCategory("All");
  };

  if (checkout) return <CheckoutPage onBack={() => setCheckout(false)} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      <Navbar
        onCartOpen={() => setCartOpen(true)}
        onViewDashboard={onViewDashboard}
        activeCategory={category}
        onCategory={(cat) => { setCategory(cat); setSort("featured"); }}
        categories={CATEGORIES}
        search={search}
        onSearch={setSearch}
      />

      {/* ── Hero Banner ── */}
      <div style={{
        background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#312e81 100%)",
        padding: "48px 40px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: [400,300,200][i], height: [400,300,200][i],
            borderRadius: "50%",
            background: "#7c3aed11", border: "1px solid #7c3aed22",
            top: ["-100px","-50px","20px"][i], left: ["60%","70%","75%"][i],
          }} />
        ))}

        <div style={{ position: "relative", zIndex: 1 }}>
          {onViewLanding && (
            <button onClick={onViewLanding} style={{
              position: "absolute", top: 0, left: 0,
              background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)",
              color: "#94a3b8", padding: "6px 14px", borderRadius: 8,
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>
              ← Home
            </button>
          )}
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
            {[["🧠","27 Fuzzy Rules"],["⚡","Real-time Inference"],["👁","Behaviour Tracking"],["📊","Explainable AI"]].map(([icon, label]) => (
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

      {/* ── Sort & Filter Bar ── */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #e2e8f0",
        padding: "12px 40px",
        display: "flex", alignItems: "center", gap: 12,
        flexWrap: "wrap", justifyContent: "space-between",
        boxShadow: "0 1px 4px #00000009",
      }}>
        {/* Sort options */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ color: "#64748b", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, whiteSpace: "nowrap" }}>
            SORT BY
          </span>
          {SORT_OPTIONS.map(({ value, label }) => {
            const active = sort === value;
            return (
              <button key={value} onClick={() => setSort(value)} style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: "pointer", transition: "all .18s", whiteSpace: "nowrap",
                background: active ? "#7c3aed" : "transparent",
                color: active ? "#fff" : "#64748b",
                border: active ? "none" : "1px solid #e2e8f0",
              }}>
                {label}
              </button>
            );
          })}
        </div>

        {/* Right side: result count + clear */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#94a3b8", fontSize: 13 }}>
            <span style={{ color: "#0f172a", fontWeight: 700 }}>{filtered.length}</span>
            {" "}of {PRODUCTS.length} products
          </span>
          {hasFilters && (
            <button onClick={clearAll} style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              color: "#ef4444", padding: "5px 14px", borderRadius: 8,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5,
            }}>
              ✕ Clear All
            </button>
          )}
        </div>
      </div>

      {/* ── Active Filters Chips ── */}
      {hasFilters && (
        <div style={{
          padding: "10px 40px",
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
        }}>
          <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>Active:</span>
          {category !== "All" && (
            <Chip label={`Category: ${category}`} onRemove={() => setCategory("All")} />
          )}
          {search.trim() && (
            <Chip label={`Search: "${search}"`} onRemove={() => setSearch("")} />
          )}
          {sort !== "featured" && (
            <Chip label={`Sort: ${SORT_OPTIONS.find(o => o.value === sort)?.label}`} onRemove={() => setSort("featured")} />
          )}
        </div>
      )}

      {/* ── Product Grid ── */}
      <div style={{ padding: "32px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ color: "#0f172a", fontSize: 22, fontWeight: 800, margin: 0 }}>
              {search.trim()
                ? `Results for "${search}"`
                : category === "All" ? "All Products" : category}
            </h2>
            <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>
              {filtered.length} products · Add items to cart and watch the AI prediction change!
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState search={search} onClear={clearAll} />
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 20,
          }}>
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                searchQuery={search}
                onClick={() => setSelected(product)}
              />
            ))}
          </div>
        )}
      </div>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => { setCartOpen(false); setCheckout(true); }}
      />
      <ANFISOverlay />
    </div>
  );
}

/* ── Filter Chip ── */
function Chip({ label, onRemove }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "#7c3aed14", border: "1px solid #7c3aed33",
      color: "#7c3aed", padding: "4px 10px 4px 12px", borderRadius: 999,
      fontSize: 12, fontWeight: 600,
    }}>
      {label}
      <button onClick={onRemove} style={{
        background: "none", border: "none", cursor: "pointer",
        color: "#7c3aed", fontSize: 13, lineHeight: 1, padding: 0,
        display: "flex", alignItems: "center",
      }}>×</button>
    </div>
  );
}

/* ── Empty State ── */
function EmptyState({ search, onClear }) {
  return (
    <div style={{
      textAlign: "center", padding: "80px 40px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
    }}>
      <div style={{ fontSize: 56 }}>🔍</div>
      <h3 style={{ color: "#0f172a", fontSize: 20, fontWeight: 800, margin: 0 }}>
        No products found
      </h3>
      <p style={{ color: "#64748b", fontSize: 14, maxWidth: 360, margin: 0, lineHeight: 1.6 }}>
        {search.trim()
          ? `No results for "${search}". Try a different keyword or clear your filters.`
          : "No products match the current filters."}
      </p>
      <button onClick={onClear} style={{
        marginTop: 8, background: "#7c3aed", border: "none", color: "#fff",
        padding: "10px 24px", borderRadius: 9, fontSize: 13, fontWeight: 700,
        cursor: "pointer",
      }}>
        Clear Filters
      </button>
    </div>
  );
}
