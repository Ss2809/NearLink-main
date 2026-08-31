require("dotenv").config();
const http = require("http");
const express = require("express");
const path = require("path");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const registerRoutes = require("./routes/register");
const loginRoutes = require("./routes/login");
const userRoutes = require("./routes/userRoutes");
const businessRoutes = require("./routes/business");
const activityRoutes = require("./routes/activity");
const notificationRoutes = require("./routes/notificationRoutes");
const chatRoutes = require("./routes/chatRoutes");
const initChatSocket = require("./socket/chatSocket");

const app = express();
const server = http.createServer(app);

// Socket.IO configuration with CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Attach io to express app so routes can broadcast events
app.set("io", io);

// Initialize Socket.IO chat handlers
try {
  initChatSocket(io);
} catch (e) {
  console.error("Socket initialization warning:", e.message);
}

app.use(express.json());
app.use(cors());

// Serve uploaded assets statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Eagerly initiate DB connection (without blocking startup)
connectDB().catch((err) => {
  console.error("Initial DB connection warning:", err.message);
});

// Root & Health Endpoints
app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "NearLink Backend API",
    time: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Serverless DB Connection Middleware for API routes
app.use(async (req, res, next) => {
  if (req.path === "/" || req.path === "/api/health") {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error(`DB connection failed on ${req.method} ${req.path}:`, err.message);
    return res.status(500).json({
      success: false,
      message: "Database connection failed. Please ensure MONGO_URI is configured in Vercel Environment Variables.",
      error: err.message,
    });
  }
});

// Mount Routes
app.use("/api/auth", registerRoutes);
app.use("/api/auth", loginRoutes);
app.use("/api/users", userRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);

// Global 404 handler for API routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({
      success: false,
      message: `API endpoint ${req.method} ${req.path} not found`,
    });
  }
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global server error:", err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 3000;

// Listen on port ONLY when executed directly as standalone script (local dev)
if (require.main === module && !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export Express app for Vercel Serverless Function deployment
module.exports = app;