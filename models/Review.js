const mongoose = require("mongoose");
const Bootcamp = require("./Bootcamp");

const reviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Add a review title"],
  },
  text: {
    type: String,
    required: [true, "Add a review text"],
  },
  rating: {
    type: Number,
    max: 10,
    min: 1,
    required: [true, "Add a rating between 1 and 10"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bootcamp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
});

reviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

reviewSchema.statics.calcAverageRating = async function (bootcampId) {
  const result = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  const averageRating = result[0].averageRating;

  await Bootcamp.findByIdAndUpdate(
    bootcampId,
    { averageRating: averageRating },
    { new: true, runValidators: true }
  );

  console.log(`Average rating updated for bootcamp ${bootcampId}`.blue);
};

reviewSchema.post("save", async function (net) {
  await this.constructor.calcAverageRating(this.bootcamp);
});

// Call the calcAverageRating method before a review is updated or deleted

reviewSchema.post(/^findOneAnd/, async function (doc) {
  await doc.constructor.calcAverageRating(doc.bootcamp);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
