const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/ApiFeatures");
const Review = require("../models/Review");
const Bootcamp = require("../models/Bootcamp");

//  @Route       /api/v1/reviews
//  @Route       /api/v1/bootcamps/:232333Id/reviews
//  @method       GET
//  @Access         public
exports.getAllReviews = catchAsync(async function (req, res, next) {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    res.status(201).json({
      success: true,
      items: reviews.length,
      data: {
        reviews,
      },
    });
  } else {
    const totalReviews = await Review.countDocuments();
    // Create ApiFeature instance class(child class)
    const features = new ApiFeatures(Review.find(), req.query, totalReviews)
      .filter()
      .sort()
      .select()
      .paginate();
    // execute the query
    const reviews = await features.query.populate({
      path: "bootcamp",
      select: "name description",
    });

    res.status(201).json({
      success: true,
      pagination: features.pagination,
      items: reviews.length,
      data: {
        reviews,
      },
    });
  }
});

//  @Route       /api/v1/reviews/:reviewId
//  @method       GET
//  @Access         public
exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });
  if (!review)
    return next(new AppError(400, "There is no review with this id"));
  res.status(200).json({
    success: true,
    data: {
      review,
    },
  });
});

//  @Route       /api/v1/bootcamps/:232333Id/reviews
//  @method       Post
//  @Access         public
exports.createReview = catchAsync(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp)
    return next(new AppError(404, "There is no bootcamp with this Id"));

  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const review = await Review.create(req.body);
  res.status(201).json({
    success: true,
    data: {
      review,
    },
  });
});

//  @Route       /api/v1/reviews/:reviewId
//  @method       PATCH
//  @Access         private
exports.updateReview = catchAsync(async (req, res, next) => {
  let review = await Review.findOne({ _id: req.params.id });
  if (!review)
    return next(new AppError(404, "There is no review with this id"));
  // Check user is the one who belong to review or admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new AppError(401, "TYou are not authorzied to update this review")
    );
  }
  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    success: true,
    data: {
      review,
    },
  });
});

//  @Route       /api/v1/reviews/:reviewId
//  @method       Delete
//  @Access         private
exports.deleteReview = catchAsync(async (req, res, next) => {
  let review = await Review.findById(req.params.id);
  if (!review)
    return next(new AppError(404, "There is no review with this id"));
  // Check user is the one who belong to review or admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new AppError(401, "TYou are not authorzied to delete this review")
    );
  }
  review = await Review.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: null,
  });
});
