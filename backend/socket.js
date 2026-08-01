const { Server } = require("socket.io");
const logger = require("./utils/logger");

let io = null;

/**
 * Initialize Socket.io server
 * @param {import("http").Server} httpServer
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    logger.info(`🔌 Socket connected: ${socket.id}`);

    // Admin joins a dedicated room for real-time order notifications
    socket.on("join-admin", () => {
      socket.join("admin-room");
      logger.info(`👑 Admin joined admin-room: ${socket.id}`);
    });

    socket.on("disconnect", () => {
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  logger.info("✅ Socket.io initialized");
  return io;
};

/**
 * Get the initialized Socket.io instance
 * @returns {import("socket.io").Server}
 */
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initSocket(server) first.");
  }
  return io;
};

module.exports = { initSocket, getIO };
