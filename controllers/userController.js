const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchErrorAsync = require('../utils/catcherrorasync');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

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

//ADMIN SESSION

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.createUser = factory.createOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
