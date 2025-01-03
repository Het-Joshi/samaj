const socket = io();
let isAdmin = false;

// Dark Mode Toggle
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Load saved dark mode preference
if (localStorage.getItem('dark-mode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '☀️'; // Sun icon for light mode
}

// Toggle dark mode
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('dark-mode', isDarkMode ? 'enabled' : 'disabled');
});

// Initially disable message input and send button
toggleMessageInputs(false);

// Join chat
document.getElementById('join-btn').onclick = () => {
    const username = document.getElementById('username').value.trim();
    if (username) {
        socket.emit('join', username);
        toggleJoinInputs(false); // Disable username and join button
        if (username.toLowerCase() === 'admin') {
            isAdmin = true;
            document.getElementById('clear-btn').style.display = 'block'; // Show clear button for admin
        } else {
            document.getElementById('clear-btn').style.display = 'none'; // Hide clear button for non-admins
        }
    } else {
        alert('Please enter a username to join the chat.');
    }
};

// Handle username taken event
socket.on('username taken', (message) => {
    alert(message); // Notify user if username is taken
    toggleJoinInputs(true); // Re-enable join inputs
});

// Enable messaging after joining
socket.on('user joined', () => {
    toggleMessageInputs(true); // Enable message input and send button
});

// Send message logic
document.getElementById('send-btn').onclick = () => {
    sendMessage();
};

// Send message on Enter key
document.getElementById('message').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// Function to send messages
function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value.trim();
    
    if (message) {
        socket.emit('message', message);
        messageInput.value = ''; // Clear input after sending
    } else {
        alert('Message cannot be empty.');
    }
}

// Clear Messages
document.getElementById('clear-btn').onclick = () => {
    if (confirm('Are you sure you want to clear all messages?')) {
        socket.emit('clearMessages');
        alert('All messages have been cleared.');
    }
};

// Socket Events
socket.on('activeUsers', (users) => {
    document.getElementById('active-users').innerHTML =
        `<strong>Active Users:</strong><br>${users.join('<br>')}`;
});

// Load existing messages
socket.on('loadMessages', (messages) => {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = ''; // Clear current messages
    messages.forEach((msg) => {
        appendMessage(msg.username, msg.text);
    });
});

const colors = [
    '#FF5733', // Red
    '#33FF57', // Green
    '#3357FF', // Blue
    '#F1C40F', // Yellow
    '#8E44AD', // Purple
    '#E67E22', // Orange
    '#2ECC71', // Emerald
    '#3498DB', // Peter River
    '#9B59B6', // Amethyst
    '#E74C3C'  // Alizarin
];

const usernameColors = {}; // Object to store colors for each username

function getColorForUsername(username) {
    // If the username already has a color, return it
    if (usernameColors[username]) {
        return usernameColors[username];
    }

    // Otherwise, assign a random color
    let randomColor;
    do {
        randomColor = colors[Math.floor(Math.random() * colors.length)];
    } while (Object.values(usernameColors).includes(randomColor)); // Ensure the color is unique

    usernameColors[username] = randomColor; // Store the color for the username
    return randomColor;
}

// Append new message
socket.on('message', (msg) => appendMessage(msg.username, msg.text));

function appendMessage(username, text) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('div');
    
    // Create a span element for the username
    const usernameElement = document.createElement('span');
    usernameElement.textContent = username; // Set the username text
    usernameElement.style.color = getColorForUsername(username); // Get the color for the username
    usernameElement.style.fontWeight = 'bold'; // Make the username bold

    // Create a text node for the message text
    const messageText = document.createTextNode(`: ${text}`);

    // Append the username and message text to the message element
    messageElement.appendChild(usernameElement);
    messageElement.appendChild(messageText);
    
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to the bottom
}

// Clear all messages
socket.on('clearMessages', () => {
    document.getElementById('messages').innerHTML = '';
});

// Notify user join/leave
socket.on('user joined', (username) => appendNotification(`${username} has joined the chat.`, 'join'));
socket.on('user left', (username) => appendNotification(`${username} has left the chat.`, 'leave'));

function appendNotification(message, type) {
    const messagesDiv = document.getElementById('messages');
    const notification = document.createElement('div');
    notification.textContent = message;

    // Apply the appropriate class based on the type
    if (type === 'join') {
        notification.classList.add('notification', 'join'); // Add both classes
    } else if (type === 'leave') {
        notification.classList.add('notification', 'leave'); // Add both classes
    }

    messagesDiv.appendChild(notification);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to the bottom
}

// Helper functions
function toggleJoinInputs(enable) {
    document.getElementById('username').disabled = !enable;
    document.getElementById('join-btn').disabled = !enable;
}

function toggleMessageInputs(enable) {
    document.getElementById('message').disabled = !enable;
    document.getElementById('send-btn').disabled = !enable;
}

// Ensure username input is always visible
function showUsernameInput() {
    const usernameInputContainer = document.getElementById('username-container');
    usernameInputContainer.style.display = 'block'; // Show username input
}
document.getElementById('hamburger-menu').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('active');
});

document.getElementById('close-menu').addEventListener('click', function() {
    document.getElementById('sidebar').classList.remove('active');
});

// Check if username is defined before allowing message sending
document.getElementById('message').addEventListener('input', () => {
    const username = document.getElementById('username').value.trim();
    const messageInput = document.getElementById('message');
    const sendButton = document.getElementById('send-btn');
    
    if (!username) {
        messageInput.disabled = true; // Disable message input
        sendButton.disabled = true; // Disable send button
    } else {
        messageInput.disabled = false; // Enable message input
        sendButton.disabled = false; // Enable send button
    }
});