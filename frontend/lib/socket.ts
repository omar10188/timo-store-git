import { io, Socket } from "socket.io-client";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

let socket: Socket | null = null;

/**
 * Get or create the Socket.io singleton client
 */
export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(BACKEND_URL, {
      withCredentials: true,
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};

/**
 * Connect and join admin room for real-time order notifications
 */
export const connectAdminSocket = (): Socket => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.once("connect", () => {
      s.emit("join-admin");
    });
  }
  return s;
};

/**
 * Disconnect the socket
 */
export const disconnectSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect();
  }
};
