const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");
const connectDB = require("./middlewares/connectDB");

mongoose
  .connect(process.env.DB_STRING, {
    useNewUrlParser: true,
  })
  .then(() => console.log("Database connection success".green.bold));

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`Server is listening at port : ${port}`.yellow.bold.underline);
});
