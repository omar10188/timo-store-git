require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function resetStock() {
  await mongoose.connect(process.env.MONGO_URI || process.env.DB_URI);
  await Product.updateMany({}, { stock: 50 });
  console.log("✅ All product stocks reset to 50");
  await mongoose.disconnect();
}

resetStock();
