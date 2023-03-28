const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendMail = require("../utils/email");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

//  @Route       /api/v1/auth/register
//  @method       GET
//  @Access         public
exports.register = catchAsync(async function (req, res, next) {
  // 1 get the data
  const { name, email, password, role } = req.body;

  //2 create user and hash the password
  const user = await User.create({ name, email, password, role });

  // 3 sign and send jwt
  sendTokenResponse(user, 201, res);
});

//  @Route       /api/v1/auth/login
//  @method       POST
//  @Access         public
exports.login = catchAsync(async function (req, res, next) {
  // get the email and pass
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError(400, "Please provide Email and Password"));

  // 2 check user exist belong to email and password is aslo correct
  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new AppError(400, "Invalid Crendentials"));

  const isMatch = await user.matchPasswrods(password);
  if (!isMatch) return next(new AppError(400, "Invalid Crendentials"));

  // Sign and send jwt
  sendTokenResponse(user, 200, res);
});

//  @Route       /api/v1/auth/logout
//  @method       GET
//  @Access         public
exports.logout = catchAsync(async function (req, res, next) {
  const token = "logout";
  res.cookie("token", token, {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    token,
    data: {},
  });
});

const sendTokenResponse = function (user, statusCode, res) {
  const token = user.signJwt();
  // also send with cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("token", token, cookieOptions);
  res.status(statusCode).json({
    success: true,
    token,
  });
};

exports.protect = catchAsync(async function (req, res, next) {
  // check the token exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token)
    return next(
      new AppError(401, "You are not authorized to this route.Please log in")
    );
  // 2 check the token valid
  try {
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedPayload.id);
  } catch (err) {
    return next(
      new AppError(401, "You are not authorized to this route.Please log in")
    );
  }
  next();
});

exports.restrictTo = function (...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(403, "You do not have permission to access this route")
      );
    next();
  };
};

//  @Route       /api/v1/auth/getMe
//  @method       GET
//  @Access         public
exports.getMe = catchAsync(async function (req, res, next) {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    user,
  });
});

//  @Route       /api/v1/auth/forgotPassword
//  @method       POST
//  @Access         public
exports.forgotPassword = catchAsync(async function (req, res, next) {
  // Find the user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError(400, "There is no user with this email address"));
  // Create and send Reset Token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetUrl}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendMail({
      email: user.email,
      subject: "Your password reset token (valid for 10 mins)",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

//  @Route       /api/v1/auth/resetPassword/:resetToken
//  @method       PATCH
//  @Access         public
exports.resetPassword = catchAsync(async function (req, res, next) {
  // Get the token and hashed it
  const resetToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswrodExpire: { $gte: Date.now() },
  });
  if (!user) return next(new AppError(400, "Invalid Password Reset Token"));

  user.password = req.body.newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswrodExpire = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

//  @Route       /api/v1/auth/updateDetails
//  @method       GET
//  @Access         private
exports.updateDetails = catchAsync(async function (req, res, next) {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
    runValidators: true,
    new: true,
  });
  res.status(200).json({
    success: true,
    user,
  });
});

//  @Route       /api/v1/auth/updatePassword
//  @method       GET
//  @Access         private
exports.updatePassword = catchAsync(async function (req, res, next) {
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.matchPasswrods(req.body.currentPassword))) {
    return next(new AppError(400, "Wrong Password,try agian"));
  }

  user.password = req.body.newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    user,
  });
});
