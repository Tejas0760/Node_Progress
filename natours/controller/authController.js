const catchAsync = require('../utils/catchAsync');
const crypto = require('crypto');
const User = require('./../model/userModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('./../utils/appError');
const sendEmail = require('../utils/SendEmail');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.SECERT, {
        expiresIn: process.env.EXPIRES_IN,
    });
};

const createAndSendToken = (currentUser, statusCode, res) => {
    const token = signToken(currentUser._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    //Doing this because we don't want to send the password in the response during the creation of document
    currentUser.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        body: {
            currentUser,
        },
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    createAndSendToken(newUser, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //check for email n pass (they are in the req or not)
    if (!email || !password) {
        return next(
            new AppError('Please provide a valid email or password', 400)
        );
    }

    //check if the email and the pass is correct
    const newUser = await User.findOne({ email }).select('+password');
    if (
        !newUser ||
        !(await newUser.correctPassword(password, newUser.password))
    ) {
        return next(new AppError('Incorrect email or password!', 401));
    }

    //if correct then return the token to the client
    createAndSendToken(newUser, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;

    // console.log(req.cookies.jwt);
    //firstly check for header (because in their there will be JWT token)
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    // console.log(token);

    //if token is present
    if (!token) {
        return next(
            new AppError(
                'You are not logged in, Please login to continue further'
            )
        );
    }

    //verify the token
    const decode = await promisify(jwt.verify)(token, process.env.SECERT);
    // console.log(decode);

    //check if user is still present
    const oldUser = await User.findById(decode.id);
    if (!oldUser) {
        return next(
            new AppError('The user belonging to this token does not exist', 401)
        );
    }

    //check if user changed the password after token was issued
    if (oldUser.changedPasswordAfter(decode.iat)) {
        return next(
            new AppError(
                'User recently changed password, login again to continue'
            )
        );
    }

    /************************************  NOTE ****************************************/
    //   HERE WHATEVER YOU PASS WILL BE PASSED ONTO THE NEXT ROUTE IN THE ROUTE HANDELER
    //   MTLB AGAR TUNE (User) paas kra toh usko next handeler mai (User) se he access hoga (user) se nhi
    //   MTLB req.User toh access User se milega, if req.user toh access user se milega (***  Warna undefined error ***)
    //   case sensitive hai ye cheez 3 ghante barbaad kre iss bug ko dhundne mai

    req.user = oldUser;
    // console.log((req.User = oldUser));
    next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // 1) verify token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            // 2) Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // 3) Check if user changed password after the token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // THERE IS A LOGGED IN USER
            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    `You don't have the permission to perform this action!`
                )
            );
        }
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //find user
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(
            new AppError(
                'No user by that email found, Please enter valid email!'
            )
        );
    }

    //create a update token not to much crypted
    const resetToken = user.createResetPassowordToken();
    await user.save({ validateBeforeSave: false });

    //send it to user email
    //this should be in a try catch block because if something ges wrong we should resert the token and token expire to undefined so they can not be used further
    try {
        //reset url to be used by user
        const resetUrl = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/user/resetPassword/${resetToken}`;

        //message to be send in that email
        const message = `Follow the link to reset your password: ${resetUrl}, if you didn't forgot your password please ignore this message`;

        await sendEmail({
            // here keep the key name as user
            user: user.email,
            subject: `Password Reset link(valid for 10 mins only)`,
            message,
        });

        res.status(200).json({
            status: 'success',
            message: `reset link send to your email!`,
        });
    } catch (err) {
        (user.passwordResetToken = undefined),
            (user.passwordResetExpires = undefined),
            await user.save({ validateBeforeSave: false });

        return next(
            new AppError(
                'Failed to send the email, Please try again later',
                500
            )
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //first find the user by the help of the token only
    const tokenDecode = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    //then veryify the token
    const user = await User.findOne({
        passwordResetToken: tokenDecode,
        passwordResetExpires: { $gt: Date.now() },
    });

    // if token not expired then reset password
    if (!user) {
        return next(new AppError('Token is invalid or expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    //singin the user and update the passwordchangedat property
    createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // fetch the user
    // Don't user findone here because the update route is only for logged in user so find them by id
    // const user = await User.findOne({ email: req.body.email });

    // console.log(req.user);
    const user = await User.findById(req.user.id).select('+password');
    // console.log(req.user.id);

    // check the current pass
    if (
        !(await user.correctPassword(req.body.currentPassword, user.password))
    ) {
        return next(
            new AppError('Your current password is wrong check again!', 401)
        );
    }

    // if so update the user password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // log the user in
    createAndSendToken(user, 200, res);
});
