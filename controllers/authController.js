const { promisify } = require('util');
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

exports.protect = catchErrorAsync(async (req, res, next) => {
  // 1) getting and checking token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged. Please log to get access', 401)
    );
  }

  // 2) verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token not longer exist', 401)
    );
  }
  // 4) Check if the user changes the password after the token was issued
  if (currentUser.changedPassword(decoded.at)) {
    return next(
      new AppError(
        `The user changed the password recently. Please login again`,
        401
      )
    );
  }
  req.user = currentUser;
  next();
});
