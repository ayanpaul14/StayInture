require("dotenv").config();
require("express-async-errors"); // lets async controller errors reach errorHandler automatically

const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const errorHandler = require("./src/middleware/errorHandler");

const authRoutes = require("./src/routes/authRoutes");
const propertyRoutes = require("./src/routes/propertyRoutes");
const searchRoutes = require("./src/routes/searchRoutes");
const conversationRoutes = require("./src/routes/conversationRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/conversations", conversationRoutes);

// 404 fallback for unknown routes
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Must be registered last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`XID backend running on port ${PORT}`));
