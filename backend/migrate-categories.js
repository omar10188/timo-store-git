const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/timo-store';

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection('products');

    const products = await collection.find({}).toArray();
    console.log(`Found ${products.length} products`);

    let updated = 0;
    for (const prod of products) {
      if (prod.category && !prod.categories) {
        // Move single category to categories array
        await collection.updateOne(
          { _id: prod._id },
          { 
            $set: { categories: [prod.category] },
            $unset: { category: "" }
          }
        );
        updated++;
      } else if (prod.categories && prod.category) {
        // Already has categories array but category still exists (cleanup)
        await collection.updateOne(
          { _id: prod._id },
          { $unset: { category: "" } }
        );
      }
    }

    console.log(`Successfully updated ${updated} products.`);
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

migrate();
