//backend/server.js
const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");

const authRoutes = require("./routes/auth");
const recordRoutes = require("./routes/record");
const readingRoutes = require("./routes/reading");
const topicRoutes = require("./routes/topic");
const historyRoutes = require("./routes/history");

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reading", readingRoutes);
app.use("/api/reading", recordRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/history", historyRoutes);

app.listen(3000, () => {
  console.log("✅ Server is running on port 3000");
});
