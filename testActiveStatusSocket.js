const io = require('socket.io-client');
const socket = io('http://localhost:3000'); // server URL

const userId = '5c8a1d5b0190b214360dc060'; // The value is just an example

socket.on('connect', () => {
    console.log('Connected with id: ', socket.id);

    // Trigger user-online
    socket.emit('user-online', userId);

    // OPTIONAL: disconnect after 10 seconds
    setTimeout(() => {
        socket.disconnect();
    }, 10000);
}); 

socket.on('disconnect', () => {
    console.log('Disconnected from server')
});