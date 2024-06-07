const mongoose = require("mongoose");

const databaseString =
  process.env.DB_STRING || "mongodb://localhost:27017/ivdBackend";

const mongooseDb = async () => {
  await mongoose.connect(databaseString);
  console.log("DB connected successfully");
};

module.exports = mongooseDb;
