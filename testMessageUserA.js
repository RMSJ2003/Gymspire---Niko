const io = require('socket.io-client');
const socket = io('http://localhost:3000');

const userId = '5c8a1d5b0190b214360dc060';
const friendId = '5c8a1d5b0190b214360dc059';

socket.on('connect', () => {
    console.log('Connected: ', socket.id);

    // Mark yourself online
    socket.emit('user-online', userId);

    // Send a private message
    socket.emit('private-message', { senderId: userId, receiverId: friendId, text: 'Hello User B!' });

    // Disconnect after 1m
    setTimeout(() => socket.disconnect(), 100000);
});

// This will be triggered by a code from server.js in the socket.io code
// You'll see there 'receive-message'
socket.on('receive-message', ({senderId, text, createdAt}) => {
    console.log(`New message from ${senderId}: ${text} at ${createdAt}`);
});