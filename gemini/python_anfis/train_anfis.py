"""
ANFIS Training Script — Gradient Descent via Adam Optimiser
============================================================

TWO SETS OF PARAMETERS ARE UPDATED SIMULTANEOUSLY:

  ① Premise parameters  (Layer 1)   — c, σ of Gaussian MFs
     ∂L/∂c  = ∂L/∂ŷ · ∂ŷ/∂w̄ · ∂w̄/∂w · ∂w/∂μ · ∂μ/∂c
     ∂μ/∂c  = μ · (x − c) / σ²          (bell shifts left/right)
     ∂μ/∂σ  = μ · (x − c)² / σ³         (bell narrows/widens)

  ② Consequent parameters (Layer 4) — p, q, s, b per rule
     ∂L/∂p  = ∂L/∂ŷ · w̄ · xᵢ           (linear → clean gradient)

Adam accumulates first- and second-moment estimates of each gradient,
giving per-parameter adaptive learning rates — crucial because premise
gradients are much smaller than consequent gradients.
"""

import json
import numpy as np
import tensorflow as tf
from anfis_model import ANFISModel


# ─────────────────────────────────────────────────────────────────────────────
# Synthetic dataset generator
# ─────────────────────────────────────────────────────────────────────────────
def generate_dataset(n: int = 3000, seed: int = 42) -> tuple:
    """
    Simulates realistic e-commerce session distributions.

    Converters   → high session time, many interactions, deep cart
    Dropoffs     → short sessions, few interactions, shallow/empty cart
    """
    rng = np.random.default_rng(seed)
    half = n // 2

    # ── Converters (label = 1) ──
    sd_c  = rng.beta(6, 2,  half).astype(np.float32)   # skewed right → long sessions
    ii_c  = rng.beta(5, 2,  half).astype(np.float32)   # many interactions
    cd_c  = rng.beta(4, 2,  half).astype(np.float32)   # items in cart

    # ── Dropoffs (label = 0) ──
    sd_d  = rng.beta(2, 7,  n - half).astype(np.float32)
    ii_d  = rng.beta(2, 6,  n - half).astype(np.float32)
    cd_d  = rng.beta(1, 5,  n - half).astype(np.float32)

    X = np.vstack([
        np.c_[sd_c, ii_c, cd_c],
        np.c_[sd_d, ii_d, cd_d],
    ])
    y = np.concatenate([np.ones(half), np.zeros(n - half)]).astype(np.float32)

    perm = rng.permutation(n)
    return X[perm], y[perm]


# ─────────────────────────────────────────────────────────────────────────────
# Training routine
# ─────────────────────────────────────────────────────────────────────────────
def train_anfis(
    n_mfs: int    = 3,
    epochs: int   = 150,
    batch: int    = 64,
    lr: float     = 0.005,
    n_data: int   = 3000,
) -> ANFISModel:
    """
    Full gradient-descent training loop for ANFIS.

    Returns trained model; also saves weights + MF params to disk.
    """

    # ── Data ──────────────────────────────────────────────────────────────
    X, y = generate_dataset(n_data)
    split   = int(0.8 * len(X))
    X_tr, X_va = X[:split], X[split:]
    y_tr, y_va = y[:split], y[split:]

    ds_tr = (
        tf.data.Dataset.from_tensor_slices((X_tr, y_tr))
        .shuffle(2048)
        .batch(batch)
        .prefetch(tf.data.AUTOTUNE)
    )
    ds_va = tf.data.Dataset.from_tensor_slices((X_va, y_va)).batch(256)

    # ── Model + optimiser ─────────────────────────────────────────────────
    model     = ANFISModel(n_inputs=3, n_mfs=n_mfs)
    optimiser = tf.keras.optimizers.Adam(learning_rate=lr)
    bce       = tf.keras.losses.BinaryCrossentropy()

    best_val   = float("inf")
    patience   = 0
    MAX_PATIENCE = 20

    # ── Training loop ─────────────────────────────────────────────────────
    for epoch in range(1, epochs + 1):

        # ── Train ──
        tr_loss = tr_acc = 0.0
        n_batches = 0
        for xb, yb in ds_tr:
            with tf.GradientTape() as tape:
                pred  = model(xb, training=True)
                loss  = bce(yb, tf.squeeze(pred))

            grads = tape.gradient(loss, model.trainable_variables)
            optimiser.apply_gradients(zip(grads, model.trainable_variables))

            tr_loss += loss.numpy()
            tr_acc  += tf.reduce_mean(
                tf.cast(tf.equal(tf.round(tf.squeeze(pred)), yb), tf.float32)
            ).numpy()
            n_batches += 1

        tr_loss /= n_batches
        tr_acc  /= n_batches

        # ── Validate ──
        va_preds, va_labels = [], []
        for xb, yb in ds_va:
            va_preds.append(model(xb))
            va_labels.append(yb)

        va_pred  = tf.concat(va_preds,  axis=0)
        va_label = tf.concat(va_labels, axis=0)
        va_loss  = bce(va_label, tf.squeeze(va_pred)).numpy()
        va_acc   = tf.reduce_mean(
            tf.cast(tf.equal(tf.round(tf.squeeze(va_pred)), va_label), tf.float32)
        ).numpy()

        if epoch % 10 == 0 or epoch == 1:
            print(
                f"Epoch {epoch:>4}  "
                f"loss={tr_loss:.4f}  acc={tr_acc:.4f}  "
                f"val_loss={va_loss:.4f}  val_acc={va_acc:.4f}"
            )

        # ── Early stopping ──
        if va_loss < best_val - 1e-4:
            best_val = va_loss
            patience = 0
            model.save_weights("anfis_weights.weights.h5")
        else:
            patience += 1
            if patience >= MAX_PATIENCE:
                print(f"\nEarly stop at epoch {epoch}")
                break

    # ── Reload best weights ────────────────────────────────────────────────
    model.load_weights("anfis_weights.weights.h5")

    # ── Persist MF params for the React visualiser ────────────────────────
    mf_params = model.get_membership_params()
    with open("mf_params.json", "w") as f:
        json.dump(mf_params, f, indent=2)

    print("\n✅  Training complete.")
    print(f"   Best val loss : {best_val:.4f}")
    print(f"   MF params saved → mf_params.json")
    print(f"   Weights saved  → anfis_weights.h5")
    return model


if __name__ == "__main__":
    train_anfis()
