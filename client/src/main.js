// Change this to your deployed backend URL, not Supabase directly
const API_URL = 'https://guestbook-1-0wnj.onrender.com'; // Your deployed backend

const form = document.getElementById('guestbook-form');
const messagesContainer = document.getElementById('messages');

// Load messages on page load
document.addEventListener('DOMContentLoaded', loadMessages);

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const message = document.getElementById('message').value;
    
    try {
        const response = await fetch(`${API_URL}/api/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, message }),
        });
        
        if (response.ok) {
            form.reset();
            loadMessages(); // Refresh messages
        } else {
            console.error('Failed to submit message');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Load and display messages
async function loadMessages() {
    try {
        const response = await fetch(`${API_URL}/api/messages`);
        const messages = await response.json();
        
        messagesContainer.innerHTML = messages.map(msg => `
            <div class="message">
                <div class="message-header">
                    <span class="message-name">${msg.name}</span>
                    <span class="message-date">${new Date(msg.created_at).toLocaleDateString()}</span>
                </div>
                <div class="message-text">${msg.message}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}