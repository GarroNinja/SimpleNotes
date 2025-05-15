const express = require('express');
const cors = require('cors');
const { pool, PORT } = require('./config');

const app = express();

// CORS configuration for Vercel deployment
const corsOptions = {
  origin: function(origin, callback) {
    // Allow any origin in development and production
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Date', 'X-Api-Version'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 3600 // 1 hour cache for preflight requests
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// OPTIONS preflight handler
app.options('*', cors(corsOptions));

// Middleware to handle CORS preflight
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    // Handle OPTIONS requests explicitly to ensure they work correctly
    return res.status(200).end();
  }
  
  next();
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({
    error: 'An unexpected server error occurred',
    message: err.message,
    path: req.path
  });
});

// Setup database connection state
let dbConnected = false;

// Test database connection
pool.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database via Supabase connection pooling');
    dbConnected = true;
  })
  .catch(err => {
    console.error('Database connection error:', err.stack);
    console.error('Please check your DATABASE_URL environment variable is pointing to the Supabase pooler URL');
  });

// Routes

// Get all notes
app.get('/api/notes', async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ 
      error: 'Database connection is not established',
      message: 'The server is temporarily unable to connect to the database. Please try again later.'
    });
  }
  
  try {
    const result = await pool.query('SELECT * FROM notes WHERE archived = false ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ 
      error: 'An error occurred while fetching notes',
      details: err.message,
      hint: 'Verify DATABASE_URL is correctly set in Vercel environment variables'
    });
  }
});

// Get archived notes
app.get('/api/notes/archived', async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ 
      error: 'Database connection is not established',
      message: 'The server is temporarily unable to connect to the database. Please try again later.'
    });
  }
  
  try {
    const result = await pool.query('SELECT * FROM notes WHERE archived = true ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching archived notes:', err);
    res.status(500).json({ error: 'An error occurred while fetching archived notes' });
  }
});

// Add a new note
app.post('/api/notes', async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ 
      error: 'Database connection is not established',
      message: 'The server is temporarily unable to connect to the database. Please try again later.'
    });
  }
  
  const { title, content, color, labels, isPinned } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO notes (title, content, color, labels, is_pinned, archived) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, content, color || '#ffffff', labels || [], isPinned || false, false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(500).json({ error: 'An error occurred while creating the note' });
  }
});

// Update a note
app.put('/api/notes/:id', async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ 
      error: 'Database connection is not established',
      message: 'The server is temporarily unable to connect to the database. Please try again later.'
    });
  }
  
  const { id } = req.params;
  const { title, content, color, labels, isPinned, archived } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE notes SET title = $1, content = $2, color = $3, labels = $4, is_pinned = $5, archived = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [title, content, color, labels, isPinned, archived, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating note:', err);
    res.status(500).json({ error: 'An error occurred while updating the note' });
  }
});

// Delete a note
app.delete('/api/notes/:id', async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ 
      error: 'Database connection is not established',
      message: 'The server is temporarily unable to connect to the database. Please try again later.'
    });
  }
  
  const { id } = req.params;
  
  try {
    const result = await pool.query('DELETE FROM notes WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ error: 'An error occurred while deleting the note' });
  }
});

// Archive/Unarchive a note
app.patch('/api/notes/:id/archive', async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ 
      error: 'Database connection is not established',
      message: 'The server is temporarily unable to connect to the database. Please try again later.'
    });
  }
  
  const { id } = req.params;
  const { archived } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE notes SET archived = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [archived, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error archiving/unarchiving note:', err);
    res.status(500).json({ error: 'An error occurred while archiving/unarchiving the note' });
  }
});

// Toggle pin status
app.patch('/api/notes/:id/pin', async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ 
      error: 'Database connection is not established',
      message: 'The server is temporarily unable to connect to the database. Please try again later.'
    });
  }
  
  const { id } = req.params;
  const { isPinned } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE notes SET is_pinned = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [isPinned, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating pin status:', err);
    res.status(500).json({ error: 'An error occurred while updating the pin status' });
  }
});

// Simple health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = dbConnected ? 'connected' : 'disconnected';
  
  if (dbConnected) {
    // Test database connection with this health check
    pool.query('SELECT NOW()')
      .then(result => {
        res.status(200).json({ 
          status: 'OK', 
          timestamp: new Date(),
          database: dbStatus,
          dbTime: result.rows[0].now
        });
      })
      .catch(err => {
        dbConnected = false;
        res.status(500).json({
          status: 'ERROR',
          timestamp: new Date(),
          database: 'error',
          error: err.message
        });
      });
  } else {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date(),
      database: dbStatus,
      message: 'Database connection not established'
    });
  }
});

// Default route for API check
app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'API is running',
    timestamp: new Date(),
    databaseStatus: dbConnected ? 'connected' : 'disconnected'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});