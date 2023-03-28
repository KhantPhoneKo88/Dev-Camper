const mongoose = require("mongoose");

const connectDB = async function () {
  await mongoose.connect(process.env.DB_STRING, {
    useNewUrlParser: true,
  });
  console.log("Database connection success".green.bold);
};

module.exports = connectDB;
