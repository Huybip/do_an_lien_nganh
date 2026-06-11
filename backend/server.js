"use strict";

require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server: SocketIOServer } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const { setupVideoCallSocket } = require("./src/socket/videoCallSocket");
const { setupSalarySocket } = require("./src/socket/salarySocket");

const connectDB = require("./src/config/db");
const corsOptions = require("./src/config/cors");
const {
  globalLimiter,
  authLimiter,
  chatLimiter,
  uploadLimiter,
  predictionLimiter,
} = require("./src/config/rateLimit");
const routes = require("./src/routes/index");
const { startJobs, stopJobs } = require("./src/jobs/index");
const sanitize = require("./src/middleware/sanitize");
const { requestLogger } = require("./src/middleware/requestLogger");
const swaggerDoc = require("./src/config/swagger");
const { errorHandler, notFound } = require("./src/middleware/errorHandle");

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const PORT = process.env.PORT || 5000;

// Setup WebRTC signaling
setupVideoCallSocket(io);

// Setup Salary real-time notifications
setupSalarySocket(io);

// ─── Connect DB ──────────────────────────────────────────────────────────────
connectDB();

// ─── Security ────────────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));

// ─── Rate Limiting ───────────────────────────────────────────────────────────
app.use("/api/", globalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/chat/", chatLimiter);
app.use("/api/images/upload", uploadLimiter);
app.use("/api/predict/", predictionLimiter);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Input Sanitisation ──────────────────────────────────────────────────────
app.use(sanitize);

// ─── Request Logger ───────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── Static Uploads ───────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
console.log(`   Upload dir: ${uploadDir}`);

// Redirect old image URLs that are actually audio
app.get("/uploads/images/:filename", (req, res) => {
  const { filename } = req.params;
  const imagePath = path.join(uploadDir, "images", filename);
  const audioPath = path.join(uploadDir, "audio", filename);

  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else if (fs.existsSync(audioPath)) {
    // File is actually in audio folder, redirect
    res.redirect(`/uploads/audio/${filename}`);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

// Debug handler for audio files
app.get("/uploads/audio/:filename", (req, res) => {
  const { filename } = req.params;
  const audioPath = path.join(uploadDir, "audio", filename);

  console.log(`[DEBUG] Audio request: ${filename}`);
  console.log(`[DEBUG] Full path: ${audioPath}`);
  console.log(`[DEBUG] Exists: ${fs.existsSync(audioPath)}`);

  if (fs.existsSync(audioPath)) {
    res.sendFile(audioPath);
  } else {
    res.status(404).json({ error: "Audio file not found", path: audioPath });
  }
});

app.use("/uploads", express.static(uploadDir));

// ─── Swagger Docs (dev only) ─────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.get("/api/docs/json", (req, res) => res.json(swaggerDoc));
  app.get("/api/docs", (req, res) => {
    res.send(`<!DOCTYPE html><html><head><title>VinaMec API Docs</title>
      <meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" >
      </head><body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
      <script>SwaggerUIBundle({url:"/api/docs/json",dom_id:"#swagger-ui",presets:[SwaggerUIBundle.presets.apis,SwaggerUIBundle.SwaggerUIStandalonePreset],layout:"StandaloneLayout"})</script>
      </body></html>`);
  });
}

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use("/api", routes);

// Root
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🦷 VinaMec Dental Care API",
    version: "1.0.0",
    docs: "/api/health",
  });
});

// ─── 404 & Error Handlers ────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  // Start background jobs after server is up
  startJobs();
  console.log(`\n🚀 VinaMec API running on port ${PORT}`);
  console.log(`   Mode:     ${process.env.NODE_ENV}`);
  console.log(`   MongoDB:  ${process.env.MONGODB_URI}`);
  console.log(`   Uploads:  ${uploadDir}`);
  console.log(`   Socket:   WebRTC signaling active`);
  console.log(`   Health:   http://localhost:${PORT}/api/health\n`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received – shutting down gracefully");
  stopJobs();
  io.close();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
