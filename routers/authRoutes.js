const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.route("/register").post(authController.register);
router.route("/login").post(authController.login);
router.route("/logout").get(authController.protect, authController.logout);
router.route("/me").get(authController.protect, authController.getMe);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:resetToken", authController.resetPassword);

router.patch(
  "/updateDetails",
  authController.protect,
  authController.updateDetails
);
router.patch(
  "/updatePassword",
  authController.protect,
  authController.updatePassword
);

module.exports = router;
