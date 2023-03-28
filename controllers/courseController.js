const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/ApiFeatures");

//  @Route       /api/v1/courses
//  @Route       /api/v1/bootcamps/:232333Id/courses
//  @method       GET
//  @Access         public
exports.getAllCourses = catchAsync(async function (req, res, next) {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    res.status(201).json({
      success: true,
      items: courses.length,
      data: {
        courses,
      },
    });
  } else {
    const totalCourses = await Course.countDocuments();
    // Create ApiFeature instance class(child class)
    const features = new ApiFeatures(Course.find(), req.query, totalCourses)
      .filter()
      .sort()
      .select()
      .paginate();
    // execute the query
    const courses = await features.query.populate({
      path: "bootcamp",
      select: "name description",
    });

    res.status(201).json({
      success: true,
      pagination: features.pagination,
      items: courses.length,
      data: {
        courses,
      },
    });
  }
});

//  @Route       /api/v1/courses/:id
//  @method       GET
//  @Access         public
exports.getCourse = catchAsync(async function (req, res, next) {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new AppError(404, "There is no course with this ID"));
  }
  res.status(200).json({
    success: true,
    data: {
      course,
    },
  });
});

//  @Route       /api/v1/bootcamp/:bootcampId/courses
//  @method       POST
//  @Access         private
exports.createCourse = catchAsync(async function (req, res, next) {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user._id;

  const bootcamp = await Bootcamp.findById(req.body.bootcamp);
  if (!bootcamp) {
    return next(new AppError(404, "There is no bootcamp with this ID"));
  }

  // Check admin and publisher of bootcamp can only create update and delete courses
  if (
    bootcamp.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(
      new AppError(
        401,
        "You are not authorzied to create course to this bootcamp"
      )
    );
  }

  const course = await Course.create(req.body);

  await res.status(201).json({
    success: true,
    data: {
      course,
    },
  });
});

//  @Route       /api/v1/courses/:id
//  @method       PATCH
//  @Access         private
exports.updateCourse = catchAsync(async function (req, res, next) {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(new AppError(404, "There is no course with this ID"));
  }
  // Check admin and course owner
  if (
    course.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(
      new AppError(
        401,
        "You are not authorzied to update course to this bootcamp"
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  res.status(200).json({
    success: true,
    data: {
      course,
    },
  });
});

//  @Route       /api/v1/courses/:id
//  @method       DELETE
//  @Access         private
exports.deleteCourse = catchAsync(async function (req, res, next) {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(new AppError(404, "There is no course with this ID"));
  }

  // Check admin and course owner can only create update and delete courses
  if (
    course.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(
      new AppError(
        401,
        "You are not authorzied to delete course to this bootcamp"
      )
    );
  }

  course = await Course.findByIdAndDelete(req.params.id);
  res.status(204).json({
    success: true,
    data: null,
  });
});
