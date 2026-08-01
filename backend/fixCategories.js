const mongoose = require("mongoose");
const slugify = require("slugify");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("🛠️ Fixing Product & Category Mongoose References...\n");

  const Category = require("./models/Category");
  const Product = require("./models/Product");

  // 1. Find or create categories for "Eau de Parfum" and "Parfum"
  const catNames = ["Eau de Parfum", "Parfum", "Luxury Oud", "Fresh Florals"];
  const categoryMap = {};

  for (const name of catNames) {
    let cat = await Category.findOne({ name });
    if (!cat) {
      cat = await Category.create({
        name,
        slug: slugify(name, { lower: true, strict: true }),
        description: `${name} luxury collection`,
      });
      console.log(`✅ Created Category: ${name} (ID: ${cat._id})`);
    } else {
      console.log(`ℹ️ Existing Category: ${name} (ID: ${cat._id})`);
    }
    categoryMap[name] = cat._id;
  }

  // 2. Update products in raw collection to replace text string category with valid ObjectId
  const rawProducts = await mongoose.connection.collection("products").find({}).toArray();

  for (const prod of rawProducts) {
    let targetCatId = null;

    if (typeof prod.category === "string" && !mongoose.Types.ObjectId.isValid(prod.category)) {
      targetCatId = categoryMap[prod.category] || categoryMap["Eau de Parfum"];
    } else if (mongoose.Types.ObjectId.isValid(prod.category)) {
      targetCatId = prod.category;
    } else {
      targetCatId = categoryMap["Eau de Parfum"];
    }

    await mongoose.connection.collection("products").updateOne(
      { _id: prod._id },
      { $set: { category: new mongoose.Types.ObjectId(targetCatId) } }
    );
    console.log(`✅ Updated Product '${prod.name}' -> Linked Category ObjectId: ${targetCatId}`);
  }

  console.log("\n🎉 Database Categories & Products fixed successfully!");
  process.exit(0);
}).catch((err) => {
  console.error("❌ Fix script failed:", err);
  process.exit(1);
});
