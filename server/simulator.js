const axios = require('axios');

function randomGPS(baseLat, baseLng) {
  return {
    vehicle_id: Math.floor(Math.random() * 3) + 1, // vehicles 1–3
    lat: baseLat + (Math.random() - 0.5) * 0.05,
    lng: baseLng + (Math.random() - 0.5) * 0.05
  };
}

async function sendData() {
  const point = randomGPS(41.85, -87.65); // around Chicago
  try {
    await axios.post('http://localhost:4000/location', point);
    console.log("Sent:", point);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

// Send every 2 seconds
setInterval(sendData, 2000);
