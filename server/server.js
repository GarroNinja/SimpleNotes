const express = require('express');
const cors = require('cors');
const { pool, PORT } = require('./config');

const app = express();

// CORS configuration for Vercel deployment
const corsOptions = {
  // Allow any origin in production
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Date', 'X-Api-Version'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 3600 // 1 hour cache for preflight requests
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight OPTIONS requests
app.options('*', cors(corsOptions));

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Response headers for CORS (backup for CORS middleware)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
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

// Common error response for database connection issues
const handleDatabaseError = (res) => {
  return res.status(503).json({ 
    error: 'Database connection unavailable',
    message: 'The server is temporarily unable to connect to the database. Please try again later.'
  });
};

// =========================
// API Routes
// =========================

// Make sure all API routes are prefixed with /api for Vercel deployment
const apiPrefix = '/api';

// Get all notes route
app.get(`${apiPrefix}/notes`, async (req, res) => {
  if (!dbConnected) return handleDatabaseError(res);
  
  try {
    console.log('Fetching all non-archived notes');
    const result = await pool.query('SELECT * FROM notes WHERE archived = false ORDER BY is_pinned DESC, created_at DESC');
    console.log(`Retrieved ${result.rows.length} notes`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ 
      error: 'Failed to retrieve notes',
      details: err.message
    });
  }
});

// Get archived notes route
app.get(`${apiPrefix}/notes/archived`, async (req, res) => {
  if (!dbConnected) return handleDatabaseError(res);
  
  try {
    console.log('Fetching archived notes');
    const result = await pool.query('SELECT * FROM notes WHERE archived = true ORDER BY updated_at DESC');
    console.log(`Retrieved ${result.rows.length} archived notes`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching archived notes:', err);
    res.status(500).json({ 
      error: 'Failed to retrieve archived notes',
      details: err.message
    });
  }
});

// Add a new note route
app.post(`${apiPrefix}/notes`, async (req, res) => {
  if (!dbConnected) return handleDatabaseError(res);
  
  const { title, content, color, labels, isPinned } = req.body;
  
  try {
    console.log('Creating new note:', { title, color, isPinned });
    const result = await pool.query(
      'INSERT INTO notes (title, content, color, labels, is_pinned, archived) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, content, color || '#ffffff', labels || [], isPinned || false, false]
    );
    console.log('Note created with ID:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(500).json({ 
      error: 'Failed to create note',
      details: err.message
    });
  }
});

// Update a note route
app.put(`${apiPrefix}/notes/:id`, async (req, res) => {
  if (!dbConnected) return handleDatabaseError(res);
  
  const { id } = req.params;
  const { title, content, color, labels, isPinned, archived } = req.body;
  
  try {
    console.log(`Updating note ID: ${id}`);
    const result = await pool.query(
      'UPDATE notes SET title = $1, content = $2, color = $3, labels = $4, is_pinned = $5, archived = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [title, content, color, labels, isPinned, archived, id]
    );
    
    if (result.rows.length === 0) {
      console.log(`Note ID ${id} not found`);
      return res.status(404).json({ error: 'Note not found' });
    }
    
    console.log(`Note ID ${id} updated successfully`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error updating note ID ${id}:`, err);
    res.status(500).json({ 
      error: 'Failed to update note',
      details: err.message
    });
  }
});

// Delete a note route
app.delete(`${apiPrefix}/notes/:id`, async (req, res) => {
  if (!dbConnected) return handleDatabaseError(res);
  
  const { id } = req.params;
  
  try {
    console.log(`Deleting note ID: ${id}`);
    const result = await pool.query('DELETE FROM notes WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      console.log(`Note ID ${id} not found for deletion`);
      return res.status(404).json({ error: 'Note not found' });
    }
    
    console.log(`Note ID ${id} deleted successfully`);
    res.json({ message: 'Note deleted successfully', id: id });
  } catch (err) {
    console.error(`Error deleting note ID ${id}:`, err);
    res.status(500).json({ 
      error: 'Failed to delete note', 
      details: err.message
    });
  }
});

// Archive/Unarchive a note route
app.patch(`${apiPrefix}/notes/:id/archive`, async (req, res) => {
  if (!dbConnected) return handleDatabaseError(res);
  
  const { id } = req.params;
  const { archived } = req.body;
  
  try {
    console.log(`${archived ? 'Archiving' : 'Unarchiving'} note ID: ${id}`);
    const result = await pool.query(
      'UPDATE notes SET archived = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [archived, id]
    );
    
    if (result.rows.length === 0) {
      console.log(`Note ID ${id} not found for archive/unarchive`);
      return res.status(404).json({ error: 'Note not found' });
    }
    
    console.log(`Note ID ${id} ${archived ? 'archived' : 'unarchived'} successfully`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error ${archived ? 'archiving' : 'unarchiving'} note ID ${id}:`, err);
    res.status(500).json({ 
      error: `Failed to ${archived ? 'archive' : 'unarchive'} note`,
      details: err.message
    });
  }
});

// Toggle pin status route
app.patch(`${apiPrefix}/notes/:id/pin`, async (req, res) => {
  if (!dbConnected) return handleDatabaseError(res);
  
  const { id } = req.params;
  const { isPinned } = req.body;
  
  try {
    console.log(`${isPinned ? 'Pinning' : 'Unpinning'} note ID: ${id}`);
    const result = await pool.query(
      'UPDATE notes SET is_pinned = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [isPinned, id]
    );
    
    if (result.rows.length === 0) {
      console.log(`Note ID ${id} not found for pin/unpin`);
      return res.status(404).json({ error: 'Note not found' });
    }
    
    console.log(`Note ID ${id} ${isPinned ? 'pinned' : 'unpinned'} successfully`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error ${isPinned ? 'pinning' : 'unpinning'} note ID ${id}:`, err);
    res.status(500).json({ 
      error: `Failed to ${isPinned ? 'pin' : 'unpin'} note`,
      details: err.message
    });
  }
});

// Health check endpoint
app.get(['/health', `${apiPrefix}/health`], (req, res) => {
  const dbStatus = dbConnected ? 'connected' : 'disconnected';
  
  if (dbConnected) {
    // Test database connection with this health check
    pool.query('SELECT NOW()')
      .then(result => {
        res.status(200).json({ 
          status: 'OK', 
          timestamp: new Date(),
          database: dbStatus,
          dbTime: result.rows[0].now,
          environment: process.env.NODE_ENV || 'development'
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

// Root API check endpoint
app.get(['/api', '/'], (req, res) => {
  res.status(200).json({
    status: 'SimpleNotes API is running',
    timestamp: new Date(),
    databaseStatus: dbConnected ? 'connected' : 'disconnected',
    version: '1.0.0'
  });
});

// Start server if not being imported as a module
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
}

// Export the app for Vercel serverless functions
module.exports = app;