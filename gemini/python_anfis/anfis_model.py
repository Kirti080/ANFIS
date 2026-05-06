"""
ANFIS (Adaptive Neuro-Fuzzy Inference System)
E-commerce Conversion Predictor — 5-Layer Architecture

Mathematical Model (Takagi-Sugeno-Kang, First-Order):
  Inputs  : x = [session_duration, interaction_intensity, cart_depth]  ∈ [0,1]³
  Rules   : IF x₁ is A_i AND x₂ is B_j AND x₃ is C_k
            THEN  f_r = p_r·x₁ + q_r·x₂ + s_r·x₃ + b_r
  Output  : ŷ = σ( Σ w̄_r · f_r )

  With n_mfs=3 per input → 3³ = 27 fuzzy rules.
"""

import itertools
import numpy as np
import tensorflow as tf
from tensorflow import keras


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 1  —  Fuzzification (Gaussian Membership Functions)
# ─────────────────────────────────────────────────────────────────────────────
class FuzzificationLayer(keras.layers.Layer):
    """
    Gaussian MF:  μ_ij(xᵢ) = exp( −(xᵢ − cᵢⱼ)² / (2·σᵢⱼ²) )

    Learnable premise parameters:
      • centers  c  ∈ ℝ^(n_inputs × n_mfs)
      • widths   σ  ∈ ℝ₊^(n_inputs × n_mfs)  (constrained positive)

    ∂μ/∂c = μ · (x−c)/σ²          ← gradient steers center position
    ∂μ/∂σ = μ · (x−c)²/σ³         ← gradient steers MF width
    Both flow back automatically via TF autograd during backprop.
    """

    def __init__(self, n_inputs: int, n_mfs: int, **kwargs):
        super().__init__(**kwargs)
        self.n_inputs = n_inputs
        self.n_mfs    = n_mfs

    def build(self, input_shape):
        # Evenly-spaced initial centers: e.g. [0.17, 0.5, 0.83] for n_mfs=3
        init_c = np.linspace(0.1, 0.9, self.n_mfs)
        init_c = np.tile(init_c, (self.n_inputs, 1)).astype(np.float32)

        self.centers = self.add_weight(
            name="centers",
            shape=(self.n_inputs, self.n_mfs),
            initializer=tf.constant_initializer(init_c),
            trainable=True,
        )
        self.log_sigmas = self.add_weight(
            name="log_sigmas",
            shape=(self.n_inputs, self.n_mfs),
            initializer=tf.constant_initializer(np.log(0.3)),
            trainable=True,
        )
        super().build(input_shape)

    @property
    def sigmas(self):
        return tf.exp(self.log_sigmas)   # ensures σ > 0 without explicit constraint

    def call(self, x):
        # x: (batch, n_inputs)
        # Expand to (batch, n_inputs, 1) for broadcasting against (n_inputs, n_mfs)
        x_exp  = tf.expand_dims(x, axis=-1)                          # (B, I, 1)
        diff   = x_exp - self.centers                                 # (B, I, M)
        mu     = tf.exp(-0.5 * tf.square(diff / (self.sigmas + 1e-8)))  # (B, I, M)
        return mu


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 2  —  Rule Firing Strength  (Product T-norm)
# ─────────────────────────────────────────────────────────────────────────────
class RuleLayer(keras.layers.Layer):
    """
    Mamdani-style product T-norm across all inputs for each rule:
      w_r = ∏ᵢ μᵢ,ⱼᵣᵢ(xᵢ)

    rule_index[r, i] = which MF (j) input i uses in rule r.
    With 3 inputs × 3 MFs  →  27 rows, 3 columns.
    """

    def __init__(self, n_inputs: int, n_mfs: int, **kwargs):
        super().__init__(**kwargs)
        self.n_inputs = n_inputs
        self.n_mfs    = n_mfs
        # Build rule table: all Cartesian combos
        combos = list(itertools.product(range(n_mfs), repeat=n_inputs))
        self.rule_indices = np.array(combos, dtype=np.int32)   # (n_rules, n_inputs)
        self.n_rules      = len(combos)

    def call(self, memberships):
        # memberships: (batch, n_inputs, n_mfs)
        # For each input i, gather the MF slice selected by every rule
        per_input = []
        for i in range(self.n_inputs):
            mf_idx  = self.rule_indices[:, i]                   # (n_rules,)
            mu_i    = memberships[:, i, :]                      # (batch, n_mfs)
            # tf.gather over columns → (batch, n_rules)
            mu_sel  = tf.gather(mu_i, mf_idx, axis=1)
            per_input.append(mu_sel)

        # Stack → (n_inputs, batch, n_rules), then product over inputs
        stacked  = tf.stack(per_input, axis=0)                  # (I, B, R)
        firing   = tf.reduce_prod(stacked, axis=0)              # (B, R)
        return firing


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 3  —  Normalization
# ─────────────────────────────────────────────────────────────────────────────
class NormalizationLayer(keras.layers.Layer):
    """
    w̄_r = w_r / Σ_r w_r

    Projects firing strengths onto the probability simplex.
    Guarantees Σ w̄_r = 1, making the output a convex combination of consequents.
    """

    def call(self, firing_strengths):
        total = tf.reduce_sum(firing_strengths, axis=1, keepdims=True) + 1e-8
        return firing_strengths / total                         # (B, R)


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 4  —  TSK Consequent (First-Order Linear)
# ─────────────────────────────────────────────────────────────────────────────
class ConsequentLayer(keras.layers.Layer):
    """
    f_r = p_r1·x₁ + p_r2·x₂ + p_r3·x₃ + b_r   (one line per rule)

    Learnable consequent parameters:
      P ∈ ℝ^(n_rules × (n_inputs+1))   (includes bias column)

    ∂L/∂P flows straight from the output — this is the "easy" gradient path
    because f_r is linear in P. The least-squares / hybrid learning in classical
    ANFIS exploits this; here we simply let Adam handle both layers jointly.
    """

    def __init__(self, n_rules: int, n_inputs: int, **kwargs):
        super().__init__(**kwargs)
        self.n_rules  = n_rules
        self.n_inputs = n_inputs

    def build(self, input_shape):
        self.P = self.add_weight(
            name="consequent_params",
            shape=(self.n_rules, self.n_inputs + 1),
            initializer="glorot_uniform",
            trainable=True,
        )
        super().build(input_shape)

    def call(self, inputs):
        norm_w, x = inputs
        # x: (B, n_inputs)  →  append bias → (B, n_inputs+1)
        ones  = tf.ones((tf.shape(x)[0], 1), dtype=tf.float32)
        x_aug = tf.concat([x, ones], axis=1)                   # (B, I+1)

        # Linear consequent: (B, I+1) · (I+1, R) = (B, R)
        f_r   = tf.matmul(x_aug, tf.transpose(self.P))         # (B, R)

        # Weighted consequent  w̄_r · f_r
        return norm_w * f_r                                     # (B, R)


# ─────────────────────────────────────────────────────────────────────────────
# LAYER 5  —  Output Summation
# ─────────────────────────────────────────────────────────────────────────────
class OutputLayer(keras.layers.Layer):
    """
    ŷ = σ( Σ_r w̄_r · f_r )

    The inner sum is the TSK defuzzification (weighted average of local linear models).
    σ (sigmoid) maps the real-valued crisp output to a conversion probability in (0,1).
    """

    def call(self, weighted_consequents):
        raw = tf.reduce_sum(weighted_consequents, axis=1, keepdims=True)  # (B, 1)
        return tf.sigmoid(raw)


# ─────────────────────────────────────────────────────────────────────────────
# FULL ANFIS MODEL
# ─────────────────────────────────────────────────────────────────────────────
class ANFISModel(keras.Model):
    """
    5-Layer ANFIS for E-commerce Conversion Prediction.

    Parameters
    ----------
    n_inputs : int   number of behavioural features (default 3)
    n_mfs    : int   Gaussian MFs per input          (default 3)
    """

    def __init__(self, n_inputs: int = 3, n_mfs: int = 3):
        super().__init__()
        self.n_inputs = n_inputs
        self.n_mfs    = n_mfs
        n_rules       = n_mfs ** n_inputs

        self.layer1_fuzzify   = FuzzificationLayer(n_inputs, n_mfs,  name="fuzzification")
        self.layer2_rules     = RuleLayer(n_inputs, n_mfs,           name="rule_layer")
        self.layer3_normalize = NormalizationLayer(                   name="normalization")
        self.layer4_consequent= ConsequentLayer(n_rules, n_inputs,   name="consequent")
        self.layer5_output    = OutputLayer(                          name="output")

    def call(self, x, training=False):
        mu       = self.layer1_fuzzify(x)                  # (B, I, M)
        w        = self.layer2_rules(mu)                   # (B, R)
        w_bar    = self.layer3_normalize(w)                # (B, R)
        wf       = self.layer4_consequent([w_bar, x])      # (B, R)
        y_hat    = self.layer5_output(wf)                  # (B, 1)
        return y_hat

    # ── Introspection helpers ──────────────────────────────────────────────

    def get_membership_params(self) -> dict:
        """Return Gaussian premise parameters (centers & sigmas) as plain Python."""
        return {
            "centers": self.layer1_fuzzify.centers.numpy().tolist(),
            "sigmas":  self.layer1_fuzzify.sigmas.numpy().tolist(),
        }

    def get_firing_analysis(self, x_np: np.ndarray) -> dict:
        """
        Full forward-pass breakdown for a single sample — used by /explainability.
        Returns memberships, per-rule firing strengths, and rule index table.
        """
        x = tf.constant(x_np, dtype=tf.float32)
        mu    = self.layer1_fuzzify(x)
        w     = self.layer2_rules(mu)
        w_bar = self.layer3_normalize(w)
        return {
            "memberships":          mu.numpy().tolist(),
            "firing_strengths":     w.numpy().tolist(),
            "normalized_strengths": w_bar.numpy().tolist(),
            "rule_indices":         self.layer2_rules.rule_indices.tolist(),
        }
