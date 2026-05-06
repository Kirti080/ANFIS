"""
ANFIS E-commerce Conversion System — Entry Point
=================================================
Run this to train the model and start the Flask API in one command.
For full stack, also start backend/ and frontend/ separately (see README.md).
"""

import subprocess, sys, os

os.chdir(os.path.join(os.path.dirname(__file__), "python_anfis"))

if "--train" in sys.argv or not os.path.exists("anfis_weights.weights.h5"):
    print("=" * 60)
    print("STEP 1: Training ANFIS model...")
    print("=" * 60)
    subprocess.run([sys.executable, "train_anfis.py"], check=True)

print("\n" + "=" * 60)
print("STEP 2: Starting Flask API on http://localhost:5000")
print("=" * 60)
subprocess.run([sys.executable, "flask_api.py"])
