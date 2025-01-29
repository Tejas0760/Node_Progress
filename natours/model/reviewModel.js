const mongoose = require('mongoose');
const Tour = require('./tourModel');
const User = require('./userModel');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'A Review can not be empty!'],
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: Tour,
            required: [true, 'Review must belong to a tour'],
        },

        user: {
            type: mongoose.Schema.ObjectId,
            ref: User,
            required: [true, 'Review must belong to a valid user'],
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// using index and making the tour n user combination unique as true so the user can only put 1 review on 1 tour not more than 1
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//parent child referencing (parent: review, child: tour,user)
reviewSchema.pre(/^find/, function (next) {
    // this.populate({
    //     path: 'tour',
    //     select: 'name',
    // }).populate({
    //     path: 'user',
    //     select: 'name photo',
    // });

    this.populate({
        path: 'user',
        select: 'name photo',
    });
    next();
});

// A static function to calculate the ratingsAverage and then store it into the database
reviewSchema.statics.calcAverageRating = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId },
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);
    console.log(stats);

    //now save these stats into the db
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating,
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5,
        });
    }
};

reviewSchema.post('save', function () {
    this.constructor.calcAverageRating(this.tour);
});

//now we will also have to handel the update and delete on the reviews
// findByIdAndDelete
// findByIdAndUpdate

reviewSchema.post(/^findOneAnd/, async function (doc) {
    //Here we will not get access to the query (this.findOne()), query has already executed
    if (doc) await doc.constructor.calcAverageRating(doc.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
