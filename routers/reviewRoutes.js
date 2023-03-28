const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");
const Review = require("../models/Review");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo("user", "admin"),
    reviewController.createReview
  );
router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(authController.protect, reviewController.updateReview)
  .delete(authController.protect, reviewController.deleteReview);
module.exports = router;
