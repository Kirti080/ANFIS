"""
Flask API — ANFIS E-commerce Conversion Engine
===============================================
Endpoints:
  GET  /health                 system status
  POST /predict                conversion probability + top firing rules
  GET  /membership-functions   Gaussian premise parameters for React visualiser
  POST /explainability         full rule firing breakdown for a given input
  POST /retrain                re-train ANFIS on fresh synthetic data
"""

import os
import json
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS

from anfis_model import ANFISModel

app = Flask(__name__)
CORS(app, origins="*")

WEIGHTS_PATH = "anfis_weights.weights.h5"
FEATURE_NAMES = ["Session Duration", "Interaction Intensity", "Cart Depth"]
MF_LABELS     = ["Low", "Medium", "High"]

# ─────────────────────────────────────────────────────────────────────────────
# Model bootstrap
# ─────────────────────────────────────────────────────────────────────────────
model: ANFISModel = ANFISModel(n_inputs=3, n_mfs=3)
# Warm-up forward pass to build weights before loading checkpoints
model(tf.zeros((1, 3)))

if os.path.exists(WEIGHTS_PATH):
    model.load_weights(WEIGHTS_PATH)
    print("✅  ANFIS weights loaded from disk")
else:
    print("⚠️   No checkpoint found — using random weights. Run train_anfis.py first.")


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────
def parse_input(data: dict) -> np.ndarray:
    fields = ["session_duration", "interaction_intensity", "cart_depth"]
    vals   = []
    for f in fields:
        if f not in data:
            raise ValueError(f"Missing field: {f}")
        v = float(data[f])
        if not (0.0 <= v <= 1.0):
            raise ValueError(f"{f} must be in [0, 1] — got {v}")
        vals.append(v)
    return np.array([vals], dtype=np.float32)


def top_rules(analysis: dict, n: int = 5) -> list:
    """Return top-N rules sorted by normalised firing strength."""
    strengths    = analysis["normalized_strengths"][0]
    rule_indices = analysis["rule_indices"]
    top_idx      = np.argsort(strengths)[::-1][:n]

    result = []
    for rank, r in enumerate(top_idx):
        mf_combo   = rule_indices[r]
        conditions = [
            f"{FEATURE_NAMES[i]} is {MF_LABELS[mf_combo[i]]}"
            for i in range(len(FEATURE_NAMES))
        ]
        result.append({
            "rank":       rank + 1,
            "rule_id":    int(r),
            "condition":  " AND ".join(conditions),
            "strength":   round(float(strengths[r]), 5),
            "percentage": round(float(strengths[r]) * 100, 2),
        })
    return result


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": "ANFIS-TSK-v1", "rules": 27})


@app.route("/predict", methods=["POST"])
def predict():
    """
    Body:
      { "session_duration": 0.7, "interaction_intensity": 0.8, "cart_depth": 0.6 }

    Response:
      { "conversion_probability": 0.84, "fuzzy_score": 84.0,
        "decision": "PURCHASE", "confidence": 0.68,
        "explainability": { "top_rules": [...], "memberships": [...] } }
    """
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "No JSON body"}), 400

    try:
        x = parse_input(data)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    prob     = float(model(x).numpy()[0, 0])
    analysis = model.get_firing_analysis(x)

    return jsonify({
        "conversion_probability": round(prob, 4),
        "fuzzy_score":            round(prob * 100, 2),
        "decision":               "PURCHASE" if prob >= 0.5 else "DROPOUT",
        "confidence":             round(abs(prob - 0.5) * 2, 4),
        "explainability": {
            "top_rules":   top_rules(analysis, n=5),
            "memberships": analysis["memberships"],
        },
    })


@app.route("/membership-functions", methods=["GET"])
def membership_functions():
    """
    Returns current Gaussian premise parameters so React can draw the MF curves.
    """
    params = model.get_membership_params()
    result = {}
    for i, name in enumerate(FEATURE_NAMES):
        result[name] = {
            "centers": params["centers"][i],
            "sigmas":  params["sigmas"][i],
            "labels":  MF_LABELS,
        }
    return jsonify(result)


@app.route("/explainability", methods=["POST"])
def explainability():
    data = request.get_json(force=True, silent=True) or {}
    try:
        x = parse_input(data)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    analysis = model.get_firing_analysis(x)
    return jsonify({
        "top_rules":            top_rules(analysis, n=10),
        "all_strengths":        analysis["normalized_strengths"][0],
        "raw_memberships":      analysis["memberships"][0],
        "rule_indices":         analysis["rule_indices"],
    })


@app.route("/retrain", methods=["POST"])
def retrain():
    """Trigger a fresh training run (blocking — may take ~30 s)."""
    global model
    from train_anfis import train_anfis
    model = train_anfis()
    return jsonify({
        "status":  "retrained",
        "weights": WEIGHTS_PATH,
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
