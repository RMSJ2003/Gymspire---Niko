const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A message must have a sender.']
    },
    receiverId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A message must have a receiver.']
    },
    text: {
        type: String,   
        required: [true, 'A message must have a text.']
    }, 
    createdAt: {
        type: Date, 
        default: Date.now
    }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;