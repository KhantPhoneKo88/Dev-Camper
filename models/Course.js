const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Please add a title"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    weeks: {
      type: String,
      required: [true, "Please add a duration in weeks"],
    },
    tuition: {
      type: Number,
      required: [true, "Please add a tuition price"],
    },
    minimumSkill: {
      type: String,
      required: [true, "Please add a minimum skill to study this course"],
      enum: ["beginner", "intermediate", "advanced"],
    },
    scholarhipsAvailable: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    bootcamp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bootcamp",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

courseSchema.statics.calcAveargeCost = async function (bootcampId) {
  console.log("Calculating Avearage Cost for bootcamp".blue);

  const result = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageCost: { $avg: "$tuition" },
      },
    },
  ]);

  await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
    averageCost: result[0].averageCost,
  });
};

courseSchema.post("save", function () {
  this.constructor.calcAveargeCost(this.bootcamp);
});
courseSchema.pre("findOneAndDelete", async function (next) {
  const doc = await this.findOne().clone();
  doc.constructor.calcAveargeCost(doc.bootcamp);
  next();
});

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
