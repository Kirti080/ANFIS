# ANFIS reviewer notes

## Architecture

This is a MERN + Python e-commerce conversion prediction system. The React/Vite dashboard (`frontend/`) calls an Express middleware service (`backend/`), which proxies prediction-related requests to the Flask ANFIS engine (`python_anfis/`) and persists audit logs in MongoDB. The model is a five-layer TensorFlow/Keras ANFIS with three normalized inputs, 27 fuzzy rules, and 126 trainable parameters.

## Conventions

- Keep service boundaries intact: browser requests use the Node `/api/` prefix, while Flask exposes the corresponding unprefixed routes (`README.md`).
- Flask owns model behavior and endpoints such as `/predict`, `/explainability`, `/membership-functions`, and `/retrain`; Node is the middleware and audit-log layer (`README.md`).
- Prediction inputs are named `session_duration`, `interaction_intensity`, and `cart_depth`, and are expected in `[0,1]` (`README.md`).
- Preserve the prediction response vocabulary and shape, including `conversion_probability`, `fuzzy_score`, `decision`, `confidence`, and nested `explainability.top_rules` (`README.md`).
- ANFIS structure is load-bearing: Gaussian membership functions, product T-norm rule firing, normalized rule weights, first-order TSK consequents, and sigmoid output (`README.md`).
- The rule count is the Cartesian product of three membership functions across three inputs: 27 rules. Premise parameters total 18 and consequent parameters total 108 (`README.md`).
- Frontend code is organized by feature-oriented React components under `frontend/src/components/`; HTTP calls belong in `frontend/src/services/api.js` rather than being scattered across presentation components (`README.md`).
- Audit-specific functionality is exposed separately through `/api/audit-log?limit=50` and `/api/audit-stats`; prediction history is MongoDB-backed (`README.md`).
- Treat `backend/node_modules/**` as vendored dependency content, not repository conventions or application code. The sampled package files describe third-party projects such as Axios, `accepts`, and `asynckit`.

## Intentional non-standard choices

- Premise parameters (`c`, `σ`) are learned by TensorFlow autograd alongside consequent parameters; do not assume only the linear consequents are trainable (`README.md`).
- The model applies a sigmoid after the weighted TSK output, so the public result is a probability rather than an unconstrained raw ANFIS score (`README.md`).
- The Node service uses HTTP between local services instead of importing Python model code directly; this is the documented deployment architecture (`README.md`).

## Watch out for

- Flag changes that bypass Node and expose Flask directly to the frontend, or that break the documented `/api/` route mirroring.
- Flag input validation or transformations that permit values outside `[0,1]`, rename the three prediction fields, or change response semantics without updating all three layers.
- Flag changes that alter rule normalization, Gaussian membership behavior, rule count, or parameter dimensions unintentionally; these can silently invalidate training and explainability output.
- Flag prediction paths that stop writing audit records or make audit endpoints depend on unavailable MongoDB behavior without an explicit fallback/design change.
- Flag documentation/startup changes that worsen the existing ambiguity between the primary `train_anfis.py`/`flask_api.py` flow and the later `python ../main.py` command in `README.md`.