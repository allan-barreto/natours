const User = require('../models/userModel');
const APIFeatures = require('../utils/apifeatures');
const AppError = require('../utils/appError');
const catchErrorAsync = require('../utils/catcherrorasync');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchErrorAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const users = await features.query;

  res.status(200).send({
    status: 'success',
    results: users.length,
    data: { users: /*<-url*/ users /*<-variable*/ },
  });
});

exports.updateMe = catchErrorAsync(async (req, res, next) => {
  // Create a error if the user POST password data
  if (req.body.password || req.body.confirmPassword) {
    return next(new AppError('This route is not for password updates', 400));
  }
  // filtered out unwanted fields that are not allow to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  // Update User document
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ status: 'success', data: user });
});

exports.deleteMe = catchErrorAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({ status: 'Success', data: null });
});

exports.getUser = catchErrorAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.status(200).json(user);
});

exports.createUser = catchErrorAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).json({ status: 'Success', data: { user: newUser } });
});

exports.updateUser = catchErrorAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  res
    .status(200)
    .json({ status: 'success', message: 'User updated!', data: user });
});

exports.deleteUser = catchErrorAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.status(204).json({ status: 'Success', data: null });
});
