const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const OPENAI_API_KEY = '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';
const TELEGRAM_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
const CHAT_ID = 'YOUR_CHAT_ID';

// Serve static files
app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    console.log('New user connected');

    // Listen for user messages
    socket.on('userMessage', async (message) => {
        console.log('User Message: ', message);

        // Determine the bot response based on user input
        let aiResponse;
        if (message.toLowerCase().includes('subscribe')) {
            aiResponse = 'Choose your plan: 3Days=$25 | 1Week=$150';
        } else if (message.toLowerCase().includes('choose country proxy')) {
            aiResponse = 'Select a country from the dropdown to filter proxies.';
        } else {
            aiResponse = await fetchOpenAIResponse(message);
        }

        // Send response back to user
        socket.emit('botMessage', aiResponse);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Function to get OpenAI response
async function fetchOpenAIResponse(message) {
    const response = await axios.post('https://api.openai.com/v1/completions', {
        model: 'text-davinci-003',
        prompt: message,
        max_tokens: 100
    }, {
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
    });

    return response.data.choices[0].text.trim();
}

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});