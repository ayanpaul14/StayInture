const mongoose = require("mongoose");
const dns = require("dns");

// Fix Windows DNS SRV lookup issues for MongoDB Atlas (querySrv ECONNREFUSED)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    // If SRV lookup fails, attempt setting fallback DNS servers
    try {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB connected via fallback DNS: ${conn.connection.host}`);
    } catch (fallbackErr) {
      console.error(`MongoDB fallback connection error: ${fallbackErr.message}`);
      process.exit(1);
    }
  }
}

module.exports = connectDB;
