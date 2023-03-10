const Review = require('../models/reviewModel');
const Tour = require('../models/tourModel');
const catchErrorAsync = require('../utils/catcherrorasync');

exports.getOverview = catchErrorAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', { title: 'All Tours', tours });
});

exports.getTour = catchErrorAsync(async (req, res) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review, rating user',
  });
  res.status(200).render('tour', { title: `${tour.name}`, tour });
});

exports.getLoginForm = catchErrorAsync(async (req, res) => {
  res.status(200).render('login', { title: 'Login' });
});
