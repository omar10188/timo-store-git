/**
 * Automated Shopping Cart Test Suite
 * Step 8 Verification Script
 */
require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const config = require("../config");
const User = require("../models/User");
const Product = require("../models/Product");

async function runCartTests() {
  console.log("🛒 Starting Automated Shopping Cart Test Suite...\n");

  try {
    await mongoose.connect(config.db.uri);
    console.log("✅ Step 0: Connected to MongoDB for cart verification");

    // 1. Prepare User and Product
    const testEmail = "carttest@example.com";
    const testPassword = "Password123!";
    let testUser = await User.findOne({ email: testEmail });
    if (!testUser) {
      testUser = await User.create({
        name: "Cart Tester",
        email: testEmail,
        password: testPassword,
        role: "user",
        emailVerified: true,
      });
    }

    const product = await Product.findOne({});
    if (!product) {
      throw new Error("No product found in database to perform cart test!");
    }
    console.log(`✅ Step 0: Prepared test product '${product.name}' (ID: ${product._id})`);

    // 2. Login to get AccessToken
    const loginPayload = JSON.stringify({ email: testEmail, password: testPassword });
    const loginRes = await makeRequest("/api/auth/login", "POST", loginPayload, {
      "Content-Type": "application/json",
    });

    const loginData = JSON.parse(loginRes.body);
    const accessToken = loginData.data?.accessToken;
    if (!accessToken) {
      throw new Error("Login failed during cart test setup!");
    }
    console.log("✅ Step 1: User authenticated. AccessToken acquired.");

    // 3. Test Add to Cart (POST /api/cart)
    console.log("\n🔹 STEP 2: Sending POST /api/cart request...");
    const cartPayload = JSON.stringify({ productId: product._id.toString(), quantity: 1 });
    const addRes = await makeRequest("/api/cart", "POST", cartPayload, {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    });

    console.log(`  - HTTP Status: ${addRes.statusCode}`);
    if (addRes.statusCode !== 200) {
      throw new Error(`Add to Cart failed with status ${addRes.statusCode}: ${addRes.body}`);
    }

    const addData = JSON.parse(addRes.body);
    console.log("  - Response Success:", addData.success);
    console.log("  - Cart Items Count:", addData.data?.items?.length);
    console.log("  - Cart Total Price:", addData.data?.totalPrice);

    if (!addData.success || !Array.isArray(addData.data?.items) || addData.data.items.length === 0) {
      throw new Error("Invalid cart response payload structure!");
    }
    console.log("  - Add to Cart API & DB Update: PASS");

    // 4. Test Get Cart (GET /api/cart)
    console.log("\n🔹 STEP 3: Sending GET /api/cart request...");
    const getRes = await makeRequest("/api/cart", "GET", null, {
      Authorization: `Bearer ${accessToken}`,
    });

    if (getRes.statusCode !== 200) {
      throw new Error(`Get Cart failed with status ${getRes.statusCode}`);
    }
    const getData = JSON.parse(getRes.body);
    console.log("  - Fetched Cart Items Count:", getData.data?.items?.length);
    console.log("  - Get Cart API: PASS");

    console.log("\n✨ ALL AUTOMATED CART TESTS PASSED SUCCESSFULLY! 🎉\n");
  } catch (err) {
    console.error("\n❌ CART TEST FAILED:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
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

runCartTests();
