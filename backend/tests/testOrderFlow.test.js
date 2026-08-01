/**
 * Automated Full Order Flow & WhatsApp Checkout Test Suite
 */
require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const config = require("../config");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

async function runOrderFlowTest() {
  console.log("🚀 Starting Automated Order Flow & WhatsApp Checkout Test...\n");

  try {
    await mongoose.connect(config.db.uri);
    console.log("✅ Step 0: Connected to MongoDB");

    // Get a test product
    const product = await Product.findOne({});
    if (!product) {
      throw new Error("No product found in database!");
    }
    console.log(`✅ Step 0: Found test product '${product.name}' (Price: EGP ${product.price})`);

    // 1. Submit Guest Order via POST /api/orders
    const guestPhone = "01234567890";
    const guestName = "Customer Test Guest";
    const guestAddress = "123 Nile Street, Cairo, Egypt";

    const orderPayload = JSON.stringify({
      customer: {
        name: guestName,
        phone: guestPhone,
        address: guestAddress,
      },
      items: [
        {
          product: product._id.toString(),
          name: product.name,
          price: product.price,
          quantity: 2,
          image: product.image,
        },
      ],
      paymentMethod: "whatsapp",
    });

    console.log("\n🔹 STEP 1: Sending POST /api/orders (Guest Checkout)...");
    const orderRes = await makeRequest("/api/orders", "POST", orderPayload, {
      "Content-Type": "application/json",
    });

    console.log(`  - HTTP Status: ${orderRes.statusCode}`);
    if (orderRes.statusCode !== 201) {
      throw new Error(`POST /api/orders failed with status ${orderRes.statusCode}: ${orderRes.body}`);
    }

    const orderBody = JSON.parse(orderRes.body);
    const data = orderBody.data;
    console.log("  - Success:", orderBody.success);
    console.log("  - Order ID:", data.order?._id);
    console.log("  - Total Price:", data.order?.totalPrice);
    console.log("  - WhatsApp URL generated:", !!data.whatsappUrl);
    console.log("  - WhatsApp URL:", data.whatsappUrl);

    if (!data.order || !data.whatsappUrl || !data.whatsappMessage) {
      throw new Error("Order response missing required invoice or WhatsApp data!");
    }

    // 2. Verify User / Customer record in Database
    const createdUser = await User.findOne({ phone: guestPhone });
    if (!createdUser) {
      throw new Error("Customer user profile was not created in database!");
    }
    console.log("\n🔹 STEP 2: Verifying Customer Record & Stats...");
    console.log("  - Customer Name:", createdUser.name);
    console.log("  - Total Orders:", createdUser.totalOrders);
    console.log("  - Total Spent:", createdUser.totalSpent);

    if (createdUser.totalOrders < 1 || createdUser.totalSpent < data.order.totalPrice) {
      throw new Error("Customer total_orders or total_spent stats were not updated properly!");
    }

    // 3. Verify Order record in Database
    const dbOrder = await Order.findById(data.order._id);
    if (!dbOrder) {
      throw new Error("Order document not found in MongoDB!");
    }
    console.log("\n🔹 STEP 3: Verifying Order Details in MongoDB...");
    console.log("  - Customer Name:", dbOrder.customerName);
    console.log("  - Customer Phone:", dbOrder.customerPhone);
    console.log("  - Payment Method:", dbOrder.paymentMethod);
    console.log("  - Status:", dbOrder.status);

    console.log("\n✨ ALL ORDER FLOW & WHATSAPP CHECKOUT TESTS PASSED PERFECTLY! 🎉\n");
  } catch (err) {
    console.error("\n❌ ORDER FLOW TEST FAILED:", err.message);
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

runOrderFlowTest();
