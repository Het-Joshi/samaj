const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Message = require('./messages'); // Import the message model
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to MongoDB
mongoose.connect('mongodb://localhost/chatroom', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let activeUsers = [];

io.on('connection', (socket) => {

    socket.on('join', (username) => {
        // Check if the username is already taken
        if (activeUsers.includes(username)) {
            socket.emit('username taken', 'This username is already taken. Please choose another one.');
            return;
        }
        socket.username = username; // Store the username in the socket
        activeUsers.push(username);
        io.emit('activeUsers', activeUsers);
        // Load messages from the database in reverse order
        Message.find().sort({ createdAt: 1 }).limit(50).then(messages => {
            socket.emit('loadMessages', messages);
        });
        socket.emit('user joined');
        // Notify others that a new user has joined
        socket.broadcast.emit('user joined', username);
    });

    socket.on('message', async (msg) => {
        const message = new Message({ username: socket.username, text: msg });
        await message.save(); // Save the message to the database
        io.emit('message', message);
    });

    socket.on('clearMessages', async () => {
        await Message.deleteMany({}); // Clear all messages from the database
        console.log('Admin cleared all messages'); // Log the action
        io.emit('clearMessages'); // Notify all clients to clear their message display
    });

    socket.on('disconnect', () => {
        activeUsers = activeUsers.filter(user => user !== socket.username);
        socket.broadcast.emit('user left', socket.username);
        io.emit('activeUsers', activeUsers);
    });
});

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// Set custom header for all responses
app.use((req, res, next) => {
    res.set('ngrok-skip-browser-warning', 'true'); // Set custom header
    next(); // Move to the next middleware or route handler
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
