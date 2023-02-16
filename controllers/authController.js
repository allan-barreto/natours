const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchErrorAsync = require('../utils/catcherrorasync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchErrorAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,
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

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    //roles is an array[]
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };

exports.forgotPassword = catchErrorAsync(async (req, res, next) => {
  // get user based on e-mail
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError(
        'The informed e-mail is not registered in our database.',
        404
      )
    );
  }

  // generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // send it to the user's e-mail
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/user/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}.
  If you didn't forget your password, please ignore this e-mail`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
    res
      .status(200)
      .json({ status: 'success', message: 'Token sent to e-mail' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There is an error sending the e-mail. Please try again later',
        500
      )
    );
  }
});

exports.resetPassword = catchErrorAsync(async (req, res, next) => {
  // 1 - Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  // extract the user of the token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2 - If token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3 - Update passwordChangedAt propriety for the user

  // 4 - Log the user in, send JWT
  const token = signToken(user._id);
  res.status(200).json({ status: 'success', token });
});

exports.updatePassword = (req, res, next) => {};
