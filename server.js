const mongoose = require('mongoose');

// These 2 lines of code should be in the top cuz app can only access dotenv if it is already configured.
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

dotenv.config({
    path: './config.env'
});

// This only happen once, other files can access the env variables cuz we are in the same process.
dotenv.config({
    path: './config.env'
});

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
    .then(() => console.log('DB connection successful!'));

const app = require('./app');


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

// SOCKET.IO - START - (Test version)
const {
    Server
} = require('socket.io');
const User = require('./models/userModel'); // <-- Import your User model
const Message = require('./models/messageModel');

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Temporary in-memory tracker for online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('🟢 A user connected:', socket.id);

    // User comes online
    socket.on('user-online', async (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log(`✅ User ${userId} is now ONLINE`);

        try {
            await User.findByIdAndUpdate(userId, {
                activeStatus: 'online'
            });
        } catch (err) {
            console.error('Error updating user to online:', err.message);
        }
    });

    socket.on('private-message', async ({
        senderId,
        receiverId,
        text
    }) => {
        // 1) Check if sender and receiver are friends
        const sender = await User.findById(senderId);
        if (!sender.friends.includes(receiverId)) return;

        // 2) Save message in DB
        const message = await Message.create({
            senderId,
            receiverId,
            text
        });

        // 3) Send message to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);

        console.log(`Message from ${sender.username} to ${receiverId}: ${text}`);

        if (receiverSocketId)
            io.to(receiverSocketId).emit('receive-message', {
                senderId,
                text,
                
            });
    });

    // User manually goes offline
    socket.on('user-offline', async (userId) => {
        console.log(`🔴 User ${userId} went OFFLINE`);
        onlineUsers.delete(socket.id);

        try {
            await User.findByIdAndUpdate(userId, {
                activeStatus: 'offline'
            });
        } catch (err) {
            console.error('Error updating user to offline:', err.message);
        }
    });

    // When they disconnect
    socket.on('disconnect', async () => {
        const userId = onlineUsers.get(socket.id);
        if (userId) {
            console.log(`⚠️ User ${userId} disconnected`);
            onlineUsers.delete(socket.id);

            try {
                await User.findByIdAndUpdate(userId, {
                    activeStatus: 'offline'
                });
            } catch (err) {
                console.error('Error marking user offline:', err.message);
            }
        }
    });
});
// SOCKET.IO - END - TEST

// In unhandledRejection, crashing the application is OPTIONAL.
process.on('unhandledRejection', err => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);

    // Close the server first. This will finish all the pending requests and then shut down.
    server.close(() => {
        // paramt = 0 if success and 1 if uncaught exception.
        // The app will crash due to the process.exit which is destructive to currently running or pending requests which is a problem.
        // The solution is to first close the server and only then we shut down the application.
        process.exit(1);
    });
});