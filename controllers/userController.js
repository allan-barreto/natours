const User = require('../models/userModel');
const AppError = require('../utils/appError');
const sharp = require('sharp');
const catchErrorAsync = require('../utils/catcherrorasync');
const factory = require('./handlerFactory');
const multer = require('multer');

// // WITHOUT IMAGE PROCESSING (save without modifications)
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const extention = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${extention}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image. Please upload only images', 401), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchErrorAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = catchErrorAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

exports.updateMe = catchErrorAsync(async (req, res, next) => {
  // Create a error if the user POST password data
  if (req.body.password || req.body.confirmPassword) {
    return next(new AppError('This route is not for password updates', 400));
  }
  // filtered out unwanted fields that are not allow to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
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
