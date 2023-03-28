const express = require("express");
const bootcampController = require("../controllers/bootcampController");
const authController = require("../controllers/authController");
const Bootcamp = require("../models/Bootcamp");

// Load the course Router for re-routing
const courseRouter = require("./courseRoutes");
const reviewRouter = require("./reviewRoutes");

const router = express.Router();

//Re-route to the courseRouter
router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewRouter);

router.get("/radius/:zipcode/:distance", bootcampController.searchByRaidus);

router
  .route("/")
  .get(bootcampController.getAllBootcamps)
  .post(
    authController.protect,
    authController.restrictTo("admin", "publisher"),
    bootcampController.createBootcamp
  );

router
  .route("/:id")
  .get(bootcampController.getBootcamp)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "publisher"),
    bootcampController.uploadBootcampPhoto,
    bootcampController.updateBootcamp
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "publisher"),
    bootcampController.deleteBootcamp
  );

module.exports = router;
