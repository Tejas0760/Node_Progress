// Modules Required
const express = require('express');
const limiter = require('express-rate-limit');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const app = express();

const globalErrorHandeler = require('./controller/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const reviewRouter = require('./routes/reviewRoute');
const viewRouter = require('./routes/viewRoutes');
const pug = require('pug');
const { title } = require('process');
const cookieParser = require('cookie-parser');

// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = ['https://unpkg.com/', 'https://tile.openstreetmap.org'];
const styleSrcUrls = [
    'https://unpkg.com/',
    'https://tile.openstreetmap.org',
    'https://fonts.googleapis.com/',
];
const connectSrcUrls = ['https://unpkg.com', 'https://tile.openstreetmap.org'];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Global MiddleWare
app.use(express.static(path.join(__dirname, 'public')));

// Set HTTP Security

//set security http headers
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", 'blob:'],
            objectSrc: [],
            imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// DOS Attack prevention
const limit = limiter({
    //max number of request from one IP
    max: 100,

    //time window for those req (sec * min * milisecond)
    window: 60 * 60 * 1000,

    //message to be shown when the limit is crossed
    message: 'Too many requests from this IP, Please try again Later!',
});

//can specify on which route we want this limiter
app.use('/api', limit);

//middle ware to parse the json object
//Body Parser
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

//Since now the data is parsed we can now sanitize the data and prevent it from NOsql injection and XSS Attacks (These are functions so make sure to add () after)
//Data sanitiztion for NOSQL
app.use(mongoSanitize());

//Data sanitizaton against XSS
app.use(xss());

// http parameter pollution prevention
app.use(
    hpp({
        whitelist: [
            'difficulty',
            'maxGroupSize',
            'ratingsAverage',
            'startDates',
            'price',
            'duration',
        ],
    })
);

// To Access static files we need to define a middleware like this
// app.use(express.static($(Path to that directory containing the static files)$))

// 1) All Methods

// 2) Routing
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// 3) Error handeling
app.all('*', (req, res, next) => {
    console.log('Reached catch-all handler');
    next(
        new AppError(
            `Can't find any route with ${req.originalUrl} please check your route again!`,
            404
        )
    );
});

// if we use err here then express automatically knows that this is the global error handeler
app.use(globalErrorHandeler);

/*
//get all
app.get("/api/v1/tours", getAllTours);

// get by id
app.get("/api/v1/tours/:id", getTourById);

// Add New Tour
app.post("/api/v1/tours", addNewTour);

// Patch method(Used when we only need to update a part of the entire object instead of the object)
// In PUT we will have to pass the entire object but not in Patch
app.patch("/api/v1/tours/:id", updateTour);
*/

module.exports = app;
