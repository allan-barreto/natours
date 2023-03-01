const mongoose = require('mongoose');

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

const Review = mongoose.model('Review', reviewSchemma);
module.exports = Review;
