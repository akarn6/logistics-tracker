from fastapi import FastAPI
import numpy as np
from sklearn.ensemble import IsolationForest

app = FastAPI()

# Train a simple anomaly detection model (using fake data for now)
model = IsolationForest(contamination=0.1)
X_train = np.random.rand(100, 2)  # random lat/lng training data
model.fit(X_train)

@app.post("/detect")
def detect(data: dict):
    lat = data["lat"]
    lng = data["lng"]
    prediction = model.predict([[lat, lng]])[0]
    return {"anomaly": prediction == -1}
