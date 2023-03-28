const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../middlewares/geoCoder");
const Course = require("./Course");

const bootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "please add a name"],
      maxlength: [50, "Name can not be longer than 50 characters"],
    },
    slug: String,
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [500, "Description can not be longer than 500 characters"],
    },
    webiste: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "Please add a valid URL with HTTP or HTTPS",
      ],
    },
    phone: {
      type: String,
      maxlength: [20, "Phone number can not be longer than 20 characters"],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    address: {
      type: String,
      required: [true, "Please add a address"],
    },
    location: {
      // GeoJson
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    careers: {
      type: [String],
      required: true,
      enum: [
        "Web Development",
        "Mobile Development",
        "UI/UX",
        "Data Science",
        "Business",
        "Other",
      ],
    },
    averageRating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [10, "Rating can not be more than 10"],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    photo: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    select: "-__v",
  }
);

// Virtual Porperties
bootcampSchema.virtual("courses", {
  ref: "Course",
  foreignField: "bootcamp",
  localField: "_id",
  justOne: false,
});

bootcampSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Geocoder for location
bootcampSchema.pre("save", async function (next) {
  const res = await geocoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [res[0].longitude, res[0].latitude],
    formattedAddress: res[0].formattedAddress,
    street: res[0].streetName,
    city: res[0].city,
    state: res[0].stateCode,
    zipcode: res[0].zipcode,
    country: res[0].countryCode,
  };
  this.address = undefined;
  next();
});
const Bootcamp = mongoose.model("Bootcamp", bootcampSchema);
module.exports = Bootcamp;
