const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const OPENAI_API_KEY = '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';
const TELEGRAM_TOKEN = '7087439078:AAHJ94YpC_O1MmlxnieYUcFTdvcFDSIB0D4';
const CHAT_ID = '2074391753'; // Replace with your Telegram Chat ID
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Serve static files
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // for parsing application/json

io.on('connection', (socket) => {
    console.log('New user connected');
    
    // Notify admin via Telegram when a user connects
    sendTelegramMessage('New user connected to ProxyBot.');

    // Listen for user messages
    socket.on('userMessage', async (message) => {
        console.log('User Message: ', message);

        // Determine bot response
        let aiResponse;
        if (message.toLowerCase().includes('subscribe')) {
            aiResponse = 'Choose your plan: 3Days=$25 | 1Week=$150. To proceed, type "subscribe 3days" or "subscribe 1week".';
        } else if (message.toLowerCase().includes('subscribe 3days')) {
            aiResponse = 'Thank you for choosing the 3-day plan. Please make your payment here: [PAYMENT_LINK]';
            sendTelegramMessage('User has subscribed to the 3-day plan.');
        } else if (message.toLowerCase().includes('subscribe 1week')) {
            aiResponse = 'Thank you for choosing the 1-week plan. Please make your payment here: [PAYMENT_LINK]';
            sendTelegramMessage('User has subscribed to the 1-week plan.');
        } else if (message.toLowerCase().includes('choose country proxy')) {
            aiResponse = 'Please select a country from the following list: USA, UK, Germany, Canada. Type "proxy USA" for example.';
        } else if (message.toLowerCase().startsWith('proxy ')) {
            const country = message.split(' ')[1];
            const proxyList = await getProxiesByCountry(country);
            aiResponse = proxyList ? `Here are the proxies for ${country}: ${proxyList}` : `No proxies found for ${country}`;
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
    try {
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
    } catch (error) {
        console.error('Error fetching OpenAI response:', error);
        return 'I encountered an error. Please try again later.';
    }
}

// Function to fetch proxies based on country
async function getProxiesByCountry(country) {
    const countryProxies = {
        USA: ['192.168.1.1:8080', '192.168.1.2:8080'],
        UK: ['192.168.1.3:8080', '192.168.1.4:8080'],
        Germany: ['192.168.1.5:8080', '192.168.1.6:8080'],
        Canada: ['192.168.1.7:8080', '192.168.1.8:8080']
    };
    return countryProxies[country] ? countryProxies[country].join(', ') : null;
}

// Function to send Telegram message
function sendTelegramMessage(text) {
    bot.sendMessage(CHAT_ID, text)
        .then(() => {
            console.log('Telegram notification sent.');
        })
        .catch((err) => {
            console.error('Error sending Telegram message:', err);
        });
}

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
