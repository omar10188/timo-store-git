/**
 * Automated Login & Authentication Test Suite
 * Self-contained Step 6 Verification Script
 */
const http = require("http");
const mongoose = require("mongoose");
const config = require("../config");
const User = require("../models/User");

let serverInstance = null;

async function runAuthTests() {
  console.log("🧪 Starting Automated Login & Auth Test Suite...\n");

  try {
    // 0. Ensure Server and DB are running
    await mongoose.connect(config.db.uri);
    console.log("✅ Step 0: Connected to MongoDB for test verification");

    // Check if server is running on port 5000; if not, start it
    const isPortOpen = await checkServerRunning();
    if (!isPortOpen) {
      console.log("⚡ Starting background API server for test execution...");
      const express = require("express");
      const cookieParser = require("cookie-parser");
      const cors = require("cors");
      const apiRoutes = require("../routes");
      const errorHandler = require("../middleware/errorHandler");

      const app = express();
      app.use(cors({ origin: config.clientUrl, credentials: true }));
      app.use(express.json());
      app.use(cookieParser());
      app.use("/api", apiRoutes);
      app.use(errorHandler);

      await new Promise((resolve) => {
        serverInstance = app.listen(config.port, () => {
          console.log(`✅ Test server running on http://localhost:${config.port}`);
          resolve();
        });
      });
    }

    // Prepare Test User
    const testEmail = "authtest@example.com";
    const testPassword = "Password123!";
    let testUser = await User.findOne({ email: testEmail });

    if (!testUser) {
      testUser = await User.create({
        name: "Auth Test User",
        email: testEmail,
        password: testPassword,
        role: "admin",
        emailVerified: true,
      });
    } else {
      testUser.password = testPassword;
      testUser.emailVerified = true;
      await testUser.save();
    }
    console.log("✅ Step 0: Test user prepared:", testEmail, "(role:", testUser.role + ")");

    // 1. Send Login Request
    const loginPayload = JSON.stringify({ email: testEmail, password: testPassword });
    const loginRes = await makeRequest("/api/auth/login", "POST", loginPayload, {
      "Content-Type": "application/json",
    });

    console.log(`\n🔹 STEP 1: Login Request Status: ${loginRes.statusCode}`);
    if (loginRes.statusCode !== 200) {
      throw new Error(`Login failed with status ${loginRes.statusCode}: ${loginRes.body}`);
    }

    const resData = JSON.parse(loginRes.body);
    const accessToken = resData.data?.accessToken;
    const userObj = resData.data?.user;

    console.log("  - Status 200 OK: PASS");
    console.log("  - AccessToken exists:", !!accessToken ? "PASS" : "FAIL");
    console.log("  - User object exists:", !!userObj ? "PASS" : "FAIL");
    console.log("  - User ID:", userObj?._id);
    console.log("  - User Role:", userObj?.role);

    if (!accessToken || !userObj || !userObj.role || !userObj._id) {
      throw new Error("Invalid login payload returned!");
    }

    // Extract Cookie
    const setCookieHeader = loginRes.headers["set-cookie"];
    console.log("  - Set-Cookie header received:", !!setCookieHeader ? "PASS" : "FAIL");
    if (!setCookieHeader) {
      throw new Error("RefreshToken Cookie was not set!");
    }

    const refreshTokenCookie = setCookieHeader.find((c) => c.startsWith("refreshToken="));
    console.log("  - RefreshToken cookie present:", !!refreshTokenCookie ? "PASS" : "FAIL");

    // 2. Call Protected Admin Route (/api/admin/stats)
    console.log("\n🔹 STEP 2: Testing Protected Admin Route (/api/admin/stats)...");
    const adminRes = await makeRequest("/api/admin/stats", "GET", null, {
      Authorization: `Bearer ${accessToken}`,
    });

    console.log(`  - Protected route status: ${adminRes.statusCode}`);
    if (adminRes.statusCode !== 200) {
      throw new Error(`Protected route access failed with status ${adminRes.statusCode}`);
    }
    console.log("  - Protected Admin Route Access: PASS");

    // 3. Simulate Refresh Token Flow
    console.log("\n🔹 STEP 3: Simulating Token Refresh (/api/auth/refresh)...");
    const refreshRes = await makeRequest("/api/auth/refresh", "POST", null, {
      Cookie: refreshTokenCookie,
    });

    console.log(`  - Refresh endpoint status: ${refreshRes.statusCode}`);
    if (refreshRes.statusCode !== 200) {
      throw new Error(`Token refresh failed with status ${refreshRes.statusCode}: ${refreshRes.body}`);
    }

    const refreshData = JSON.parse(refreshRes.body);
    const newAccessToken = refreshData.data?.accessToken;
    console.log("  - New AccessToken issued:", !!newAccessToken ? "PASS" : "FAIL");

    if (!newAccessToken) {
      throw new Error("Failed to receive new access token from refresh endpoint!");
    }

    console.log("\n✨ ALL AUTOMATED AUTH TESTS PASSED SUCCESSFULLY! 🎉\n");
  } catch (err) {
    console.error("\n❌ TEST SUITE FAILED:", err.message);
    process.exitCode = 1;
  } finally {
    if (serverInstance) {
      serverInstance.close();
    }
    await mongoose.disconnect();
  }
}

function checkServerRunning() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${config.port}/`, (res) => {
      resolve(true);
    });
    req.on("error", () => resolve(false));
  });
}

function makeRequest(path, method, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: "localhost",
      port: config.port || 5000,
      path: path,
      method: method,
      headers: {
        ...headers,
        ...(body ? { "Content-Length": Buffer.byteLength(body) } : {}),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });

    req.on("error", (err) => reject(err));
    if (body) req.write(body);
    req.end();
  });
}

if (require.main === module) {
  runAuthTests();
}

module.exports = { runAuthTests };
