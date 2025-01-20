let chatSocket = null;
let selectedUser = null;
const currentUser = document.querySelector('[data-current-user]').dataset.currentUser;

function initChat() {
    document.querySelectorAll('.user-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.user-item').forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
            
            selectedUser = this.dataset.username;
            const roomName = encodeURIComponent([selectedUser, currentUser].sort().join('_'));
            
            connectWebSocket(roomName);
        });
    });

    document.querySelector('#chat-message-submit').onclick = sendMessage;
    document.querySelector('#chat-message-input').onkeyup = function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };
}

function connectWebSocket(roomName) {
    if (chatSocket) {
        chatSocket.close();
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socketUrl = `${wsProtocol}//${window.location.host}/ws/chat/${decodeURIComponent(roomName)}/`;
    
    console.log('Connecting to WebSocket:', socketUrl);
    
    try {
        chatSocket = new WebSocket(socketUrl);

        chatSocket.onopen = handleSocketOpen;
        chatSocket.onmessage = handleSocketMessage;
        chatSocket.onclose = handleSocketClose;
        chatSocket.onerror = handleSocketError;
    } catch (error) {
        console.error('WebSocket connection error:', error);
    }
}

function handleSocketOpen(e) {
    console.log('WebSocket connection established');
    const messagesDiv = document.querySelector('#chat-messages');
    messagesDiv.innerHTML = '';
    
    const infoMessage = document.createElement('div');
    infoMessage.classList.add('message', 'info');
    infoMessage.textContent = `Started chat with ${selectedUser}`;
    messagesDiv.appendChild(infoMessage);
}

function handleSocketMessage(e) {
    console.log('Message received:', e.data);
    try {
        const data = JSON.parse(e.data);
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(data.sender === currentUser ? 'sent' : 'received');
        messageElement.textContent = `${data.sender}: ${data.message}`;
        
        const chatMessages = document.querySelector('#chat-messages');
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('Error processing message:', error);
    }
}

function handleSocketClose(e) {
    console.log('WebSocket connection closed:', e);
    if (selectedUser && !e.wasClean) {
        setTimeout(() => {
            console.log('Attempting to reconnect...');
            const roomName = encodeURIComponent([selectedUser, currentUser].sort().join('_'));
            connectWebSocket(roomName);
        }, 3000);
    }
}

function handleSocketError(e) {
    console.error('WebSocket error:', e);
}

function sendMessage() {
    if (!selectedUser) {
        alert('Please select a user to chat with');
        return;
    }

    const messageInput = document.querySelector('#chat-message-input');
    const message = messageInput.value.trim();
    
    if (!message) return;

    if (chatSocket?.readyState === WebSocket.OPEN) {
        try {
            chatSocket.send(JSON.stringify({
                'message': message,
                'receiver': selectedUser
            }));
            messageInput.value = '';
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Error sending message. Please try again.');
        }
    } else {
        console.log('WebSocket is not open. Current state:', chatSocket?.readyState);
        alert('Chat connection is not open. Please try again in a moment.');
    }
}

document.addEventListener('DOMContentLoaded', initChat);