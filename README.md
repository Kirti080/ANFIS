# ANFIS E-commerce Conversion Intelligence

Neuro-Fuzzy Predictive System — MERN + Python stack

## Architecture

```
React (Vite)  ──HTTP──▶  Node.js/Express  ──HTTP──▶  Flask (Python)
port 5173                 port 3001                   port 5000
                              │
                         MongoDB :27017
                       (audit trail logs)
```

## Quick Start

### 1. Python ANFIS Engine

```bash
cd python_anfis
pip install -r requirements.txt
python train_anfis.py
python flask_api.py
# → http://localhost:5000
```

### 2. Node.js Middleware

```bash
cd backend
npm install

# Optional: create .env
echo "MONGO_URI=mongodb://localhost:27017/anfis_ecommerce" > .env
echo "FLASK_URL=http://localhost:5000" >> .env
echo "PORT=3001" >> .env

npm run dev
# → http://localhost:3001
```

### 3. React Dashboard

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

Open http://localhost:5173 in your browser.

---

## API Reference

### Flask (port 5000)

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/health` | Status check |
| POST | `/predict` | Run ANFIS inference |
| GET  | `/membership-functions` | Gaussian MF parameters |
| POST | `/explainability` | Full rule firing breakdown |
| POST | `/retrain` | Retrain model on fresh data |

**POST /predict body:**
```json
{
  "session_duration": 0.7,
  "interaction_intensity": 0.8,
  "cart_depth": 0.6
}
```

**Response:**
```json
{
  "conversion_probability": 0.84,
  "fuzzy_score": 84.0,
  "decision": "PURCHASE",
  "confidence": 0.68,
  "explainability": {
    "top_rules": [
      { "rank": 1, "condition": "Session Duration is High AND ...", "percentage": 31.2 }
    ]
  }
}
```

### Node.js (port 3001)

All routes mirror Flask with prefix `/api/`.
Additional routes:
- `GET /api/audit-log?limit=50` — MongoDB prediction history
- `GET /api/audit-stats` — Aggregate conversion statistics

---

## ANFIS Architecture

```
Input x ∈ [0,1]³
    │
    ▼  Layer 1 — Fuzzification
    │  μᵢⱼ(xᵢ) = exp(−(xᵢ−cᵢⱼ)²/2σᵢⱼ²)   ← LEARNABLE: c, σ
    │
    ▼  Layer 2 — Rule Firing (Product T-norm)
    │  wᵣ = ∏ᵢ μᵢ,ⱼᵣᵢ(xᵢ)                  27 rules (3³)
    │
    ▼  Layer 3 — Normalisation
    │  w̄ᵣ = wᵣ / Σwᵢ
    │
    ▼  Layer 4 — TSK Consequent (First-Order)
    │  fᵣ = p·x₁ + q·x₂ + s·x₃ + b          ← LEARNABLE: p,q,s,b
    │
    ▼  Layer 5 — Output Summation
       ŷ = σ(Σ w̄ᵣ·fᵣ)   → conversion probability
```

**Trainable parameters:**
- Premise (Layer 1): `3 inputs × 3 MFs × 2 (c,σ) = 18`
- Consequent (Layer 4): `27 rules × 4 (p,q,s,b) = 108`
- **Total: 126 parameters**

---

## Gradient Descent — How It Learns

Loss: `L = −[y·log(ŷ) + (1−y)·log(1−ŷ)]`

Two gradient paths:

**Path 1 — Consequent parameters (easy, direct):**
```
∂L/∂p = ∂L/∂ŷ · w̄ᵣ · xᵢ
```

**Path 2 — Premise parameters (complex, multi-hop):**
```
∂L/∂c = ∂L/∂ŷ · ∂ŷ/∂w̄ · ∂w̄/∂w · ∂w/∂μ · ∂μ/∂c

where:  ∂μ/∂c = μ · (x−c)/σ²     (bell shifts)
        ∂μ/∂σ = μ · (x−c)²/σ³    (bell widens/narrows)
```

Both paths are computed automatically by TensorFlow autograd.
Adam optimiser handles the large difference in gradient magnitudes.

---

## Project Structure

```
anfis-ecommerce/
├── python_anfis/
│   ├── anfis_model.py     # 5-layer ANFIS (TensorFlow/Keras)
│   ├── train_anfis.py     # Training loop with early stopping
│   ├── flask_api.py       # REST API wrapper
│   └── requirements.txt
├── backend/
│   ├── server.js          # Express middleware + MongoDB logging
│   ├── models/
│   │   └── PredictionLog.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PredictionGauge.jsx       # SVG arc gauge
│   │   │   ├── MembershipFunctionChart.jsx # Gaussian MF curves
│   │   │   ├── BehaviorSimulator.jsx     # Input sliders
│   │   │   ├── ExplainableLogic.jsx      # Firing rules bars
│   │   │   ├── AuditLog.jsx              # MongoDB log table
│   │   │   └── NeuroFuzzyExplainer.jsx   # Educational panel
│   │   ├── services/api.js
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```
cd python_anfis
pip install -r requirements.txt
python ../main.py

cd backend
npm install
npm run dev
Terminal 3 — React frontend (port 5173)


cd frontend
npm install
npm run dev