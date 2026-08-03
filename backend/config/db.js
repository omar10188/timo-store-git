const mongoose = require("mongoose");
const config = require("./index");

const connectDB = async () => {
  mongoose.set('strictQuery', true);
  return mongoose.connect(config.db.uri);
};

module.exports = connectDB;