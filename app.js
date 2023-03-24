const express = require('express');
const morgan = require('morgan');
const ratelimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./router/tourRouter');
const userRouter = require('./router/userRouter');
const reviewRouter = require('./router/reviewRouter');
const viewRouter = require('./router/viewRouter');
const bookingRouter = require('./router/bookingRouter');

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set Security HTTP header
app.use(helmet());

// Development login
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// limit requests from same API
const limiter = ratelimit({
  max: 200,
  windowMs: 60 * 10 * 1000,
  message: 'Too many request from this IP. Try again later',
});
app.use('/api', limiter);

// Body Parser, reading data from body into req.body
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//Data sanitization against noSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

// Prevent parameter polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'maxGroupSize',
      'ratingsAverage',
      'ratingsQuantity',
      'difficulty',
      'price',
    ],
  })
);

// Test Middleware
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   console.log(req.cookies);
//   next();
// });

// 3) ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
