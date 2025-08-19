// Chat page JavaScript for AI model interaction

document.addEventListener('DOMContentLoaded', function() {
    console.log('Chat page loaded');
    
    // DOM elements
    const modelSelector = document.getElementById('modelSelector');
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    const charCount = document.getElementById('charCount');
    const typingIndicator = document.getElementById('typingIndicator');
    const modelStatus = document.getElementById('modelStatus');
    const currentModelInfo = document.getElementById('currentModelInfo');
    const messageCount = document.getElementById('messageCount');
    const connectionStatus = document.getElementById('connectionStatus');
    
    // Chat state
    let currentModel = '';
    let messageHistory = [];
    let isTyping = false;
    
    // Initialize chat
    initializeChat();
    
    function initializeChat() {
        console.log('Initializing chat...');
        
        // Add event listeners
        modelSelector.addEventListener('change', handleModelChange);
        chatForm.addEventListener('submit', handleMessageSubmit);
        messageInput.addEventListener('input', handleInputChange);
        messageInput.addEventListener('keydown', handleKeyDown);
        
        // Set initial state
        updateCharCount();
        updateMessageCount();
        
        // Focus on input
        messageInput.focus();
        
        console.log('Chat initialized successfully');
    }
    
    // Handle model selection change
    function handleModelChange(e) {
        const selectedModel = e.target.value;
        console.log('Model changed to:', selectedModel);
        
        if (selectedModel) {
            currentModel = selectedModel;
            currentModelInfo.textContent = getModelDisplayName(selectedModel);
            modelStatus.textContent = '✓ Connected';
            modelStatus.className = 'model-status configured';
            
            // Enable chat
            sendButton.disabled = false;
            messageInput.disabled = false;
            connectionStatus.textContent = 'Ready';
            
            // Add system message
            addSystemMessage(`Connected to ${getModelDisplayName(selectedModel)}. You can now start chatting!`);
            
            // Update model info
            updateModelInfo();
            
            console.log('Model selected and chat enabled');
            
        } else {
            currentModel = '';
            currentModelInfo.textContent = 'None selected';
            modelStatus.textContent = '⚠ No model selected';
            modelStatus.className = 'model-status not-configured';
            
            // Disable chat
            sendButton.disabled = true;
            messageInput.disabled = true;
            connectionStatus.textContent = 'No model selected';
            
            console.log('No model selected, chat disabled');
        }
    }
    
    // Handle message submission
    async function handleMessageSubmit(e) {
        e.preventDefault();
        console.log('Message form submitted');
        
        const message = messageInput.value.trim();
        console.log('Message:', message);
        console.log('Current model:', currentModel);
        console.log('Is typing:', isTyping);
        
        if (!message) {
            console.log('No message to send');
            return;
        }
        
        if (!currentModel) {
            console.log('No model selected');
            showToast('Please select an AI model first', 'warning');
            return;
        }
        
        if (isTyping) {
            console.log('Already typing, ignoring submission');
            return;
        }
        
        try {
            // Add user message to chat
            addUserMessage(message);
            
            // Clear input and update count
            messageInput.value = '';
            updateCharCount();
            
            // Show typing indicator
            showTypingIndicator();
            
            console.log('Sending message to AI...');
            
            // Send message to AI
            const response = await sendMessageToAI(message, currentModel);
            
            // Hide typing indicator
            hideTypingIndicator();
            
            // Add AI response
            addAIMessage(response);
            
            // Update message count
            updateMessageCount();
            
            // Scroll to bottom
            scrollToBottom();
            
            console.log('Message sent and response received successfully');
            
        } catch (error) {
            console.error('Error sending message:', error);
            hideTypingIndicator();
            
            // Show error message
            addSystemMessage(`Error: ${error.message}`, 'error');
            
            // Update connection status
            connectionStatus.textContent = 'Error occurred';
            connectionStatus.style.color = '#f44336';
            
            // Reset after delay
            setTimeout(() => {
                connectionStatus.textContent = 'Ready';
                connectionStatus.style.color = '';
            }, 3000);
        }
    }
    
    // Handle input changes
    function handleInputChange() {
        updateCharCount();
        
        // Enable/disable send button based on input
        const hasText = messageInput.value.trim().length > 0;
        const hasModel = currentModel !== '';
        
        sendButton.disabled = !hasText || !hasModel || isTyping;
        
        console.log('Input changed - hasText:', hasText, 'hasModel:', hasModel, 'isTyping:', isTyping);
    }
    
    // Handle keyboard shortcuts
    function handleKeyDown(e) {
        // Enter to send (Shift+Enter for new line)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            console.log('Enter key pressed, attempting to submit');
            if (!sendButton.disabled) {
                chatForm.dispatchEvent(new Event('submit'));
            } else {
                console.log('Send button is disabled, cannot submit');
            }
        }
        
        // Ctrl/Cmd + Enter to send
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            console.log('Ctrl+Enter pressed, attempting to submit');
            if (!sendButton.disabled) {
                chatForm.dispatchEvent(new Event('submit'));
            } else {
                console.log('Send button is disabled, cannot submit');
            }
        }
    }
    
    // Send message to AI API
    async function sendMessageToAI(message, model) {
        console.log('Making API request to /api/chat');
        console.log('Request payload:', { message, model });
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, model })
        });
        
        console.log('API response status:', response.status);
        console.log('API response headers:', response.headers);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API error response:', errorData);
            throw new Error(errorData.error || 'Failed to get response from AI');
        }
        
        const data = await response.json();
        console.log('API success response:', data);
        return data.response;
    }
    
    // Add user message to chat
    function addUserMessage(message) {
        console.log('Adding user message:', message);
        const messageElement = createMessageElement(message, 'user');
        chatMessages.appendChild(messageElement);
        
        // Add to history
        messageHistory.push({
            type: 'user',
            content: message,
            timestamp: new Date()
        });
        
        // Scroll to bottom
        scrollToBottom();
    }
    
    // Add AI message to chat
    function addAIMessage(message) {
        console.log('Adding AI message:', message);
        const messageElement = createMessageElement(message, 'ai');
        chatMessages.appendChild(messageElement);
        
        // Add to history
        messageHistory.push({
            type: 'ai',
            content: message,
            timestamp: new Date()
        });
        
        // Scroll to bottom
        scrollToBottom();
    }
    
    // Add system message to chat
    function addSystemMessage(message, type = 'info') {
        console.log('Adding system message:', message, 'Type:', type);
        const messageElement = createMessageElement(message, 'system', type);
        chatMessages.appendChild(messageElement);
        
        // Add to history
        messageHistory.push({
            type: 'system',
            content: message,
            timestamp: new Date()
        });
        
        // Scroll to bottom
        scrollToBottom();
    }
    
    // Create message element
    function createMessageElement(content, type, messageType = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Handle different content types
        if (typeof content === 'string') {
            const paragraph = document.createElement('p');
            paragraph.textContent = content;
            contentDiv.appendChild(paragraph);
        } else {
            contentDiv.appendChild(content);
        }
        
        // Add timestamp
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = utils.formatTime(new Date());
        timestamp.style.fontSize = '0.8rem';
        timestamp.style.color = '#999';
        timestamp.style.marginTop = '5px';
        contentDiv.appendChild(timestamp);
        
        messageDiv.appendChild(contentDiv);
        
        // Add animation
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        messageDiv.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 100);
        
        return messageDiv;
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        console.log('Showing typing indicator');
        isTyping = true;
        typingIndicator.style.display = 'inline';
        sendButton.disabled = true;
        connectionStatus.textContent = 'AI is typing...';
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        console.log('Hiding typing indicator');
        isTyping = false;
        typingIndicator.style.display = 'none';
        sendButton.disabled = false;
        connectionStatus.textContent = 'Ready';
        handleInputChange(); // Re-evaluate button state
    }
    
    // Update character count
    function updateCharCount() {
        const currentLength = messageInput.value.length;
        const maxLength = messageInput.maxLength;
        charCount.textContent = `${currentLength}/${maxLength}`;
        
        // Color coding
        if (currentLength > maxLength * 0.9) {
            charCount.style.color = '#f44336';
        } else if (currentLength > maxLength * 0.8) {
            charCount.style.color = '#ff9800';
        } else {
            charCount.style.color = '#999';
        }
    }
    
    // Update message count
    function updateMessageCount() {
        const userMessages = messageHistory.filter(msg => msg.type === 'user').length;
        messageCount.textContent = userMessages;
    }
    
    // Update model information
    function updateModelInfo() {
        const modelInfo = document.querySelector('.model-availability');
        if (modelInfo) {
            const modelItems = modelInfo.querySelectorAll('li');
            modelItems.forEach(item => {
                if (item.textContent.includes(getModelDisplayName(currentModel))) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }
    }
    
    // Get model display name
    function getModelDisplayName(model) {
        const modelNames = {
            'openai': 'OpenAI GPT',
            'anthropic': 'Anthropic Claude',
            'google': 'Google Gemini',
            'cohere': 'Cohere'
        };
        return modelNames[model] || model;
    }
    
    // Scroll chat to bottom
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Clear chat function (called from HTML)
    window.clearChat = function() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            // Remove all messages except system messages
            const messages = chatMessages.querySelectorAll('.message:not(.system-message)');
            messages.forEach(msg => msg.remove());
            
            // Clear history
            messageHistory = messageHistory.filter(msg => msg.type === 'system');
            
            // Update counts
            updateMessageCount();
            
            // Add system message
            addSystemMessage('Chat history cleared.');
            
            showToast('Chat history cleared!', 'info');
        }
    };
    
    // Export chat function (called from HTML)
    window.exportChat = function() {
        if (messageHistory.length === 0) {
            showToast('No messages to export!', 'warning');
            return;
        }
        
        try {
            // Format chat history
            let exportText = `AI Chatbot Conversation - ${new Date().toLocaleString()}\n`;
            exportText += `Model: ${currentModel ? getModelDisplayName(currentModel) : 'None'}\n`;
            exportText += '='.repeat(50) + '\n\n';
            
            messageHistory.forEach(msg => {
                const timestamp = utils.formatTime(msg.timestamp);
                const role = msg.type === 'user' ? 'You' : 
                           msg.type === 'ai' ? 'AI' : 'System';
                exportText += `[${timestamp}] ${role}: ${msg.content}\n\n`;
            });
            
            // Create and download file
            const blob = new Blob([exportText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chat-export-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showToast('Chat exported successfully!', 'success');
            
        } catch (error) {
            console.error('Error exporting chat:', error);
            showToast('Failed to export chat!', 'error');
        }
    };
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + L to clear chat
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            clearChat();
        }
        
        // Ctrl/Cmd + E to export chat
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportChat();
        }
        
        // Ctrl/Cmd + K to focus input
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            messageInput.focus();
        }
    });
    
    // Add auto-scroll when user is typing
    let scrollTimeout;
    messageInput.addEventListener('input', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (this === document.activeElement) {
                scrollToBottom();
            }
        }, 1000);
    });
    
    // Add message highlighting on hover
    chatMessages.addEventListener('mouseover', function(e) {
        const message = e.target.closest('.message');
        if (message) {
            message.style.transform = 'scale(1.01)';
            message.style.transition = 'transform 0.2s ease';
        }
    });
    
    chatMessages.addEventListener('mouseout', function(e) {
        const message = e.target.closest('.message');
        if (message) {
            message.style.transform = 'scale(1)';
        }
    });
    
    // Add message search functionality
    let searchIndex = -1;
    let searchResults = [];
    
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + F to search messages
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            const searchTerm = prompt('Search messages:');
            if (searchTerm) {
                searchMessages(searchTerm);
            }
        }
        
        // F3 or Ctrl/Cmd + G to find next
        if (e.key === 'F3' || ((e.ctrlKey || e.metaKey) && e.key === 'g')) {
            e.preventDefault();
            if (searchResults.length > 0) {
                findNext();
            }
        }
    });
    
    function searchMessages(term) {
        searchResults = [];
        const messages = chatMessages.querySelectorAll('.message-content');
        
        messages.forEach((msg, index) => {
            if (msg.textContent.toLowerCase().includes(term.toLowerCase())) {
                searchResults.push(index);
            }
        });
        
        if (searchResults.length > 0) {
            searchIndex = 0;
            highlightMessage(searchResults[0]);
            showToast(`Found ${searchResults.length} results. Press F3 for next.`, 'info');
        } else {
            showToast('No results found.', 'warning');
        }
    }
    
    function findNext() {
        if (searchResults.length === 0) return;
        
        searchIndex = (searchIndex + 1) % searchResults.length;
        highlightMessage(searchResults[searchIndex]);
    }
    
    function highlightMessage(index) {
        // Remove previous highlights
        chatMessages.querySelectorAll('.message-content').forEach(msg => {
            msg.style.background = '';
            msg.style.border = '';
        });
        
        // Highlight current result
        const messages = chatMessages.querySelectorAll('.message-content');
        if (messages[index]) {
            messages[index].style.background = '#fff3cd';
            messages[index].style.border = '2px solid #ffc107';
            messages[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    console.log('Chat functionality initialized');
});
