
# Logistics Tracker

A full-stack logistics tracking and anomaly detection system.  
This project combines real-time vehicle tracking, anomaly detection (ML), and an analytics dashboard into one solution.  
Built with React, Node.js, FastAPI, MongoDB, and Docker.

---

## Features

- Real-time GPS Tracking – Vehicles stream live location updates to a map (Leaflet).
- Anomaly Detection – Route deviations and delays flagged by an ML model (Isolation Forest).
- Analytics Dashboard – Charts showing anomalies, utilization, and fleet insights.
- Role-based Access – Admins can view Analytics + Map, Dispatchers see Map only.
- Authentication – JWT-based login system with secure session handling.
- Dockerized – Backend, ML, and frontend all run with one `docker-compose up`.

---

## Tech Stack

- Frontend: React, React Router, Leaflet, Recharts  
- Backend: Node.js, Express, Socket.IO  
- ML Service: FastAPI + scikit-learn  
- Database: MongoDB Atlas  
- Deployment: Docker & Docker Compose  

---

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/akarn6/logistics-tracker.git
cd logistics-tracker


2. Create a .env file in /server:

MONGO_URI=your_mongo_connection_string_here
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:3000

3. Run with Docker
docker-compose up --build

4. Run locally (without Docker)

Backend:

cd server
node index.js


ML Service:

cd ml
uvicorn main:app --reload --port 8000


Frontend:

cd frontend
npm start


Simulator (optional):

cd server
node simulator.js
