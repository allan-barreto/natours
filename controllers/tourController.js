const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apifeatures');
const AppError = require('../utils/appError');
const catchErrorAsync = require('../utils/catcherrorasync');

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,-ratingsAverage';
  req.query.select = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchErrorAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  res.status(200).send({
    status: 'success',
    results: tours.length,
    data: { tours: /*<-url*/ tours /*<-variable*/ },
  });
});

exports.getTour = catchErrorAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new AppError('Tour not found', 404));
  }
  res.status(200).json(tour);
});

exports.createTour = catchErrorAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({ status: 'Success', data: { tour: newTour } });
});

exports.updateTour = catchErrorAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError('Tour not found', 404));
  }
  res
    .status(200)
    .json({ status: 'success', message: 'Tour updated', data: tour });
});

exports.deleteTour = catchErrorAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('Tour not found', 404));
  }
  res.status(204).json({ status: 'Success', data: null });
});

exports.getTourStats = catchErrorAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 1 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
  ]);
  res.status(200).json({ status: 'Success', data: stats });
});

exports.getMonthlyPlan = catchErrorAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
