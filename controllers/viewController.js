const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchErrorAsync = require('../utils/catcherrorasync');

exports.getOverview = catchErrorAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', { title: 'All Tours', tours });
});

exports.getTour = catchErrorAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review, rating user',
  });
  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }
  res.status(200).render('tour', { title: `${tour.name}`, tour });
});

exports.getLoginForm = catchErrorAsync(async (req, res) => {
  res.status(200).render('login', { title: 'Login' });
});

exports.getAccount = catchErrorAsync(async (req, res) => {
  res.status(200).render('account', { title: `Your Account` });
});

exports.updateUserData = catchErrorAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    { new: true, runValidators: true }
  );
  res
    .status(200)
    .render('account', { title: `Your Account`, user: updatedUser });
});
