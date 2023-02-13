const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchErrorAsync = require('../utils/catcherrorasync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchErrorAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const token = signToken(newUser._id);

  res.status(201).json({ status: 'Success', token, data: { user: newUser } });
});

exports.login = catchErrorAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // STEPS FOR LOGIN
  // 1- Check if email and password exists:
  if (!email || !password) {
    return next(new AppError('Please provide valid e-mail and password', 400));
  }
  // 2- Verify if e-mail and password are correct
  const user = await User.findOne({ email: email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect e-mail or password', 401));
  }
  // 3- Send token for the client};
  const token = signToken(user._id);
  res.status(200).json({ status: 'success', token });
});
