// Settings page JavaScript for API key management

document.addEventListener('DOMContentLoaded', function() {
    console.log('Settings page loaded');
    
    const apiKeysForm = document.getElementById('apiKeysForm');
    const formInputs = apiKeysForm.querySelectorAll('input[type="password"]');
    
    // Store original values for comparison
    const originalValues = {};
    formInputs.forEach(input => {
        originalValues[input.name] = input.value;
    });
    
    // Add form submission handler
    apiKeysForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="btn-loading">⏳</span> Saving...';
            
            // Collect form data
            const formData = new FormData(this);
            const apiKeys = {};
            
            formInputs.forEach(input => {
                if (input.value.trim()) {
                    apiKeys[input.name] = input.value.trim();
                }
            });
            
            // Send API request
            const response = await fetch('/api/update-keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiKeys)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showToast('API keys updated successfully!', 'success');
                
                // Update original values
                Object.keys(apiKeys).forEach(key => {
                    originalValues[key] = apiKeys[key];
                });
                
                // Update status display
                updateStatusDisplay();
                
                // Show success animation
                submitBtn.style.background = '#4CAF50';
                setTimeout(() => {
                    submitBtn.style.background = '';
                }, 1000);
                
            } else {
                throw new Error(result.message || 'Failed to update API keys');
            }
            
        } catch (error) {
            console.error('Error updating API keys:', error);
            showToast(`Error: ${error.message}`, 'error');
            
            // Show error animation
            submitBtn.style.background = '#f44336';
            setTimeout(() => {
                submitBtn.style.background = '';
            }, 1000);
            
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
    
    // Add input validation and real-time feedback
    formInputs.forEach(input => {
        // Add input event listeners
        input.addEventListener('input', function() {
            validateInput(this);
            updateFormState();
        });
        
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        input.addEventListener('focus', function() {
            this.parentNode.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentNode.classList.remove('focused');
        });
    });
    
    // Add show/hide password toggle
    formInputs.forEach(input => {
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'password-toggle';
        toggleBtn.innerHTML = '👁️';
        toggleBtn.title = 'Show/Hide password';
        
        toggleBtn.addEventListener('click', function() {
            if (input.type === 'password') {
                input.type = 'text';
                this.innerHTML = '🙈';
                this.title = 'Hide password';
            } else {
                input.type = 'password';
                this.innerHTML = '👁️';
                this.title = 'Show password';
            }
        });
        
        input.parentNode.style.position = 'relative';
        input.parentNode.appendChild(toggleBtn);
    });
    
    // Add copy to clipboard functionality
    formInputs.forEach(input => {
        if (input.value) {
            const copyBtn = document.createElement('button');
            copyBtn.type = 'button';
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = '📋';
            copyBtn.title = 'Copy to clipboard';
            
            copyBtn.addEventListener('click', async function() {
                try {
                    await utils.copyToClipboard(input.value);
                    showToast('API key copied to clipboard!', 'success');
                    
                    // Visual feedback
                    this.innerHTML = '✓';
                    this.style.background = '#4CAF50';
                    setTimeout(() => {
                        this.innerHTML = '📋';
                        this.style.background = '';
                    }, 1000);
                    
                } catch (error) {
                    showToast('Failed to copy to clipboard', 'error');
                }
            });
            
            input.parentNode.appendChild(copyBtn);
        }
    });
    
    // Add form state management
    function updateFormState() {
        const hasChanges = Array.from(formInputs).some(input => {
            return input.value !== originalValues[input.name];
        });
        
        const submitBtn = apiKeysForm.querySelector('button[type="submit"]');
        submitBtn.disabled = !hasChanges;
        
        if (hasChanges) {
            submitBtn.classList.add('has-changes');
        } else {
            submitBtn.classList.remove('has-changes');
        }
    }
    
    // Add input validation
    function validateInput(input) {
        const value = input.value.trim();
        const parent = input.parentNode;
        const errorElement = parent.querySelector('.error-message') || createErrorElement(parent);
        
        // Remove existing error styling
        input.classList.remove('error');
        errorElement.style.display = 'none';
        
        // Validate based on input name
        let isValid = true;
        let errorMessage = '';
        
        if (input.name === 'openai' && value && !value.startsWith('sk-')) {
            isValid = false;
            errorMessage = 'OpenAI API key should start with "sk-"';
        } else if (input.name === 'anthropic' && value && !value.startsWith('sk-ant-')) {
            isValid = false;
            errorMessage = 'Anthropic API key should start with "sk-ant-"';
        } else if (input.name === 'google' && value && !value.startsWith('AIza')) {
            isValid = false;
            errorMessage = 'Google API key should start with "AIza"';
        }
        
        if (!isValid) {
            input.classList.add('error');
            errorElement.textContent = errorMessage;
            errorElement.style.display = 'block';
        }
        
        return isValid;
    }
    
    // Create error message element
    function createErrorElement(parent) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.display = 'none';
        errorElement.style.color = '#f44336';
        errorElement.style.fontSize = '0.9rem';
        errorElement.style.marginTop = '5px';
        parent.appendChild(errorElement);
        return errorElement;
    }
    
    // Update status display
    function updateStatusDisplay() {
        const statusItems = document.querySelectorAll('.status-value');
        statusItems.forEach(item => {
            const modelName = item.textContent.split(':')[0].toLowerCase();
            const input = document.querySelector(`input[name="${modelName}"]`);
            
            if (input && input.value.trim()) {
                item.textContent = '✓ Configured';
                item.className = 'status-value configured';
            } else {
                item.textContent = '⚠ Not Configured';
                item.className = 'status-value not-configured';
            }
        });
    }
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (!apiKeysForm.querySelector('button[type="submit"]').disabled) {
                apiKeysForm.dispatchEvent(new Event('submit'));
            }
        }
        
        // Tab navigation enhancement
        if (e.key === 'Tab') {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.type === 'password') {
                // Add visual feedback for tab navigation
                activeElement.parentNode.classList.add('tabbed');
                setTimeout(() => {
                    activeElement.parentNode.classList.remove('tabbed');
                }, 200);
            }
        }
    });
    
    // Add auto-save functionality (optional)
    let autoSaveTimeout;
    formInputs.forEach(input => {
        input.addEventListener('input', function() {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                if (this.value.trim() && this.value !== originalValues[this.name]) {
                    showToast('Auto-saving...', 'info');
                    // Uncomment the line below to enable auto-save
                    // apiKeysForm.dispatchEvent(new Event('submit'));
                }
            }, 2000); // Auto-save after 2 seconds of inactivity
        });
    });
    
    // Initialize form state
    updateFormState();
    updateStatusDisplay();
    
    console.log('Settings page functionality initialized');
});

// Clear form function (called from HTML)
function clearForm() {
    const form = document.getElementById('apiKeysForm');
    const inputs = form.querySelectorAll('input[type="password"]');
    
    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('error');
        const errorElement = input.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    });
    
    // Update form state
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.classList.remove('has-changes');
    
    // Show confirmation
    showToast('Form cleared successfully!', 'info');
}

// Add CSS for additional styling
const additionalStyles = `
    .form-group {
        position: relative;
    }
    
    .password-toggle, .copy-btn {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        padding: 5px;
        border-radius: 5px;
        transition: background-color 0.3s ease;
    }
    
    .password-toggle:hover, .copy-btn:hover {
        background-color: rgba(0,0,0,0.1);
    }
    
    .copy-btn {
        right: 50px;
    }
    
    .error {
        border-color: #f44336 !important;
        box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1) !important;
    }
    
    .focused {
        transform: scale(1.02);
        transition: transform 0.2s ease;
    }
    
    .tabbed {
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
        transition: box-shadow 0.2s ease;
    }
    
    .has-changes {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .form-group input[type="password"] {
        padding-right: 80px;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
