const AppError = require('../utils/appError');
const catchErrorAsync = require('../utils/catcherrorasync');
const APIFeatures = require('../utils/apifeatures');

exports.getAll = (Model) =>
  catchErrorAsync(async (req, res, next) => {
    // allow nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    res.status(200).send({
      status: 'success',
      results: doc.length,
      data: { data: doc },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchErrorAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError('Document not found', 404));
    }
    res.status(200).json({ status: 'success', data: { data: doc } });
  });

exports.createOne = (Model) =>
  catchErrorAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({ status: 'Success', data: { data: doc } });
  });

exports.updateOne = (Model) =>
  catchErrorAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('Document not found', 404));
    }
    res
      .status(200)
      .json({ status: 'success', message: 'Doc updated', data: doc });
  });

exports.deleteOne = (Model) =>
  catchErrorAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('Document not found', 404));
    }
    res.status(204).json({ status: 'Success', data: null });
  });
