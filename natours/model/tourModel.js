const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');

//A Little side note even if you define the id in the model of the object it will still override it and make a new id named as _id and will fill it with a id value
const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A Tour must have a name'],
            unique: true,
            trim: true,
            maxlength: [
                40,
                'A tour name must have less or equal then 40 characters',
            ],
            minlength: [
                10,
                'A tour name must have more or equal then 10 characters',
            ],
            // validate: [validator.isAlpha, 'Tour name must only contain characters']
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            Number,
            required: [true, 'A Tour must have a max group size'],
        },
        difficulty: {
            type: String,
            required: [true, 'A Tour must have a Difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either: easy, medium, difficult',
            },
        },
        price: {
            type: Number,
            required: [true, 'A Tour must have a price'],
            unique: false,
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    // this only points to current doc on NEW document creation
                    return val < this.price;
                },
                message:
                    'Discount price ({VALUE}) should be below regular price',
            },
        },
        ratingsAverage: {
            type: Number,
            // required: [false],
            // unique: false,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
            set: (value) => Math.round(value * 10) / 10, // 4.6666666 = 47 = 4.7
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        summary: {
            type: String,
            required: [true, 'A Tour must have a summary'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'A Tour must have a description'],
        },
        startLocation: {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        imageCover: {
            type: String,
            require: [true, 'A Tour must have a imagecover'],
        },
        images: {
            type: [String],
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },
        startDates: {
            type: [Date],
        },
        secretTour: {
            type: Boolean,
            default: false,
        },
        //INSTEAD OF EMBEDDING WE WILL USE REFERENCING
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: User,
            },
        ],
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

//virtual fields to populate the reviews in the tour model but not storing them into the database because it will grow indefinately
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id',
});

//Can Set INDEX to imporve the performace of the application
// but to set the index you must firstly look into the most queryed field in your application (** Because the indexes take up a lot more space in our database **), also its not a good idea to set indexes into a database which has a high read - write ratio, its best to set indexes if the data is only read or is read more than its being written
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// USING POPULATE TO REFERENCE THE DATA

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt',
    });
    next();
});

// EMBEDDING THE USERS INTO THE TOURS

// tourSchema.pre('save', async function (next) {
//     const guidePromises = this.guides.map(
//         async (id) => await User.findById(id)
//     );
//     this.guides = await Promise.all(guidePromises);
//     next();
// });

// tourSchema.pre('save', function(next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });

    this.start = Date.now();
    next();
});

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    next();
});

// AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//     console.log(this.pipeline());
//     next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
