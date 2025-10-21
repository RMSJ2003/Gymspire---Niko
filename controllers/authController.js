const jwt = require('jsonwebtoken');
const User = require("../models/userModel");
const sendEmail = require('./../utils/email');

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
    0

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

exports.signup = async (req, res, next) => {
    const newUser = await User.create({
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    createSendToken(newUser, 201, res);
};

exports.login = async (req, res, next) => {
    const {
        email,
        password
    } = req.body;

    if (!email || !password) {
        console.error('Please provide email and password!');
        // Add error
    }

    const user = await User.findOne({
        email
    }).select('+password');

    if (!user || !await user.correctPassword(password, user.password)) {
        console.error('Incorrect email or password');
        // Add error
    }

    createSendToken(user, 200, res);
};

// CHANGING PASSWORD FUNCTIONALITIES - START

exports.forgotPassword = async (req, res, next) => {
    const user = await User.findOne({
        email: req.body.email
    });

    // FIX THIS - COPY THE ORIGNAL
    if (!user) {
        console.error('There is no user with that email.');
        return;
    }

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
};

// CHANGING PASSWORD FUNCTIONALITIES - END