const geocoder = require("../middlewares/geoCoder");
const multer = require("multer");
const Bootcamp = require("../models/Bootcamp");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/ApiFeatures");

//  @Route       /api/v1/bootcamps
//  @method       GET
//  @Access         public
exports.getAllBootcamps = catchAsync(async function (req, res, next) {
  const totalBootcamps = await Bootcamp.countDocuments();
  const features = new ApiFeatures(Bootcamp.find(), req.query, totalBootcamps)
    .filter()
    .sort()
    .select()
    .paginate();

  const bootcamps = await features.query.populate("courses");

  res.status(200).json({
    success: true,
    itmes: bootcamps.length,
    pagination: features.pagination,
    data: {
      bootcamps,
    },
  });
});

//  @Route       /api/v1/bootcamps
//  @method       POST
//  @Access         private
exports.createBootcamp = catchAsync(async function (req, res, next) {
  // add user to req.body to create parent refrencing
  req.body.user = req.user._id;

  // if user is not admin role , they can create olny 1 bootcamp
  const createdBootcamp = await Bootcamp.findOne({ user: req.user._id });
  if (createdBootcamp && req.user.role !== "admin") {
    return next(
      new AppError(
        401,
        "This user is already created bootcamp,Can not create another bootcamp"
      )
    );
  }
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: {
      bootcamp,
    },
  });
});

//  @Route       /api/v1/bootcamps/:id
//  @method       GET
//  @Access         public
exports.getBootcamp = catchAsync(async function (req, res, next) {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new AppError(404, "There is no tour with this ID"));
  }
  res.status(200).json({
    success: true,
    data: {
      bootcamp,
    },
  });
});

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/imgs/bootcamps");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    cb(null, `bootcamp-${req.params.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = function (req, file, cb) {
  if (!file.mimetype.startsWith("image")) {
    cb(new AppError("400", "Please upload a image"), false);
  }
  cb(null, true);
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

//  @Route       /api/v1/bootcamps/uploadPhoto
//  @method       POST
//  @Access         public
exports.uploadBootcampPhoto = upload.single("photo");

//  @Route       /api/v1/bootcamps/:id
//  @method       PATCH
//  @Access         public
exports.updateBootcamp = catchAsync(async function (req, res, next) {
  if (req.file) {
    req.body.photo = req.file.filename;
  }
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new AppError(404, "There is no tour with this ID"));
  }

  // Bootcamp Publisher or admin can only do update and delete
  if (
    bootcamp.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(
      new AppError(401, "You are not authorzied to update this bootcamp")
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: {
      bootcamp,
    },
  });
});

//  @Route       /api/v1/bootcamps/:id
//  @method       DELETE
//  @Access         public
exports.deleteBootcamp = catchAsync(async function (req, res, next) {
  const bootcamp = await Bootcamp.findByIdAndDelete({ _id: req.params.id });

  if (!bootcamp) {
    return next(new AppError(404, "There is no Bootcamp with this ID"));
  }

  res.status(200).json({
    success: true,
    data: null,
  });
});

//  @Route       /api/v1/bootcamps/radius/:zipcode/:distance
//  @method       GET
//  @Access         public
exports.searchByRaidus = catchAsync(async function (req, res, next) {
  const { zipcode, distance } = req.params;

  const response = await geocoder.geocode(zipcode);
  const lng = response[0].longitude;
  const lat = response[0].latitude;

  const radius = distance / 3963;
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    items: bootcamps.length,
    data: {
      bootcamps,
    },
  });
});
