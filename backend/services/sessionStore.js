/**
 * Session Store Service
 * Dual-tier Session Management:
 * 1. Primary: Ultra-fast Redis Memory Cache (O(1) lookups with automatic TTL)
 * 2. Secondary / Fallback: MongoDB User.sessions Array
 */

const crypto = require("crypto");
const logger = require("../utils/logger");
const User = require("../models/User");

// Optional Redis Connection (Graceful degraded mode if Redis is not running)
let redisClient = null;
try {
  const Redis = require("ioredis");
  redisClient = new Redis(process.env.REDIS_URI || "redis://localhost:6379", {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
  });

  redisClient
    .connect()
    .then(() => {
      logger.info("⚡ Redis Session Store connected successfully");
    })
    .catch((err) => {
      logger.warn(`ℹ️ Redis not available (${err.message}). Using MongoDB Session Store.`);
      redisClient = null;
    });
} catch {
  // ioredis not installed — seamless fallback to MongoDB
  redisClient = null;
}

/**
 * Helper to compute device fingerprint hash from request headers
 */
const computeFingerprint = (req) => {
  const userAgent = req?.headers?.["user-agent"] || "unknown-agent";
  const ip = req?.ip || req?.connection?.remoteAddress || "unknown-ip";
  const acceptLanguage = req?.headers?.["accept-language"] || "";

  return crypto
    .createHash("sha256")
    .update(`${userAgent}|${ip}|${acceptLanguage}`)
    .digest("hex");
};

/**
 * Save new session into Redis and MongoDB
 */
const saveSession = async (user, tokenHash, expiresAt, req) => {
  const fingerprint = computeFingerprint(req);
  const userAgent = req?.headers?.["user-agent"] || "";
  const device = userAgent ? userAgent.split("(")[0].trim() : "Unknown Device";
  const ip = req?.ip || req?.connection?.remoteAddress || "Unknown IP";

  const sessionObj = {
    tokenHash,
    fingerprint,
    device,
    ip,
    createdAt: new Date(),
    expiresAt,
  };

  // 1. Sync to MongoDB
  user.sessions = (user.sessions || []).filter(
    (s) => s.expiresAt && new Date(s.expiresAt) > new Date()
  );

  // Enforce Max 5 Active Sessions
  if (user.sessions.length >= 5) {
    user.sessions.shift();
  }

  user.sessions.push(sessionObj);
  await user.save({ validateBeforeSave: false });

  // 2. Cache in Redis if available
  if (redisClient && redisClient.status === "ready") {
    try {
      const ttlSeconds = Math.max(
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
        60
      );
      const redisKey = `session:${user._id}:${tokenHash}`;
      await redisClient.set(
        redisKey,
        JSON.stringify(sessionObj),
        "EX",
        ttlSeconds
      );
    } catch (err) {
      logger.warn(`Redis session set failed: ${err.message}`);
    }
  }

  return sessionObj;
};

/**
 * Verify Session & Device Fingerprint with Strict Rotation (Single-Use Tokens)
 */
const verifyAndRotateSession = async (user, incomingHash, req) => {
  const currentFingerprint = computeFingerprint(req);

  let session = null;
  let isFromRedis = false;

  // 1. Attempt ultra-fast lookup in Redis
  if (redisClient && redisClient.status === "ready") {
    try {
      const redisKey = `session:${user._id}:${incomingHash}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        session = JSON.parse(cached);
        isFromRedis = true;
      }
    } catch (err) {
      logger.warn(`Redis session get failed: ${err.message}`);
    }
  }

  // 2. Fallback to MongoDB if not found in Redis
  if (!session) {
    session = (user.sessions || []).find((s) => s.tokenHash === incomingHash);
  }

  // Reuse / Compromise Detection
  if (!session) {
    // Revoke all sessions immediately on suspected token reuse
    user.sessions = [];
    await user.save({ validateBeforeSave: false });
    if (redisClient && redisClient.status === "ready") {
      try {
        const keys = await redisClient.keys(`session:${user._id}:*`);
        if (keys.length > 0) await redisClient.del(...keys);
      } catch {}
    }
    return {
      valid: false,
      reason: "REUSE_DETECTED",
      message: "Security Alert: Token reuse or invalid session. All sessions revoked.",
    };
  }

  // Device Fingerprint Binding Check
  if (session.fingerprint !== currentFingerprint) {
    // Token presented from a different device/IP -> Suspected Theft!
    user.sessions = user.sessions.filter((s) => s.tokenHash !== incomingHash);
    await user.save({ validateBeforeSave: false });

    if (redisClient && redisClient.status === "ready") {
      try {
        await redisClient.del(`session:${user._id}:${incomingHash}`);
      } catch {}
    }

    return {
      valid: false,
      reason: "FINGERPRINT_MISMATCH",
      message: "Security Warning: Session fingerprint mismatch (different device or IP). Access denied.",
    };
  }

  // 3. Strict Rotation: Invalidate the consumed session immediately (One-Time Use Token)
  user.sessions = user.sessions.filter((s) => s.tokenHash !== incomingHash);
  await user.save({ validateBeforeSave: false });

  if (redisClient && redisClient.status === "ready") {
    try {
      await redisClient.del(`session:${user._id}:${incomingHash}`);
    } catch {}
  }

  return { valid: true, session };
};

/**
 * Destroy a specific session on logout
 */
const destroySession = async (user, tokenHash) => {
  if (user && tokenHash) {
    user.sessions = (user.sessions || []).filter(
      (s) => s.tokenHash !== tokenHash
    );
    await user.save({ validateBeforeSave: false });

    if (redisClient && redisClient.status === "ready") {
      try {
        await redisClient.del(`session:${user._id}:${tokenHash}`);
      } catch {}
    }
  }
};

/**
 * Destroy all sessions for a user
 */
const destroyAllSessions = async (user) => {
  if (user) {
    user.sessions = [];
    await user.save({ validateBeforeSave: false });

    if (redisClient && redisClient.status === "ready") {
      try {
        const keys = await redisClient.keys(`session:${user._id}:*`);
        if (keys.length > 0) await redisClient.del(...keys);
      } catch {}
    }
  }
};

module.exports = {
  computeFingerprint,
  saveSession,
  verifyAndRotateSession,
  destroySession,
  destroyAllSessions,
};
