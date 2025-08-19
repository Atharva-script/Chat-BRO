// Chat interface functionality

document.addEventListener('DOMContentLoaded', function() {
    console.log('Chat interface initialized');
    
    // DOM elements
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const modelSelect = document.getElementById('modelSelect');
    const charCount = document.getElementById('charCount'); // may be null in compact header UI
    const currentModelInfo = document.getElementById('currentModelInfo');
    const messageCount = document.getElementById('messageCount'); // may be null
    const connectionStatus = document.getElementById('connectionStatus'); // may be null
    const chatActions = document.getElementById('chatActions'); // bottom actions (clear/export)
    
    // State variables
    let currentModel = '';
    let isTyping = false;
    let messageHistory = [
        { type: 'system', content: 'Welcome! Select an AI model to start chatting.', timestamp: Date.now() }
    ];
    
    // Initialize chat
    initializeChat();
    
    // Event listeners
    modelSelect.addEventListener('change', handleModelChange);
    messageInput.addEventListener('input', handleInputChange);
    messageInput.addEventListener('keypress', handleKeyPress);
    
    // Initialize chat functionality
    function initializeChat() {
        console.log('Initializing chat...');
        
        // Set initial state
        updateMessageCount();
        updateConnectionStatus('Ready');
        if (chatActions) {
            chatActions.style.display = 'none';
        }
        
        console.log('Chat initialized successfully');
    }

    // Escape HTML to prevent XSS when rendering user/AI text
    function escapeHtml(unsafe) {
        if (unsafe == null) return '';
        return String(unsafe)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Convert triple backtick code blocks into styled HTML with optional language
    function renderMessageContent(raw) {
        const text = typeof raw === 'string' ? raw : String(raw || '');
        const normalized = text.replace(/\r\n/g, '\n');
        const codeBlockRegex = /```([a-zA-Z0-9#+\-._]*)?\n([\s\S]*?)```/g;
        let html = '';
        let lastIndex = 0;

        let match;
        while ((match = codeBlockRegex.exec(normalized)) !== null) {
            const [full, langRaw, codeRaw] = match;
            const before = normalized.slice(lastIndex, match.index);
            if (before) {
                html += `<div class="text-content">${escapeHtml(before)}</div>`;
            }
            const lang = (langRaw || '').trim();
            const codeEscaped = escapeHtml(codeRaw);
            const langClass = lang ? `language-${lang}` : '';
            html += `
                <div class="code-block">
                    <button class="copy-code" title="Copy code">Copy</button>
                    <pre><code class="${langClass}">${codeEscaped}</code></pre>
                </div>
            `;
            lastIndex = match.index + full.length;
        }

        const remaining = normalized.slice(lastIndex);
        if (remaining) {
            html += `<div class="text-content">${escapeHtml(remaining)}</div>`;
        }

        return html || `<div class="text-content"></div>`;
    }

    // Enhance a newly added message element: syntax highlight and copy buttons
    function enhanceMessage(messageElement) {
        try {
            const codeBlocks = messageElement.querySelectorAll('pre code');
            if (window.hljs && codeBlocks.length) {
                codeBlocks.forEach(codeEl => {
                    window.hljs.highlightElement(codeEl);
                });
            }
        } catch (e) {
            console.warn('Highlighting failed:', e);
        }
    }

    // Copy code handler (event delegation)
    chatMessages.addEventListener('click', async function(e) {
        const target = e.target;
        if (target && target.classList && target.classList.contains('copy-code')) {
            const container = target.closest('.code-block');
            const codeEl = container && container.querySelector('pre code');
            if (!codeEl) return;
            const codeText = codeEl.innerText;
            const original = target.textContent;
            try {
                await navigator.clipboard.writeText(codeText);
                target.textContent = 'Copied';
                setTimeout(() => { target.textContent = original; }, 1200);
            } catch (err) {
                console.error('Copy failed:', err);
                target.textContent = 'Failed';
                setTimeout(() => { target.textContent = original; }, 1200);
            }
        }
    });
    
    // Handle model selection change
    function handleModelChange(e) {
        console.log('Model selection changed');
        currentModel = e.target.value;
        if (currentModelInfo) {
            currentModelInfo.textContent = currentModel ? getModelDisplayName(currentModel) : 'None selected';
        }
        
        // Update button state
        updateSendButtonState();
        
        console.log('Model changed to:', currentModel);
    }
    
    // Handle message input changes
    function handleInputChange(e) {
        console.log('Message input changed');
        const message = e.target.value;
        
        // Update character count
        if (charCount) {
            charCount.textContent = `${message.length}/500`;
        }
        
        // Update button state
        updateSendButtonState();
        
        console.log('Message length:', message.length);
    }
    
    // Handle key press in input
    function handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sendButton.disabled) {
                handleMessageSubmit(e);
            }
        }
    }
    
    // Handle form submission
    function handleMessageSubmit(e) {
        e.preventDefault();
        console.log('Message form submitted');
        
        const message = messageInput.value.trim();
        console.log('Message:', message);
        
        if (!message) {
            console.log('No message to send');
            return;
        }
        
        if (!currentModel) {
            console.log('No model selected');
            utils.showToast('Please select an AI model first', 'warning');
            return;
        }
        
        // Add user message to chat
        addUserMessage(message);
        
        // Clear input
        messageInput.value = '';
        if (charCount) {
            charCount.textContent = '0/500';
        }
        
        // Update button state
        updateSendButtonState();
        
        // Send to AI
        sendMessageToAI(message);
        
        console.log('Message sent and response received successfully');
    }
    
    // Send message to AI model
    async function sendMessageToAI(message) {
        console.log('Sending message to AI...');
        
        try {
            // Show typing indicator
            showTypingIndicator();
            updateConnectionStatus('Connecting...');
            
            // Make API request
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    model: currentModel
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Add AI response
                addAIMessage(data.response);
                updateConnectionStatus('Connected');
            } else {
                // Handle error
                addSystemMessage(`Error: ${data.error}`);
                updateConnectionStatus('Error');
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
            addSystemMessage(`Network error: ${error.message}`);
            updateConnectionStatus('Disconnected');
        } finally {
            // Hide typing indicator
            hideTypingIndicator();
        }
    }
    
    // Add user message to chat
    function addUserMessage(content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.innerHTML = `
            <div class="message-content">
                ${renderMessageContent(content)}
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        enhanceMessage(messageDiv);
        
        // Add to history
        messageHistory.push({
            type: 'user',
            content: content,
            timestamp: Date.now()
        });
        
        // Update counts and scroll
        updateMessageCount();
        scrollToBottomDelayed(150);

        // Hide actions while awaiting AI response
        if (chatActions) {
            chatActions.style.display = 'none';
        }
    }
    
    // Add AI message to chat
    function addAIMessage(content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai';
        messageDiv.innerHTML = `
            <div class="message-content">
                ${renderMessageContent(content)}
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        enhanceMessage(messageDiv);
        
        // Add to history
        messageHistory.push({
            type: 'ai',
            content: content,
            timestamp: Date.now()
        });
        
        // Update counts and scroll
        updateMessageCount();
        forceScrollToBottom();

        // Show actions after AI finishes responding
        if (chatActions) {
            chatActions.style.display = 'flex';
        }
    }
    
    // Add system message to chat
    function addSystemMessage(content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system';
        messageDiv.innerHTML = `
            <div class="message-content">
                ${renderMessageContent(content)}
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        enhanceMessage(messageDiv);
        
        // Add to history
        messageHistory.push({
            type: 'system',
            content: content,
            timestamp: Date.now()
        });
        
        // Update counts and scroll
        updateMessageCount();
        scrollToBottomDelayed(100);
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        isTyping = true;
        
        // Create typing indicator message
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator show';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <i class="fas fa-ellipsis-h"></i> AI is typing...
        `;
        
        // Add to chat messages
        chatMessages.appendChild(typingDiv);
        
        // Scroll to bottom immediately and with delay
        forceScrollToBottom();
        scrollToBottomDelayed(200);
        
        updateSendButtonState();

        // Hide actions while typing
        if (chatActions) {
            chatActions.style.display = 'none';
        }
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        isTyping = false;
        
        // Remove typing indicator from chat
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        // Ensure scroll position is correct after removing typing indicator
        scrollToBottomDelayed(100);
        
        updateSendButtonState();
    }
    
    // Update send button state
    function updateSendButtonState() {
        const hasModel = currentModel !== '';
        const hasText = messageInput.value.trim().length > 0;
        const canSend = hasModel && hasText && !isTyping;
        
        sendButton.disabled = !canSend;
    }
    
    // Update message count
    function updateMessageCount() {
        const count = messageHistory.filter(msg => msg.type !== 'system').length;
        if (messageCount) {
            messageCount.textContent = count;
        }
    }
    
    // Update connection status
    function updateConnectionStatus(status) {
        if (connectionStatus) {
            connectionStatus.textContent = status;
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
    
    // Scroll chat to bottom with improved reliability
    function scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            // Use requestAnimationFrame for smooth scrolling
            requestAnimationFrame(() => {
                // Additional check to ensure scrollHeight is correct
                setTimeout(() => {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 0);
            });
        }
    }
    
    // Scroll chat to bottom with delay for better UX
    function scrollToBottomDelayed(delay = 50) {
        setTimeout(() => {
            scrollToBottom();
        }, delay);
    }
    
    // Force scroll to bottom with multiple attempts for reliability
    function forceScrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            // Multiple attempts to ensure scroll works
            const scrollAttempts = [
                () => { chatMessages.scrollTop = chatMessages.scrollHeight; },
                () => { requestAnimationFrame(() => { chatMessages.scrollTop = chatMessages.scrollHeight; }); },
                () => { setTimeout(() => { chatMessages.scrollTop = chatMessages.scrollHeight; }, 50); }
            ];
            
            scrollAttempts.forEach((attempt, index) => {
                setTimeout(attempt, index * 25);
            });
        }
    }
    
    // Clear chat function (called from HTML)
    window.clearChat = function() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            // Remove all messages except system messages
            const messages = chatMessages.querySelectorAll('.message:not(.system)');
            messages.forEach(msg => msg.remove());
            
            // Clear history
            messageHistory = messageHistory.filter(msg => msg.type === 'system');
            
            // Update counts
            updateMessageCount();
            
            // Add system message
            addSystemMessage('Chat history cleared.');
            
            utils.showToast('Chat history cleared!', 'info');
        }
    };
    
    // Export chat function (called from HTML)
    window.exportChat = function() {
        if (messageHistory.length === 0) {
            utils.showToast('No messages to export!', 'warning');
            return;
        }
        
        try {
            // Format chat history
            let exportText = `ChatBRO Conversation - ${new Date().toLocaleString()}\n`;
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
            
            utils.showToast('Chat exported successfully!', 'success');
            
        } catch (error) {
            console.error('Error exporting chat:', error);
            utils.showToast('Failed to export chat!', 'error');
        }
    };
    
    // Add form submit event listener
    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
        chatForm.addEventListener('submit', handleMessageSubmit);
    }
    
    console.log('Chat interface setup complete');
});
