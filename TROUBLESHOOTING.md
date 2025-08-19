# 🔧 Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. **Messages Not Being Sent**

**Symptoms:**
- Clicking send button does nothing
- Enter key doesn't work
- No error messages appear

**Possible Causes & Solutions:**

#### A. No AI Model Selected
- **Check:** Look at the model selector dropdown above the chat
- **Solution:** Select an AI model from the dropdown
- **Note:** You must configure API keys first in the Settings page

#### B. API Keys Not Configured
- **Check:** Go to Settings page and see if any models show "✓ Configured"
- **Solution:** Add your API keys in the Settings page
- **How to get API keys:**
  - OpenAI: [OpenAI Platform](https://platform.openai.com/api-keys)
  - Anthropic: [Anthropic Console](https://console.anthropic.com/)
  - Google: [Google AI Studio](https://makersuite.google.com/app/apikey)
  - Cohere: [Cohere Dashboard](https://dashboard.cohere.ai/api-keys)

#### C. Send Button Disabled
- **Check:** Look at the send button - is it grayed out?
- **Causes:**
  - No text in input field
  - No model selected
  - AI is currently processing a message
- **Solution:** Fill in the message and select a model

### 2. **Backend Connection Issues**

**Symptoms:**
- Error messages about API calls
- Messages not reaching the server
- Console shows connection errors

**Solutions:**

#### A. Server Not Running
```bash
# Check if server is running
npm start

# Or for development
npm run dev
```

#### B. Port Already in Use
```bash
# Kill process using port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process using port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9
```

#### C. Test Backend Functionality
```bash
# Run the test script
node test-backend.js
```

### 3. **Frontend Issues**

**Symptoms:**
- Page doesn't load properly
- JavaScript errors in console
- UI elements missing

**Solutions:**

#### A. Check Browser Console
- Press F12 to open Developer Tools
- Look for red error messages in Console tab
- Check for missing files in Network tab

#### B. Clear Browser Cache
- Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache and cookies

#### C. Check File Structure
Ensure your project has this structure:
```
ai-chatbot/
├── server.js
├── package.json
├── views/
│   ├── index.ejs
│   ├── chat.ejs
│   └── settings.ejs
├── public/
│   ├── css/style.css
│   └── js/
│       ├── main.js
│       ├── settings.js
│       └── chat.js
└── README.md
```

### 4. **API Key Issues**

**Symptoms:**
- "API key not configured" errors
- "Invalid API key" errors
- Models show as unavailable

**Solutions:**

#### A. Verify API Key Format
- **OpenAI:** Should start with `sk-`
- **Anthropic:** Should start with `sk-ant-`
- **Google:** Should start with `AIza`
- **Cohere:** Variable format

#### B. Check API Key Validity
- Verify the key is correct (copy-paste carefully)
- Check if you have sufficient credits/quota
- Ensure the API service is accessible from your location

#### C. Test API Keys Individually
- Try each API key one at a time
- Check server console for detailed error messages

### 5. **Debugging Steps**

#### Step 1: Check Server Console
```bash
npm start
```
Look for:
- Server startup messages
- API request logs
- Error messages

#### Step 2: Check Browser Console
- Open Developer Tools (F12)
- Go to Console tab
- Look for error messages
- Check if JavaScript files are loading

#### Step 3: Test API Endpoints
```bash
# Test if server is running
curl http://localhost:3000/

# Test API key update
curl -X POST http://localhost:3000/api/update-keys \
  -H "Content-Type: application/json" \
  -d '{"openai":"test-key"}'

# Test chat API
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","model":"openai"}'
```

#### Step 4: Check Network Tab
- Open Developer Tools
- Go to Network tab
- Try to send a message
- Look for failed requests

### 6. **Environment Issues**

#### A. Node.js Version
```bash
node --version
# Should be 14.0.0 or higher
```

#### B. Dependencies
```bash
# Remove and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### C. Port Conflicts
```bash
# Check what's using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows
```

### 7. **Still Having Issues?**

If none of the above solutions work:

1. **Check the logs:**
   - Server console output
   - Browser console errors
   - Network request failures

2. **Verify setup:**
   - All files are in correct locations
   - Dependencies are installed
   - Server is running on correct port

3. **Test with minimal setup:**
   - Try with just one API key
   - Test with simple messages
   - Check if basic functionality works

4. **Common mistakes:**
   - Forgetting to select a model
   - Not configuring API keys
   - Server not running
   - Wrong port number
   - Missing dependencies

### 8. **Getting Help**

When asking for help, include:
- Error messages from console
- Steps to reproduce the issue
- Your operating system
- Node.js version
- What you've already tried

---

**💡 Pro Tip:** The application includes extensive logging. Check both the server console and browser console for detailed information about what's happening.
