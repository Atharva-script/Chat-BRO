const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// In-memory storage for API keys (in production, use a database)
let apiKeys = {
    openai: '',
    anthropic: '',
    google: '',
    cohere: ''
};

// Routes
app.get('/', (req, res) => {
    res.render('index', { apiKeys });
});

app.get('/chat', (req, res) => {
    res.render('chat', { apiKeys });
});

app.get('/settings', (req, res) => {
    res.render('settings', { apiKeys });
});

// API Routes
app.post('/api/update-keys', (req, res) => {
    console.log('Updating API keys:', req.body);
    const { openai, anthropic, google, cohere } = req.body;
    
    if (openai) apiKeys.openai = openai;
    if (anthropic) apiKeys.anthropic = anthropic;
    if (google) apiKeys.google = google;
    if (cohere) apiKeys.cohere = cohere;
    
    console.log('Updated API keys:', apiKeys);
    res.json({ success: true, message: 'API keys updated successfully' });
});

app.post('/api/chat', async (req, res) => {
    console.log('Chat API called with:', req.body);
    
    try {
        const { message, model } = req.body;
        
        if (!message) {
            console.log('No message provided');
            return res.status(400).json({ error: 'Message is required' });
        }
        
        if (!model) {
            console.log('No model specified');
            return res.status(400).json({ error: 'Model is required' });
        }
        
        console.log(`Processing message for model: ${model}`);
        console.log(`Message: ${message}`);
        console.log(`API key available: ${apiKeys[model] ? 'Yes' : 'No'}`);
        
        let response;
        
        switch (model) {
            case 'openai':
                if (!apiKeys.openai) {
                    console.log('OpenAI API key not configured');
                    return res.status(400).json({ error: 'OpenAI API key not configured' });
                }
                console.log('Calling OpenAI API...');
                response = await callOpenAI(message, apiKeys.openai);
                break;
                
            case 'anthropic':
                if (!apiKeys.anthropic) {
                    console.log('Anthropic API key not configured');
                    return res.status(400).json({ error: 'Anthropic API key not configured' });
                }
                console.log('Calling Anthropic API...');
                response = await callAnthropic(message, apiKeys.anthropic);
                break;
                
            case 'google':
                if (!apiKeys.google) {
                    console.log('Google API key not configured');
                    return res.status(400).json({ error: 'Google API key not configured' });
                }
                console.log('Calling Google API...');
                response = await callGoogle(message, apiKeys.google);
                break;
                
            case 'cohere':
                if (!apiKeys.cohere) {
                    console.log('Cohere API key not configured');
                    return res.status(400).json({ error: 'Cohere API key not configured' });
                }
                console.log('Calling Cohere API...');
                response = await callCohere(message, apiKeys.cohere);
                break;
                
            default:
                console.log(`Invalid model specified: ${model}`);
                return res.status(400).json({ error: 'Invalid model specified' });
        }
        
        console.log('AI Response received:', response);
        res.json({ response });
        
    } catch (error) {
        console.error('Chat API error:', error);
        res.status(500).json({ error: 'Failed to get response from AI model: ' + error.message });
    }
});

// AI Model API Functions
async function callOpenAI(message, apiKey) {
    try {
        console.log('Making OpenAI API request...');
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: message }],
            max_tokens: 150
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('OpenAI API response:', response.data);
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API error:', error.response?.data || error.message);
        throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
    }
}

async function callAnthropic(message, apiKey) {
    try {
        console.log('Making Anthropic API request...');
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: 'claude-3-haiku-20240307',
            max_tokens: 150,
            messages: [{ role: 'user', content: message }]
        }, {
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Anthropic API response:', response.data);
        return response.data.content[0].text;
    } catch (error) {
        console.error('Anthropic API error:', error.response?.data || error.message);
        throw new Error(`Anthropic API error: ${error.response?.data?.error?.message || error.message}`);
    }
}

async function callGoogle(message, apiKey) {
    try {
        console.log('Making Google API request...');
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            contents: [{
                parts: [{ text: message }]
            }]
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Google API response:', response.data);
        return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Google API error:', error.response?.data || error.message);
        throw new Error(`Google API error: ${error.response?.data?.error?.message || error.message}`);
    }
}

async function callCohere(message, apiKey) {
    try {
        console.log('Making Cohere API request...');
        const response = await axios.post('https://api.cohere.ai/v1/generate', {
            model: 'command',
            prompt: message,
            max_tokens: 150,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Cohere API response:', response.data);
        return response.data.generations[0].text;
    } catch (error) {
        console.error('Cohere API error:', error.response?.data || error.message);
        throw new Error(`Cohere API error: ${error.response?.data?.message || error.message}`);
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Available routes:');
    console.log('  GET  / - Home page');
    console.log('  GET  /chat - Chat interface');
    console.log('  GET  /settings - Settings page');
    console.log('  POST /api/update-keys - Update API keys');
    console.log('  POST /api/chat - Send message to AI model');
});
