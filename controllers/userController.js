const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};

    // Object.keys will be looping through an object in javascript and return an array of keys of the object.
    Object.keys(obj).forEach(fieldName => {
        if (allowedFields.includes(fieldName)) newObj[fieldName] = obj[fieldName];
    });

    return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTS password data
    if (req.body.password || req.body.passwordConfirm) return next(
        new AppError('This route is not for password updates. Please use /updateMyPassword', 400)
    );

    // 2) Update user document
    // Only take the the specified property strings. Filter out other fields. 
    // So users can only change their email username and pfpUrl using the updateMe route
    const filteredBody = filterObj(req.body, 'email', 'username', 'pfpUrl');
    
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true, // Setting this to new will make this function return the updated object instead of the old one.
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async (req, res) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);