const mongoose = require("mongoose");

const config = require("./index");

const connectDB = async () => {
  return mongoose.connect(config.db.uri);
};

module.exports = connectDB;