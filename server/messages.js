const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    username: String,
    text: String,
    createdAt: { type: Date, default: Date.now, expires: '1d' } // Automatically delete after 1 day
});

module.exports = mongoose.model('Message', messageSchema);