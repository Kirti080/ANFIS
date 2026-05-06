/**
 * Node.js / Express Middleware
 * ============================
 * Acts as the single gateway between the React frontend and the Python/Flask ANFIS engine.
 * Also owns the MongoDB audit-trail persistence layer.
 *
 *  React ──POST /api/predict──▶ Express ──POST /predict──▶ Flask (ANFIS)
 *                                  │
 *                                  └──write──▶ MongoDB (PredictionLog)
 */

require("dotenv").config();
const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const axios      = require("axios");

const PredictionLog = require("./models/PredictionLog");

const app       = express();
const PORT      = process.env.PORT      || 3001;
const FLASK_URL = process.env.FLASK_URL || "http://localhost:5000";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/anfis_ecommerce";

// ─────────────────────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// MongoDB
// ─────────────────────────────────────────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅  MongoDB connected →", MONGO_URI))
  .catch((e) => console.warn("⚠️   MongoDB unavailable:", e.message));

// ─────────────────────────────────────────────────────────────────────────────
// Helper — safe proxy call to Flask
// ─────────────────────────────────────────────────────────────────────────────
async function flaskPost(path, body) {
  const res = await axios.post(`${FLASK_URL}${path}`, body, { timeout: 60_000 });
  return res.data;
}
async function flaskGet(path) {
  const res = await axios.get(`${FLASK_URL}${path}`, { timeout: 10_000 });
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/predict
 * Forwards to ANFIS engine, logs result to MongoDB, returns prediction.
 */
app.post("/api/predict", async (req, res) => {
  const { session_duration, interaction_intensity, cart_depth, user_id } = req.body;

  try {
    const prediction = await flaskPost("/predict", {
      session_duration,
      interaction_intensity,
      cart_depth,
    });

    // ── Audit trail (non-blocking — don't fail request if Mongo is down) ──
    PredictionLog.create({
      user_id:   user_id || "anonymous",
      inputs:    { session_duration, interaction_intensity, cart_depth },
      outputs:   prediction,
      converted: prediction.decision === "PURCHASE",
    }).catch((e) => console.warn("Audit log skipped:", e.message));

    res.json(prediction);
  } catch (err) {
    console.error("/api/predict error:", err.message);
    res.status(502).json({ error: "ANFIS engine unavailable", details: err.message });
  }
});

/**
 * GET /api/membership-functions
 * Proxy for Gaussian MF parameters — consumed by the React MF visualiser.
 */
app.get("/api/membership-functions", async (req, res) => {
  try {
    res.json(await flaskGet("/membership-functions"));
  } catch (err) {
    res.status(502).json({ error: "Could not fetch MF parameters" });
  }
});

/**
 * POST /api/explainability
 * Returns which fuzzy rules are firing for a given input.
 */
app.post("/api/explainability", async (req, res) => {
  try {
    res.json(await flaskPost("/explainability", req.body));
  } catch (err) {
    res.status(502).json({ error: "Explainability service error" });
  }
});

/**
 * GET /api/audit-log
 * Retrieve recent prediction audit trail from MongoDB.
 * Query params: ?limit=50&decision=PURCHASE
 */
app.get("/api/audit-log", async (req, res) => {
  try {
    const limit    = Math.min(parseInt(req.query.limit || "50"), 200);
    const filter   = {};
    if (req.query.decision) filter["outputs.decision"] = req.query.decision;

    const logs = await PredictionLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("-__v");

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Audit log query failed" });
  }
});

/**
 * GET /api/audit-stats
 * Aggregate conversion statistics for the dashboard header cards.
 */
app.get("/api/audit-stats", async (req, res) => {
  try {
    const total     = await PredictionLog.countDocuments();
    const purchases = await PredictionLog.countDocuments({ converted: true });
    const avgScore  = await PredictionLog.aggregate([
      { $group: { _id: null, avg: { $avg: "$outputs.fuzzy_score" } } },
    ]);

    res.json({
      total_predictions: total,
      purchases,
      dropoffs:          total - purchases,
      conversion_rate:   total ? ((purchases / total) * 100).toFixed(1) : 0,
      avg_fuzzy_score:   avgScore[0]?.avg?.toFixed(1) ?? 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Stats query failed" });
  }
});

/**
 * POST /api/retrain
 * Triggers ANFIS retraining on the Python side.
 */
app.post("/api/retrain", async (req, res) => {
  try {
    res.json(await flaskPost("/retrain", {}));
  } catch (err) {
    res.status(502).json({ error: "Retraining failed", details: err.message });
  }
});

/**
 * GET /api/health
 */
app.get("/api/health", async (req, res) => {
  const mongoState = mongoose.connection.readyState === 1 ? "ok" : "disconnected";
  try {
    const flaskHealth = await flaskGet("/health");
    res.json({ node: "ok", flask: flaskHealth, mongodb: mongoState });
  } catch {
    res.json({ node: "ok", flask: "unavailable", mongodb: mongoState });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () =>
  console.log(`🚀  ANFIS Middleware on http://localhost:${PORT}`)
);
