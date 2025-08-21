# 🤖 AI Chatbot Application

🕊️https://chat-bro.onrender.com

A modern, feature-rich chatbot application built with Express.js, EJS templating, and CSS that supports multiple AI models including OpenAI, Anthropic, Google Gemini, and Cohere.

## ✨ Features

- **Multiple AI Model Support**: Connect to OpenAI GPT, Anthropic Claude, Google Gemini, and Cohere
- **Secure API Key Management**: Easy configuration and management of API keys
- **Real-time Chat Interface**: Interactive chat with typing indicators and message history
- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Keyboard Shortcuts**: Enhanced productivity with keyboard navigation
- **Chat Export**: Export conversation history as text files
- **Mobile Responsive**: Works seamlessly on all device sizes
- **Real-time Validation**: Input validation and error handling

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- API keys for the AI models you want to use

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd ai-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Development Mode

For development with auto-reload:
```bash
npm run dev
```

## 🔑 API Key Setup

### Getting API Keys

1. **OpenAI**: Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Anthropic**: Visit [Anthropic Console](https://console.anthropic.com/)
3. **Google**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
4. **Cohere**: Visit [Cohere Dashboard](https://dashboard.cohere.ai/api-keys)

### Configuring API Keys

1. Go to the **Settings** page in the application
2. Enter your API keys in the respective fields
3. Click **Save API Keys**
4. Navigate to the **Chat** page to start using the configured models

## 📱 Usage

### Home Page
- Overview of available AI models
- Status of API key configuration
- Quick navigation to different sections

### Settings Page
- Configure API keys for different AI models
- Real-time validation and feedback
- Show/hide password functionality
- Copy to clipboard support

### Chat Page
- Select an AI model from the dropdown
- Type your message and press Enter to send
- View real-time responses from AI models
- Clear chat history or export conversations

## ⌨️ Keyboard Shortcuts

- **Ctrl/Cmd + K**: Focus on input field
- **Ctrl/Cmd + S**: Save settings (on settings page)
- **Ctrl/Cmd + L**: Clear chat history
- **Ctrl/Cmd + E**: Export chat
- **Ctrl/Cmd + F**: Search messages
- **F3**: Find next search result
- **Escape**: Clear focus or close modals

## 🏗️ Project Structure

```
ai-chatbot/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── views/                 # EJS template files
│   ├── index.ejs         # Home page
│   ├── chat.ejs          # Chat interface
│   └── settings.ejs      # Settings page
├── public/                # Static assets
│   ├── css/
│   │   └── style.css     # Main stylesheet
│   └── js/
│       ├── main.js       # General functionality
│       ├── settings.js   # Settings page logic
│       └── chat.js       # Chat functionality
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory for production settings:

```env
PORT=3000
NODE_ENV=production
```

### Customizing AI Models

To add or modify AI models, edit the `server.js` file:

1. Add new model to the `apiKeys` object
2. Create a new API function (e.g., `callNewModel`)
3. Add the case in the chat API route
4. Update the frontend templates and JavaScript

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🛠️ API Endpoints

### GET Routes
- `/` - Home page
- `/chat` - Chat interface
- `/settings` - Settings page

### POST Routes
- `/api/update-keys` - Update API keys
- `/api/chat` - Send message to AI model

## 🔒 Security Considerations

- API keys are stored in memory (not persistent)
- For production, consider using environment variables or a secure database
- Implement rate limiting for production use
- Add authentication if needed
- Use HTTPS in production

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the port in `server.js` or kill the process using the port

2. **API key errors**
   - Verify your API keys are correct
   - Check if you have sufficient credits/quota
   - Ensure the API service is accessible

3. **CORS issues**
   - The application includes CORS middleware
   - Adjust CORS settings in `server.js` if needed

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=* npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with Express.js, EJS, and modern web technologies
- Inspired by modern chatbot interfaces
- Uses various AI model APIs for intelligent responses

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section
2. Review the console logs for errors
3. Ensure all dependencies are properly installed
4. Verify your API keys are valid and have sufficient quota

---

**Happy Chatting! 🤖💬**
