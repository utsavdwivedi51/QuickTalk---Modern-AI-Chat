//  OPENROUTER API KEY 
const API_KEY = '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';

// OpenRouter configuration
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'openai/gpt-oss-120b:free';
const YOUR_SITE_URL = 'https://utsavdwivedi51.github.io/QuickTalk---Modern-AI-Chat/';
const YOUR_SITE_NAME = 'QuickTalk';

// Conversation history
let conversationHistory = [
    { role: 'system', content: 'You are a helpful, friendly AI assistant. You can analyze images and documents that users share with you. When users share files, provide detailed analysis and extract relevant information.' }
];

// Store attached files
let attachedFiles = [];

// DOM elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const attachmentBtn = document.getElementById('attachment-btn');
const attachmentMenu = document.getElementById('attachment-menu');
const filePreviewContainer = document.getElementById('file-preview-container');

// File input elements
const photoInput = document.getElementById('photo-input');
const cameraInput = document.getElementById('camera-input');
const fileInput = document.getElementById('file-input');

// Attachment menu options
const photoOption = document.getElementById('photo-option');
const cameraOption = document.getElementById('camera-option');
const fileOption = document.getElementById('file-option');

// ===== THEME MANAGEMENT =====
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
}

themeToggle.addEventListener('click', toggleTheme);

// ===== ATTACHMENT MENU =====
attachmentBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    attachmentMenu.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!attachmentBtn.contains(e.target) && !attachmentMenu.contains(e.target)) {
        attachmentMenu.classList.remove('active');
    }
});

// Attachment options
photoOption.addEventListener('click', () => {
    photoInput.click();
    attachmentMenu.classList.remove('active');
});

cameraOption.addEventListener('click', () => {
    cameraInput.click();
    attachmentMenu.classList.remove('active');
});

fileOption.addEventListener('click', () => {
    fileInput.click();
    attachmentMenu.classList.remove('active');
});

// ===== FILE HANDLING =====
photoInput.addEventListener('change', (e) => handleFileSelect(e.target.files));
cameraInput.addEventListener('change', (e) => handleFileSelect(e.target.files));
fileInput.addEventListener('change', (e) => handleFileSelect(e.target.files));

function handleFileSelect(files) {
    for (let file of files) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert(`File ${file.name} is too large. Maximum size is 10MB.`);
            continue;
        }
        attachedFiles.push(file);
        addFilePreview(file);
    }
    updateFilePreviewContainer();
}

function addFilePreview(file) {
    const preview = document.createElement('div');
    preview.classList.add('file-preview');
    preview.dataset.fileName = file.name;

    if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        preview.appendChild(img);
    } else {
        const fileInfo = document.createElement('div');
        fileInfo.classList.add('file-preview-info');
        fileInfo.innerHTML = `
            <span class="file-icon">${getFileIcon(file.type)}</span>
            <div class="file-details">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
        `;
        preview.appendChild(fileInfo);
    }

    const removeBtn = document.createElement('button');
    removeBtn.classList.add('remove-file');
    removeBtn.textContent = '×';
    removeBtn.onclick = () => removeFile(file.name);
    preview.appendChild(removeBtn);

    filePreviewContainer.appendChild(preview);
}

function removeFile(fileName) {
    attachedFiles = attachedFiles.filter(f => f.name !== fileName);
    const preview = filePreviewContainer.querySelector(`[data-file-name="${fileName}"]`);
    if (preview) preview.remove();
    updateFilePreviewContainer();
}

function updateFilePreviewContainer() {
    if (attachedFiles.length > 0) {
        filePreviewContainer.classList.add('active');
    } else {
        filePreviewContainer.classList.remove('active');
    }
}

function getFileIcon(type) {
    if (type.includes('pdf')) return '📕';
    if (type.includes('word') || type.includes('document')) return '📘';
    if (type.includes('text')) return '📝';
    if (type.includes('csv') || type.includes('excel')) return '📊';
    return '📄';
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ===== MESSAGE FUNCTIONS =====
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

async function addMessageToUI(role, content, files = []) {
    const welcomeMsg = document.querySelector('.welcome-message');
    if (welcomeMsg) welcomeMsg.remove();

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', role === 'user' ? 'user-message' : 'bot-message');
    
    const avatar = document.createElement('div');
    avatar.classList.add('message-avatar');
    avatar.textContent = role === 'user' ? '👤' : '🤖';
    
    const bubbleWrapper = document.createElement('div');
    
    const bubble = document.createElement('div');
    bubble.classList.add('message-bubble');
    bubble.textContent = content;

    // Add file attachments
    if (files.length > 0) {
        for (let file of files) {
            const attachment = document.createElement('div');
            attachment.classList.add('file-attachment');

            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.alt = file.name;
                attachment.appendChild(img);
            } else {
                const fileInfo = document.createElement('div');
                fileInfo.classList.add('file-info');
                fileInfo.innerHTML = `
                    <span class="file-icon">${getFileIcon(file.type)}</span>
                    <div class="file-details">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${formatFileSize(file.size)}</div>
                    </div>
                `;
                attachment.appendChild(fileInfo);
            }

            bubble.appendChild(attachment);
        }
    }
    
    bubbleWrapper.appendChild(bubble);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubbleWrapper);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.classList.add('typing-indicator');
    indicator.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.classList.add('message-avatar');
    avatar.textContent = '🤖';
    
    const typingBubble = document.createElement('div');
    typingBubble.classList.add('typing-bubble');
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        typingBubble.appendChild(dot);
    }
    
    indicator.appendChild(avatar);
    indicator.appendChild(typingBubble);
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// ===== FILE PROCESSING =====
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function extractTextFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// ===== API CALL =====
async function getBotResponse(userMessage, files = []) {
    const messageContent = [];

    // Add text content
    if (userMessage.trim()) {
        messageContent.push({
            type: 'text',
            text: userMessage
        });
    }

    // Process files
    for (let file of files) {
        if (file.type.startsWith('image/')) {
            // Handle images
            const base64 = await fileToBase64(file);
            messageContent.push({
                type: 'image_url',
                image_url: {
                    url: `data:${file.type};base64,${base64}`
                }
            });
        } else {
            // Handle text-based files
            try {
                const text = await extractTextFromFile(file);
                messageContent.push({
                    type: 'text',
                    text: `Content of ${file.name}:\n\n${text}`
                });
            } catch (error) {
                messageContent.push({
                    type: 'text',
                    text: `[Unable to read file: ${file.name}]`
                });
            }
        }
    }

    conversationHistory.push({
        role: 'user',
        content: messageContent.length === 1 ? messageContent[0].text : messageContent
    });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': YOUR_SITE_URL,
                'X-Title': YOUR_SITE_NAME
            },
            body: JSON.stringify({
                model: MODEL,
                messages: conversationHistory,
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || `API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const botReply = data.choices[0].message.content;

        conversationHistory.push({ role: 'assistant', content: botReply });
        
        return botReply;
    } catch (error) {
        console.error('Error:', error);
        return `⚠️ Error: ${error.message}. Please check your network or try again.`;
    }
}

// ===== SEND MESSAGE =====
async function handleSendMessage() {
    const userMessage = userInput.value.trim();
    const files = [...attachedFiles];

    if (!userMessage && files.length === 0) return;

    userInput.disabled = true;
    sendBtn.disabled = true;
    attachmentBtn.disabled = true;

    await addMessageToUI('user', userMessage || '📎 Attached files', files);
    
    userInput.value = '';
    userInput.style.height = 'auto';

    // Clear attachments
    attachedFiles = [];
    filePreviewContainer.innerHTML = '';
    updateFilePreviewContainer();

    // Reset file inputs
    photoInput.value = '';
    cameraInput.value = '';
    fileInput.value = '';

    showTypingIndicator();

    const botResponse = await getBotResponse(userMessage, files);

    removeTypingIndicator();
    await addMessageToUI('bot', botResponse);

    userInput.disabled = false;
    sendBtn.disabled = false;
    attachmentBtn.disabled = false;
    userInput.focus();
}

// ===== AUTO-RESIZE TEXTAREA =====
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

// ===== EVENT LISTENERS =====
sendBtn.addEventListener('click', handleSendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});

// ===== INITIALIZATION =====
initTheme();
userInput.focus();
