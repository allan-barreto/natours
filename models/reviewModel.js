const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchemma = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
      maxlength: [
        300,
        'A tour name must have less or equal than 300 characters',
      ],
      minlength: [5, 'A review must have more than 5 characters'],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    createdAt: { type: Date, defaut: Date.now() },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      require: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: [true, 'Review must belong to a user'],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

reviewSchemma.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name photo -_id' });
  next();
});

reviewSchemma.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        numberRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].numberRatings,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchemma.index({ tour: 1, user: 1 }, { unique: true });

reviewSchemma.post('save', function (next) {
  this.constructor.calcAverageRatings(this.tour);
});

// FOR DELETE AND UPDATE REVIEW:

reviewSchemma.pre(/^findByIdAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchemma.post(/^findByIdAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchemma);
module.exports = Review;
