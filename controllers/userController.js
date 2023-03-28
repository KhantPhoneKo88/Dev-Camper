const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/ApiFeatures");

//  @Route       /api/v1/users
//  @method       GET
//  @Access         pirvate/admin
exports.getAllUsers = catchAsync(async function (req, res, next) {
  const totalUsers = await User.countDocuments();
  const features = new ApiFeatures(User.find(), req.query, totalUsers)
    .filter()
    .sort()
    .select()
    .paginate();

  const users = await features.query;
  res.status(200).json({
    success: true,
    itmes: users.length,
    pagination: features.pagination,
    data: {
      users,
    },
  });
});

//  @Route       /api/v1/users/:id
//  @method       GET
//  @Access         private/admin
exports.getUser = catchAsync(async function (req, res, next) {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError(404, "There is no user with this ID"));
  }
  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

//  @Route       /api/v1/users
//  @method       POST
//  @Access         private/admin
exports.createUser = catchAsync(async function (req, res, next) {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: {
      user,
    },
  });
});

//  @Route       /api/v1/users/:id
//  @method       PATCH
//  @Access         private/admin
exports.updateUser = catchAsync(async function (req, res, next) {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  if (!user) {
    return next(new AppError(404, "There is no user with this ID"));
  }

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

//  @Route       /api/v1/users/:id
//  @method       DELETE
//  @Access         private/admin
exports.deleteUser = catchAsync(async function (req, res, next) {
  const user = await User.findByIdAndDelete({ _id: req.params.id });

  if (!user) {
    return next(new AppError(404, "There is no user with this ID"));
  }

  res.status(200).json({
    success: true,
    data: null,
  });
});
