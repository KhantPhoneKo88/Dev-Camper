const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");
const fs = require("fs");

// Load Env
dotenv.config({ path: `${__dirname}/../config.env` });

// Load Model
const Bootcamp = require("../models/Bootcamp");
const Course = require("../models/Course");
const User = require("../models/User");
const Review = require("../models/Review");

// Connect DB
mongoose
  .connect(process.env.DB_STRING, {
    useNewUrlParser: true,
  })
  .then(() => console.log("Database connection success".green.bold));

const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/../_data/bootcamps.json`, "utf-8")
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/../_data/courses.json`, "utf-8")
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../_data/users.json`, "utf-8")
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/../_data/reviews.json`, "utf-8")
);

const importData = async function () {
  try {
    await Review.create(reviews);
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await User.create(users);

    console.log("Data Imported Successfully".green.bold);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async function () {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data Deleted Successfully".red.bold);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") importData();
if (process.argv[2] === "--delete") deleteData();
