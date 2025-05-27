const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
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

app.use(cors());
app.use(express.json());
app.use(express.static('public'))

// Test Supabase connection
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('guestbook')
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
      .from('guestbook')
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
      .from('guestbook')
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📖 Messages API: http://localhost:${PORT}/api/messages`);
});