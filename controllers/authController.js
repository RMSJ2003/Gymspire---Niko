const crypto = require('crypto');
const {
    promisify
} = require('util');
const jwt = require('jsonwebtoken');
const User = require("../models/userModel");
const sendEmail = require('./../utils/email');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = id => {
    // .sign(<payload>, <secret>, <options>)
    return jwt.sign({
        id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 100),
        httpOnly: true // The cookie can't be access or modified in anyway by the browser (important for xss attacks)
    };

    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};


exports.signup = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    // Validate iACADEMY email
    const allowedDomains = ['@iacademy.ph', '@iacademy.edu.ph'];
    const isValidEmail = allowedDomains.some(domain =>
        email.toLowerCase().endsWith(domain)
    );

    if (!isValidEmail) {
        return next(
            new AppError(
                'Only iACADEMY emails (@iacademy.ph or @iacademy.edu.ph) are allowed.',
                400
            )
        );
    }

    const newUser = await User.create({
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        username: req.body.username,
        pfpUrl: req.body.pfpUrl,
        userType: req.body.userType,
        quote: req.body.quote,
        beforeImgUrl: req.body.beforeImgUrl,
        beforeWeight: req.body.beforeWeight
    });

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const {
        email,
        password
    } = req.body;

    // 1) Checks if email and password exists
    if (!email || !password) return next(new AppError('Please provide email and password', 400));

    // 2) Check if the user exists && password is correct
    // If we want a field (password) that has select property set to false (in schema)
    // we add .select(+<name of field>)
    const user = await User.findOne({
        email
    }).select('+password');

    // user is an object .correctPassword is in the userModel.js (check for details)
    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect email or password', 401)); // 401 means unauthorized
    }

    createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check if it exists 
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]; // Getting the value of token cuz
        // the authorization looks like this:
        // Authorization: Bearer <token>
    }

    if (!token) return next(
        new AppError('Your are not logged in! Please log in to get access', 401)
    );

    // 2) Validate the token
    // Decoding the token
    // Promisifying .verify function 
    // The promisify(jwt.verify) part will promisify the jwt.verify
    // The (token, process.env.JWT_SECRET) part will call the promisified jwt.verify
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) return next(
        new AppError('The user belonging to this token does no longer exist.', 401)
    );

    // 4) Check if user changed password after the JWT (token) was issued
    // .iat means issued at, and .exp means (expire)(not used in this code)
    if (currentUser.changedPasswordAfter(decoded.iat)) return next(
        new AppError('User currently changed password! Please login again.', 401)
    );

    // Grant access to the protected route.
    req.user = currentUser;
    next();
});

// CHANGING PASSWORD FUNCTIONALITIES - START

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({
        email: req.body.email
    });

    if (!user) return next(
        new AppError('There is no user with that email address.', 404)
    );

    const resetToken = user.createPasswordResetToken();

    // We edited certain values from the user doc using the createPasswordResetToken function.
    await user.save({
        validateBeforeSave: false
    });

    // req.protocol is https/http
    // In here we will send the original reset token, not the encrypted one
    // const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}\n
    // If you didn't forget your password, please ignore this email!`;

    // // try {

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`; // In here we will send the original reset token, not the encrypted one

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.
    \nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        });

        // We can't send the resetToken here it's dangerous - anyone can see it
        // We send it via email cuz email is safe
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (err) {
        user.createPasswordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({
            validateBeforeSave: false
        });

        // Fix Error
        // return next(new AppError('There was an error sending an email. Try again later!', 500));
        return;
        // return apperror
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the given token
    // req.params come from the URL

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {
            $gt: Date.now()
        }
    });

    // 2} If token has not expired, and there is a user, set the new password.
    if (!user) next(new AppError('Token is invalid or has expired', 400));

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    // Since we already updated the password, we can now remove the rest token fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    createSendToken(user, 200, res);
});

// CHANGING PASSWORD FUNCTIONALITIES - END