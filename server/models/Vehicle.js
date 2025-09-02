const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicle_id: Number,
  lat: Number,
  lng: Number,
  anomaly: Boolean,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
