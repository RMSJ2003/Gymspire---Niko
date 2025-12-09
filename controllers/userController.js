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

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id; // There is a authController.protect in the userRoutes so we still have access of ID in req.user
    next();
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
    await User.findByIdAndUpdate(req.user.id, {
        active: false
    });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.removeFriend = catchAsync(async (req, res, next) => {
    const friendId = req.params.friendId; // the friend to remove
    const userId = req.user.id; // the logged-in user

    // 1) Check if friendId exists
    const friend = await User.findById(friendId);
    console.log('Friend found:', friend);

    if (!friend) return next(
        new AppError('Friend not found', 404)
    );

    // 2) Remove friend from user's friend list
    const updatedUser = await User.findByIdAndUpdate(userId, {
        $pull: {
            friends: friendId
        }
    }, {
        new: true, // Setting this to new will make this function return the updated object instead of the old one.
    });

    // 3) Remove user from friend's friend list 
    await User.findByIdAndUpdate(friendId, {
        $pull: {
            friends: userId
        }
    });

    res.status(200).json({
        status: 'success',
        message: 'Friend removed successfully',
        data: {
            user: updatedUser
        }
    });
});

exports.sendFriendRequest = catchAsync(async (req, res, next) => {
    const senderId = req.user.id; // logged-in user
    const receiverId = req.params.friendId; // person to send the request to

    console.log('Sender ID: ', senderId);
    console.log('Receiver ID: ', receiverId);

    // 1) Prevent sending to self
    if (senderId === receiverId)
        return next(new AppError("You can't send a friend request to yourself.", 400));

    // 2) Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver)
        return next(new AppError('User not found', 404));

    // 3) Check if already friends
    const sender = await User.findById(senderId);
    if (sender.friends.includes(receiverId))
        return next(new AppError('You are already friends with this user.', 400));

    // 4) Check if already sent a friend request
    if (receiver.friendRequests.includes(senderId))
        return next(new AppError('Friend request already sent.', 400));

    // 5) Add the friend request to receiver's friendRequests array
    await User.findByIdAndUpdate(receiverId, {
        $push: {
            friendRequests: senderId
        }
    }, {
        new: true,
        runValidators: false
    }); // disable validators like passwordConfirm

    res.status(200).json({
        status: 'success',
        message: 'Friend request sent successfully.'
    });
});

exports.acceptFriendRequest = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const requesterId = req.params.requesterId;

    // 1) Find both users
    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    console.log(requester);

    if (!requester)
        return next(new AppError('Requester not found', 404));

    // 2) Check if the request exists
    if (!user.friendRequests.includes(requesterId))
        return next(new AppError('No friend request from this user.', 400));

    // 3) Update both users
    const updatedUser = await User.findByIdAndUpdate(userId, {
        $pull: {
            friendRequests: requesterId
        },
        $push: {
            friends: requesterId
        }
    }, {
        new: true,
        runValidators: false
    });

    await User.findByIdAndUpdate(requesterId, {
        $push: {
            friends: userId
        }
    }, {
        runValidators: false
    });

    res.status(200).json({
        status: 'success',
        message: 'Friend request accepted.',
        data: {
            user: updatedUser
        }
    })
});

exports.declineFriendRequest = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const requesterId = req.params.requesterId;

    const user = await User.findById(userId);

    if (!user.friendRequests.includes(requesterId))
        return next(new AppError('No friend request from this user.', 400));

    const updatedUser = await User.findByIdAndUpdate(userId, {
        $pull: {
            friendRequests: requesterId
        }
    }, {
        new: true,
        runValidators: false
    });

    res.status(200).json({
        status: 'success',
        message: 'Friend request declined.',
        data: {
            user: updatedUser
        }
    });
});

exports.getOnlineFriends = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate('friends');
    const onlineFriends = user.friends.filter(friend => friend.activeStatus === 'online');

    res.status(200).json({
        status: 'success',
        results: onlineFriends.length,
        data: {
            onlineFriends
        }
    });
});

exports.sendMessage = catchAsync(async (req, res, next) => {
    const senderId = req.user.id;
    const receiverId = req.params.friendId;
    const {
        text
    } = req.body;

    // Check if receiver exists 
    const receiver = await User.findById(receiverId);

    if (!receiver) return next(new AppError('User not found', 404));

    // Check friendship
    const sender = await User.findById(senderId);

    if (!sender.friends.includes(receiverId))
        return next(new AppError('You can only message your friends', 400));

    // Save message
    const message = await Message.create({
        senderId,
        receiverId,
        text
    });

    // Emit to friend if online (Socket.IO)
    if (req.io) {
        const receiverSocketId = req.io.onlineUsers.get(receiverId);

        if (receiverSocketId) {
            req.io.to(receiverSocketId).emit('receive-message', {
                senderId,
                text
            });
        }
    }

    res.status(201).json({
        status: 'success',
        data: {
            message
        }
    });
});

exports.getMessages = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const friendId = req.params.friendId;

    console.log('Current user: ', userId);
    console.log('Friend: ', friendId);
    
    const messages = await Message.find({
        $or: [{
                senderId: userId,
                receiverId: friendId
            },
            {
                senderId: friendId,
                receiverId: userId
            }
        ]
    }).sort('createdAt');

    res.status(200).json({
        status: 'success',
        results: messages.length,
        data: {
            messages
        }
    });
});

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);