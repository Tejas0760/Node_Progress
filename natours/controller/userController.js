const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handelerFactory');

const userObj = (body, ...names) => {
    const newObj = {};
    Object.keys(body).forEach((el) => {
        if (names.includes(el)) newObj[el] = body[el];
    });
    return newObj;
};

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined!, use /signup',
    });
};
exports.updateMe = catchAsync(async (req, res, next) => {
    //check if the req contains any password variable
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for changing password use the appropriate route for that',
                401
            )
        );
    }

    const changesAllowed = userObj(req.body, 'name', 'email');

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        changesAllowed,
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json({
        status: 'success',
        data: {
            updatedUser,
        },
    });
});

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);

// ****************** REMEMBER (DO NOT USE THIS ROUTE FOR UPDATING THE PASSWORD AS THE SAVE AND CREATE FUNCTION DOES NOT WORK WITH THIS)
exports.updateUser = factory.updateOne(User);

//will not actually delete the document but will make it false
exports.deleteMe = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});
