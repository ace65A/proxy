const socket = io();

// Add event listener for Enter key
document.getElementById("user-input").addEventListener("keypress", function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Function to send a message
function sendMessage() {
    const inputBox = document.getElementById("user-input");
    const message = inputBox.value.trim();

    if (message) {
        addMessageToChat('You', message);
        inputBox.value = ''; // Clear the input field

        // Send message to the server
        socket.emit('userMessage', message);
    }
}

// Function to add a message to the chat box
function addMessageToChat(sender, message) {
    const chatBox = document.getElementById("chat-box");
    const newMessage = document.createElement('div');
    newMessage.classList.add('message');
    newMessage.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatBox.appendChild(newMessage);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom
}

// Listen for messages from the bot
socket.on('botMessage', (message) => {
    addMessageToChat('Bot', message);
});