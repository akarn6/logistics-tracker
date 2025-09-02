const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Vehicle = require('./models/Vehicle');
const User = require('./models/User');

const app = express();

//  Restrict CORS (use env or fallback to localhost)
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000"
}));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { 
  cors: { origin: process.env.FRONTEND_URL || "http://localhost:3000" } 
});

//  Connect MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch(err => console.error(" MongoDB error:", err));

//  Use JWT from .env
const JWT_SECRET = process.env.JWT_SECRET;

// ==========================
// Auth Routes
// ==========================

// Register disabled in production
// app.post('/register', async (req, res) => {
//   const { username, password, role } = req.body;
//   const hashedPassword = await bcrypt.hash(password, 10);
//   const user = new User({ username, password: hashedPassword, role });
//   await user.save();
//   res.send({ message: "User registered" });
// });

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).send({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).send({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
  res.send({ token, role: user.role });
});

// Middleware to protect routes
function authMiddleware(role) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(403).send({ message: "No token" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).send({ message: "Invalid token" });

      if (role && decoded.role !== role) {
        return res.status(403).send({ message: "Forbidden" });
      }

      req.user = decoded;
      next();
    });
  };
}

// ==========================
// GPS + Analytics Routes
// ==========================

// GPS ingest
app.post('/location', async (req, res) => {
  const data = req.body;

  try {
    const response = await axios.post('http://ml:8000/detect', data); 
    data.anomaly = response.data.anomaly;
  } catch (err) {
    console.error("ML service error:", err.message);
    data.anomaly = false;
  }

  const vehicle = new Vehicle(data);
  await vehicle.save();

  io.emit('locationUpdate', data);
  res.send({ status: 'ok' });
});

// History for one vehicle
app.get('/history/:vehicle_id', authMiddleware(), async (req, res) => {
  const history = await Vehicle.find({ vehicle_id: req.params.vehicle_id }).sort({ timestamp: 1 });
  res.send(history);
});

// History for all vehicles (with optional filter)
app.get('/history', authMiddleware(), async (req, res) => {
  const hours = parseInt(req.query.hours) || null;
  let filter = {};
  if (hours) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    filter.timestamp = { $gte: since };
  }
  const history = await Vehicle.find(filter).sort({ timestamp: 1 });
  res.send(history);
});

// Stats (admin only)
app.get('/stats', authMiddleware("admin"), async (req, res) => {
  const hours = parseInt(req.query.hours) || 24;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const records = await Vehicle.find({ timestamp: { $gte: since } });

  const anomalies = records.filter(r => r.anomaly).length;
  const vehicles = new Set(records.map(r => r.vehicle_id)).size;
  const trips = records.length;
  const utilization = ((vehicles / 10) * 100).toFixed(2);

  const anomalyMap = {};
  records.forEach(r => {
    if (r.anomaly) {
      anomalyMap[r.vehicle_id] = (anomalyMap[r.vehicle_id] || 0) + 1;
    }
  });
  const anomaliesByVehicle = Object.entries(anomalyMap).map(([vehicle_id, count]) => ({
    vehicle_id,
    count
  }));

  res.json({ anomalies, vehicles, trips, utilization, anomaliesByVehicle });
});

server.listen(4000, () => console.log('🚀 Server running on port 4000'));
