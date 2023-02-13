// MODULES

const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const { json } = require('express');

const app = express();

const appError = require('./utils/appError');
const globalErrorHandling = require('./controllers/errorController.js');
const tourRouter = require('./router/tourRouter');
const userRouter = require('./router/userRouter');
const AppError = require('./utils/appError');

// MIDDLEWARES (app.use)

app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//   console.log('Hello from the middleware');
//   next();
// });

// SYNC

// ROUTES

app.use('/api/v1/tours/', tourRouter);
app.use('/api/v1/users/', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}. Please verify the URL`));
});

app.use(globalErrorHandling);

module.exports = app;
