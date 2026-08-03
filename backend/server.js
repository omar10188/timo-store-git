const config = require("./config");

const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

// DB
const connectDB = require("./config/db");

// Utils
const logger = require("./utils/logger");

// Socket.io
const { initSocket } = require("./socket");

// Routes
const paymentRoutes = require("./routes/paymentRoutes");
const apiRoutes = require("./routes");

// Middleware
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

const compression = require("compression");
const app = express();
const server = http.createServer(app);

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
    },
  },
  hidePoweredBy: true,
  frameguard: { action: "deny" }
}));

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

const { globalLimiter } = require("./middleware/rateLimiter");
app.use(globalLimiter);

// ─── Payment Webhook (Must be before express.json) ───────────────────────────
// Stripe requires the raw body to verify the signature
app.use("/api/payments/webhook", express.raw({ type: "application/json" }), paymentRoutes);

// ─── General Middleware ────────────────────────────────────────────────────────
const morganFormat = config.env === "production" ? "combined" : "dev";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());
app.use(compression());

// Sanitization must be after body parsers
// Express 5 workaround for old middlewares that try to mutate req.query
app.use((req, res, next) => {
  Object.defineProperty(req, "query", {
    value: req.query,
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// CSRF Origin Protection Middleware
const csrfProtection = require("./middleware/csrfProtection");
app.use(csrfProtection);


// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "Timo Store API is running 🚀",
    version: "2.0.0",
    endpoints: [
      "/api/auth",
      "/api/products",
      "/api/categories",
      "/api/orders",
      "/api/cart",
      "/api/wishlist",
      "/api/coupons",
      "/api/reviews",
      "/api/admin",
    ],
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use("/api", apiRoutes);

// ─── Error Handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────
connectDB()
  .then(() => {
    const PORT = config.port;
    // Initialize Socket.io on the HTTP server
    initSocket(server);
    server.listen(PORT, () => {
      console.log(`✅ MongoDB connected`);
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`⚡ Socket.io ready`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1);
  });