const mongoose = require("mongoose");

/**
 * Audit-trail schema — every prediction request is persisted here.
 * Indexed for fast time-range queries and per-user lookups.
 */
const PredictionLogSchema = new mongoose.Schema(
  {
    user_id: { type: String, default: "anonymous", index: true },

    inputs: {
      session_duration:     { type: Number, required: true, min: 0, max: 1 },
      interaction_intensity:{ type: Number, required: true, min: 0, max: 1 },
      cart_depth:           { type: Number, required: true, min: 0, max: 1 },
    },

    outputs: {
      conversion_probability: Number,
      fuzzy_score:            Number,
      decision:   { type: String, enum: ["PURCHASE", "DROPOUT"] },
      confidence: Number,
      // Top firing rules stored as-is from Python engine
      explainability: mongoose.Schema.Types.Mixed,
    },

    // Calculated from decision for quick aggregation queries
    converted: { type: Boolean },
  },
  { timestamps: true }   // adds createdAt + updatedAt automatically
);

PredictionLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("PredictionLog", PredictionLogSchema);
