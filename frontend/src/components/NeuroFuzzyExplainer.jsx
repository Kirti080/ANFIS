/**
 * NeuroFuzzyExplainer
 * ===================
 * "Teacher-Ready" educational section that explains the 5-layer ANFIS architecture.
 * No external dependencies — pure JSX + inline styles.
 */

const LAYERS = [
  {
    num:   1,
    name:  "Fuzzification",
    colour:"#7c3aed",
    formula: "μᵢⱼ(xᵢ) = exp( −(xᵢ − cᵢⱼ)² / 2σᵢⱼ² )",
    desc: `Each raw input value (e.g. session_duration = 0.7) is mapped to a
    membership degree in three fuzzy sets: Low, Medium, and High.
    The Gaussian bell curve answers: "How much does this value belong to each linguistic category?"
    The learned parameters cᵢⱼ (centre) and σᵢⱼ (width) shift and scale the bell during training.`,
  },
  {
    num:   2,
    name:  "Rule Firing (T-norm)",
    colour:"#3b82f6",
    formula: "wᵣ = μ₁ⱼ(x₁) × μ₂ₖ(x₂) × μ₃ₗ(x₃)",
    desc: `With 3 membership functions per input and 3 inputs, we get 3³ = 27 fuzzy rules.
    Each rule asks: "IF Session is Medium AND Interaction is High AND Cart is High THEN…"
    The product T-norm computes the joint confidence — if any single condition is weak, the whole rule fires weakly.`,
  },
  {
    num:   3,
    name:  "Normalisation",
    colour:"#06b6d4",
    formula: "w̄ᵣ = wᵣ / Σ wᵢ",
    desc: `Normalising projects all firing strengths onto the probability simplex: they sum to 1.
    This turns absolute rule activations into relative contributions, making the final output
    a proper convex combination and preventing scale drift during training.`,
  },
  {
    num:   4,
    name:  "TSK Consequent",
    colour:"#f59e0b",
    formula: "fᵣ = p·x₁ + q·x₂ + s·x₃ + b  (per rule)",
    desc: `Unlike classic Mamdani fuzzy systems (which use fuzzy output sets), the
    Takagi-Sugeno-Kang model assigns a linear function of the inputs to each rule's consequent.
    These 4 parameters per rule (27 × 4 = 108 weights) are learned by gradient descent.
    The weighted output is w̄ᵣ · fᵣ.`,
  },
  {
    num:   5,
    name:  "Output Summation",
    colour:"#10b981",
    formula: "ŷ = σ( Σ w̄ᵣ · fᵣ )",
    desc: `Sum all weighted consequents — this is TSK defuzzification.
    A final sigmoid activation σ(·) maps the real-valued sum to a probability in (0, 1).
    Values above 0.5 → PURCHASE, below 0.5 → DROPOUT.
    This layer has no trainable parameters; all the learning lives in Layers 1 and 4.`,
  },
];

const GD_SECTION = {
  title: "Gradient Descent — How the Network Learns",
  colour: "#ef4444",
  body: `The loss function is Binary Cross-Entropy:
  L = −[ y·log(ŷ) + (1−y)·log(1−ŷ) ]

  TensorFlow's autograd traces the computation graph backwards through all 5 layers:

  ① ∂L/∂P  (Consequent params, Layer 4)
     = ∂L/∂ŷ · w̄ᵣ · xᵢ
     These gradients are large and direct — the consequent layer is just a linear function.

  ② ∂L/∂c  (Gaussian centres, Layer 1)
     = ∂L/∂ŷ · ∂ŷ/∂w̄ · ∂w̄/∂w · ∂w/∂μ · ∂μ/∂c
     The chain passes through normalisation → rule product → Gaussian derivative:
     ∂μ/∂c = μ · (x − c) / σ²   ← shifts the bell left or right

  ③ ∂L/∂σ  (Gaussian widths, Layer 1)
     ∂μ/∂σ = μ · (x − c)² / σ³  ← narrows or widens the bell

  The Adam optimiser maintains per-parameter adaptive learning rates using
  first-moment (mean) and second-moment (uncentred variance) gradient estimates,
  corrected for initialisation bias. This is critical because premise gradients
  are often 10–100× smaller than consequent gradients.`,
};

export default function NeuroFuzzyExplainer() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Architecture pipeline */}
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
        {LAYERS.map((l, i) => (
          <div key={l.num} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{
              background: l.colour + "33", border: `1px solid ${l.colour}`,
              borderRadius: 8, padding: "4px 12px", fontSize: 11, color: l.colour, fontWeight: 600,
            }}>
              L{l.num}: {l.name}
            </div>
            {i < LAYERS.length - 1 && <span style={{ color: "#4a5568", fontSize: 18 }}>→</span>}
          </div>
        ))}
      </div>

      {/* Layer cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {LAYERS.map((l) => (
          <div key={l.num} style={{
            background: "#12132a", border: `1px solid ${l.colour}44`,
            borderRadius: 12, padding: 16, borderLeft: `3px solid ${l.colour}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: l.colour, fontWeight: 700, fontSize: 13 }}>Layer {l.num}: {l.name}</span>
            </div>
            <div style={{
              background: "#0a0b1e", borderRadius: 6, padding: "6px 10px",
              fontFamily: "monospace", fontSize: 11, color: "#a78bfa", marginBottom: 10,
            }}>
              {l.formula}
            </div>
            <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.65 }}>
              {l.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Gradient Descent deep-dive */}
      <div style={{
        background: "#12132a", border: `1px solid ${GD_SECTION.colour}44`,
        borderRadius: 12, padding: 20, borderLeft: `3px solid ${GD_SECTION.colour}`,
      }}>
        <div style={{ color: GD_SECTION.colour, fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
          {GD_SECTION.title}
        </div>
        <pre style={{
          fontFamily: "monospace", fontSize: 12, color: "#94a3b8",
          whiteSpace: "pre-wrap", lineHeight: 1.8, margin: 0,
        }}>
          {GD_SECTION.body}
        </pre>
      </div>

      {/* Why hybrid label */}
      <div style={{
        background: "#0a0b1e", border: "1px solid #1e2035", borderRadius: 10,
        padding: 16, fontSize: 12, color: "#94a3b8", lineHeight: 1.7,
      }}>
        <span style={{ color: "#a78bfa", fontWeight: 700 }}>Why "Neuro-Fuzzy" Hybrid?  </span>
        Classical fuzzy systems require an expert to hand-craft the membership functions and rules.
        Neural networks learn from data but are black boxes.
        ANFIS combines both: the fuzzy layer provides{" "}
        <span style={{ color: "#10b981" }}>human-interpretable linguistic rules</span>, while the neural
        backpropagation provides <span style={{ color: "#f59e0b" }}>automatic parameter learning from data</span>.
        You get explainability <em>and</em> adaptability — the best of both worlds.
      </div>
    </div>
  );
}
