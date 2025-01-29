// const fs = require('fs');
const Tour = require('./../model/tourModel');
// const apiFeatures = require('./../utils/ApiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handelerFactory');

// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// This CheckId was only used as a middleware to check for id when we were using the file as a data source this won't be needed when working with the mongodb database

// exports.checkID = (req, res, next, val) => {
//     console.log(`Tour id is: ${val}`);

//     if (req.params.id * 1 > tours.length) {
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Invalid ID',
//         });
//     }
//     next();
// };

exports.checkBody = (req, res, next, val) => {
    if (!req.body.name || !req.body.price) {
        return res.status(400).json({
            status: 'Fail',
            message: 'the body does not contain the name or price!',
        });
    }
    next();
};

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

/*
exports.getAllTours = catchAsync(async (req, res, next) => {
    // console.log(req.query);
    // (This will work only with strictquery turned to true) // let tours = await Tour.find(req.query);

    // const queryObj = { ...req.query };
    // const blocked = ['sort', 'page', 'limit', 'fields'];
    // blocked.forEach((el) => delete queryObj[el]);

    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (rp) => `$${rp}`);

    // let query = Tour.find(JSON.parse(queryStr));

    //Sorting
    // if (req.query.sort) {
    //     const sortBy = req.query.sort.split(',').join(' ');
    //     query = query.sort(sortBy);
    // } else {
    //     query = query.sort('-createdAt _id');
    // }

    //Field limiting
    // if (req.query.fields) {
    //     const fields = req.query.fields.split(',').join(' ');
    //     query = query.select(fields);
    // } else {
    //     query = query.select('-__v');
    // }

    //Pagination
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;

    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //     const numTours = await Tour.countDocuments();
    //     if (skip >= numTours) throw new Error("Page Dosen't exist");
    // }

    const features = new apiFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .fieldLimiting()
        .pagination();
    const tours = await features.query;

    res.status(200).json({
        status: 'Success',
        results: tours.length,
        data: {
            tours,
        },
    });
});
*/

/*
exports.getTourById = catchAsync(async (req, res, next) => {
    // console.log(req.params);
    // As we can see with this we get the id as a string so we'll first need to convert it into a number
    // const id = +req.params.id;
    // // console.log(id);
    // const tour = tours.find((el) => el.id === id);

    // // if (id <= tours.length) {
    // if (tour) {
    //     res.status(200).json({
    //         status: 'success',
    //         data: {
    //             tour,
    //         },
    //     });
    // }

    // The below will be used for DB and the above one was for the file

    const tourId = await Tour.findById(req.params.id).populate('reviews');

    if (!tourId) {
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tourId,
        },
    });
});
*/

/*
exports.addNewTour = catchAsync(async (req, res, next) => {
    // This is simply sending the req to the terminal we can add it to the file from where we are tying to mimic the database
    // console.log("You're req will be send to the terminal rn");
    // console.log(req.body);
    // const newID = tours[tours.length - 1].id + 1;
    // const newTour = Object.assign({ id: newID }, req.body);

    // // till now we have only accepeted the req from the client now we will push it into the database(write it into the file)
    // tours.push(newTour);

    // fs.writeFile(
    //     `${__dirname}/dev-data/data/tours-simple.json`,
    //     JSON.stringify(tours),
    //     (err) => {
    //         res.status(201).json({
    //             status: 'success',
    //             data: {
    //                 newTour,
    //             },
    //         });
    //     }
    // );

    // The below will be used for DB and the above one was for the file

    const tour = await Tour.create(req.body);

    res.status(200).json({
        status: 'success',
        data: {
            tour,
        },
    });
});
*/

// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id);

//     if (!tour) {
//         return next(new AppError('No tour found with that ID', 404));
//     }

//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour,
//         },
//     });
// });

exports.getAllTours = factory.getAll(Tour);
exports.getTourById = factory.getOne(Tour, { path: 'reviews' });
exports.addNewTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

//Delete Method
/*
app.delete("api/v1/tours/:id", (req, res) => {
    const id = +req.params.id;
    const checkId = data.find((c) => c.id === id);
    if (!checkId) res.status(404).json({ status: "failed" });
    let remainingData = newData.filter((c) => c.id !== checkId.id);
    fs.writeFile("data.json", JSON.stringify(remainingData), () =>
        res.status(204).json({ status: "success", newData })
    );
    newData = remainingData;
});
*/

//self exp (gonna try for finding all treks with matching difficulty)
/*
app.get("/api/v1/tours/dif/:dif", (req, res) => {
    console.log(req.params);
    const difficulty = req.params.dif;
    console.log(difficulty);

    const level = tours.filter((el) => el.difficulty === difficulty);

    res.status(200).json({
        status: "success",
        data: {
            level,
        },
    });
});
*/

/////////////////////////////////////////////////////////////////////////
///////////////////(MONGODB AGGERATION PIPELINE) ////////////////////////
/////////////////////////////////////////////////////////////////////////

exports.aggerationTrial = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                _id: '$difficulty',
                avgRating: { $avg: '$ratingsAverage' },
                avgDuration: { $avg: '$duration' },
                numTours: { $sum: 1 },
                maxPrice: { $max: '$price' },
                minPrice: { $min: '$price' },
                avgPrice: { $avg: '$price' },
            },
        },
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats,
        },
    });
});

exports.realProb = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const prob = await Tour.aggregate([
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
        // {
        //     $group: { startDates: { $eq: year } },
        // },
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            prob,
        },
    });
});

// GeoSpatial Query
// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi

exports.getTourWithIn = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        next(new AppError('Please provide the latitude ad longitude.', 400));
    }

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
            data: tours,
        },
    });
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
        next(
            new AppError(
                'Please provide latitutr and longitude in the format lat,lng.',
                400
            )
        );
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1],
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier,
            },
        },
        {
            $project: {
                distance: 1,
                name: 1,
            },
        },
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances,
        },
    });
});
