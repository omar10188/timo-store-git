require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function syncAdmins() {
  await mongoose.connect(process.env.MONGO_URI || process.env.DB_URI);
  
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash("Admin123456", salt);

  await User.updateOne({ email: "admin@timo.com" }, { password: hashed, emailVerified: true, role: "admin" });
  await User.updateOne({ email: "omar0122462356i@gmail.com" }, { password: hashed, emailVerified: true, role: "admin" });

  const admins = await User.find({ role: "admin" }).select("name email role");
  console.log("👑 Verified Admin Accounts:", JSON.stringify(admins, null, 2));

  await mongoose.disconnect();
}

syncAdmins();
