const Review = require('../models/reviewModel');
const APIFeatures = require('../utils/apifeatures');
const AppError = require('../utils/appError');
const catchErrorAsync = require('../utils/catcherrorasync');

exports.getAllReviews = catchErrorAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const reviews = await Review.find(filter);

  res.status(200).send({
    status: 'success',
    results: reviews.length,
    data: { reviews: /*<-url*/ reviews /*<-variable*/ },
  });
});

exports.getReview = catchErrorAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new AppError('Review not found', 404));
  }
  res.status(200).json(review);
});

exports.createReview = catchErrorAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  const newReview = await Review.create(req.body);
  res.status(201).json({ status: 'Success', data: { review: newReview } });
});

exports.updateReview = catchErrorAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (review) {
    return next(new AppError('Review not found', 404));
  }
  res
    .status(200)
    .json({ status: 'success', message: 'Review updated!', data: review });
});

exports.deleteReview = catchErrorAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (review) {
    return next(new AppError('Review not found', 404));
  }
  res.status(204).json({ status: 'Success', data: null });
});
