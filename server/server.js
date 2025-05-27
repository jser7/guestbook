const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Check environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.log('Required: SUPABASE_URL and SUPABASE_ANON_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

console.log('✅ Supabase client initialized');

// CORS configuration - allow your frontend domain
app.use(cors({
  origin: ['https://guestbook-1-0wnj.onrender.com', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Serve static files with proper MIME types
app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Test Supabase connection
async function testConnection() {
  try {
    // Change 'guestbook' to 'messages' if that's your table name
    const { data, error } = await supabase
      .from('messages')  // Make sure this matches your table name
      .select('count', { count: 'exact' });
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
    } else {
      console.log('✅ Supabase connected successfully!');
    }
  } catch (err) {
    console.error('❌ Connection test error:', err.message);
  }
}

// Test connection on startup
testConnection();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    database: 'Supabase connected'
  });
});

// GET route - fetch all messages
app.get('/api/messages', async (req, res) => {
  console.log('📖 Fetching messages from Supabase...');
  try {
    const { data, error } = await supabase
      .from('messages')  // Make sure this matches your table name
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    console.log(`✅ Found ${data.length} messages`);
    res.json(data);
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST route - add new message
app.post('/api/messages', async (req, res) => {
  console.log('📝 Adding new message:', req.body);
  try {
    const { name, message } = req.body;
    
    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required' });
    }
    
    const { data, error } = await supabase
      .from('messages')  // Make sure this matches your table name
      .insert([{ name: name.trim(), message: message.trim() }])
      .select();
    
    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    console.log('✅ Message added successfully');
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve frontend files (if this is a full-stack app)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📖 Messages API: http://localhost:${PORT}/api/messages`);
});