const express = require('express');
const cors = require('cors');
const config = require('./config');

// Create Express app
const app = express();

// CORS configuration for all environments
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
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

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Remove redundant CORS headers - using cors middleware instead

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  if (!res.headersSent) {
    res.status(500).json({
      error: 'An unexpected server error occurred',
      message: err.message || 'Unknown error',
      path: req.path
    });
  } else {
    console.error('Headers already sent, could not send error response');
  }
});

// Ensure database connection before handling requests
const ensureConnection = async () => {
  // Don't block on this - just trigger the check and let it run in background
  config.testConnection().catch(err => {
    console.error('Background connection check failed:', err.message);
  });
};

// Periodically check database connection (every 30 seconds)
setInterval(async () => {
  console.log('Performing periodic database connection check...');
  await config.testConnection();
}, 30000);

// Handle database errors
const handleDatabaseError = (res, err) => {
  console.error('Database error:', err?.message || 'Unknown database error');
  return res.status(503).json({ 
    error: 'Database service unavailable',
    message: 'The server is temporarily unable to connect to the database. Please try again later.'
  });
};

// Enhanced query executor with retries
const executeQuery = async (queryFn) => {
  const MAX_RETRIES = 1;
  let retries = 0;
  
  try {
    // Ensure connection but don't wait for it
    ensureConnection();
    
    // Execute the query
    return await queryFn();
  } catch (err) {
    console.error('Query error:', err.message);
    
    // Only retry for specific error types like connection issues
    const isConnectionError = 
      err.message?.includes('connection') || 
      ['08006', '57P01', 'ECONNREFUSED'].includes(err.code);

    // Try once more if it's a connection error
    if (isConnectionError && retries < MAX_RETRIES) {
      retries++;
      console.log(`Retrying query after connection error (attempt ${retries})...`);
      
      // Wait a moment and try a fresh connection test
      await new Promise(resolve => setTimeout(resolve, 500));
      await config.testConnection(true);
      
      // Now try the query again
      return await queryFn();
    }
    
    throw err;
  }
};

// =========================
// API Routes
// =========================

// Make sure all API routes are prefixed with /api for Vercel deployment
const apiPrefix = '/api';



// Get all notes route
app.get(`${apiPrefix}/notes`, async (req, res) => {
  try {
    console.log('Fetching all non-archived notes');
    
    const result = await executeQuery(() => 
      config.pool.query('SELECT * FROM notes WHERE archived = false ORDER BY is_pinned DESC, created_at DESC')
    );
    
    console.log(`Retrieved ${result.rows.length} notes`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching notes:', err.message);
    if (!res.headersSent) {
      handleDatabaseError(res, err);
    }
  }
});

// Get archived notes route
app.get(`${apiPrefix}/notes/archived`, async (req, res) => {
  try {
    console.log('Fetching archived notes');
    
    const result = await executeQuery(() =>
      config.pool.query('SELECT * FROM notes WHERE archived = true ORDER BY updated_at DESC')
    );
    
    console.log(`Retrieved ${result.rows.length} archived notes`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching archived notes:', err.message);
    if (!res.headersSent) {
      handleDatabaseError(res, err);
    }
  }
});

// Add a new note route
app.post(`${apiPrefix}/notes`, async (req, res) => {
  try {
    const { title, content, color, labels, isPinned } = req.body;
    
    console.log('Creating new note:', { title, color, isPinned });
    
    const result = await executeQuery(() =>
      config.pool.query(
        'INSERT INTO notes (title, content, color, labels, is_pinned, archived) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [title, content, color || '#ffffff', labels || [], isPinned || false, false]
      )
    );
    
    console.log('Note created with ID:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating note:', err.message);
    if (!res.headersSent) {
      handleDatabaseError(res, err);
    }
  }
});

// Update a note route
app.put(`${apiPrefix}/notes/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, color, labels, isPinned, archived } = req.body;
    
    console.log(`Updating note ID: ${id}`);
    
    const result = await executeQuery(() =>
      config.pool.query(
        'UPDATE notes SET title = $1, content = $2, color = $3, labels = $4, is_pinned = $5, archived = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
        [title, content, color, labels, isPinned, archived, id]
      )
    );
    
    if (result.rows.length === 0) {
      console.log(`Note ID ${id} not found`);
      return res.status(404).json({ error: 'Note not found' });
    }
    
    console.log(`Note ID ${id} updated successfully`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error updating note:`, err.message);
    if (!res.headersSent) {
      handleDatabaseError(res, err);
    }
  }
});

// Delete a note route
app.delete(`${apiPrefix}/notes/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Deleting note ID: ${id}`);
    
    const result = await executeQuery(() =>
      config.pool.query('DELETE FROM notes WHERE id = $1 RETURNING id', [id])
    );
    
    if (result.rows.length === 0) {
      console.log(`Note ID ${id} not found for deletion`);
      return res.status(404).json({ error: 'Note not found' });
    }
    
    console.log(`Note ID ${id} deleted successfully`);
    res.json({ message: 'Note deleted successfully', id: id });
  } catch (err) {
    console.error(`Error deleting note:`, err.message);
    if (!res.headersSent) {
      handleDatabaseError(res, err);
    }
  }
});

// Archive/Unarchive a note route
app.patch(`${apiPrefix}/notes/:id/archive`, async (req, res) => {
  try {
    const { id } = req.params;
    const { archived } = req.body;
    
    console.log(`${archived ? 'Archiving' : 'Unarchiving'} note ID: ${id}`);
    
    const result = await executeQuery(() =>
      config.pool.query(
        'UPDATE notes SET archived = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [archived, id]
      )
    );
    
    if (result.rows.length === 0) {
      console.log(`Note ID ${id} not found for archive/unarchive`);
      return res.status(404).json({ error: 'Note not found' });
    }
    
    console.log(`Note ID ${id} ${archived ? 'archived' : 'unarchived'} successfully`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error ${req.body.archived ? 'archiving' : 'unarchiving'} note:`, err.message);
    if (!res.headersSent) {
      handleDatabaseError(res, err);
    }
  }
});

// Toggle pin status route
app.patch(`${apiPrefix}/notes/:id/pin`, async (req, res) => {
  try {
    const { id } = req.params;
    const { isPinned } = req.body;
    
    console.log(`${isPinned ? 'Pinning' : 'Unpinning'} note ID: ${id}`);
    
    const result = await executeQuery(() =>
      config.pool.query(
        'UPDATE notes SET is_pinned = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [isPinned, id]
      )
    );
    
    if (result.rows.length === 0) {
      console.log(`Note ID ${id} not found for pin/unpin`);
      return res.status(404).json({ error: 'Note not found' });
    }
    
    console.log(`Note ID ${id} ${isPinned ? 'pinned' : 'unpinned'} successfully`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error ${req.body.isPinned ? 'pinning' : 'unpinning'} note:`, err.message);
    if (!res.headersSent) {
      handleDatabaseError(res, err);
    }
  }
});

// Health check endpoint - actively checks database connection
app.get(['/health', `${apiPrefix}/health`], async (req, res) => {
  try {
    // Always attempt to connect, don't rely on cached status
    const result = await config.pool.query('SELECT NOW()');
    
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date(),
      database: 'connected',
      dbTime: result.rows[0].now,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (err) {
    console.error('Health check failed:', err.message);
    
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date(),
      database: 'disconnected',
      error: err.message
    });
  }
});

// Root API check endpoint
app.get(['/api', '/'], async (req, res) => {
  let databaseStatus;
  
  try {
    // Do a quick check but don't block
    await config.pool.query('SELECT 1');
    databaseStatus = 'connected';
  } catch (err) {
    databaseStatus = 'disconnected';
  }
  
  res.status(200).json({
    status: 'SimpleNotes API is running',
    timestamp: new Date(),
    databaseStatus,
    version: '1.0.0'
  });
});

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not found',
    message: `The requested endpoint ${req.path} does not exist`,
    path: req.path
  });
});

// Get PORT from config
const PORT = config.PORT;

// Start server
function startServer() {
  return app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
}

// Only start server if not being imported as a module
if (require.main === module) {
  // Test connection before starting but don't block startup
  config.testConnection()
    .then(() => {
      startServer();
    })
    .catch(() => {
      console.warn('Starting server despite database connection issues');
      startServer();
    });
}

// Add proper error handling to prevent server crashes
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  // Keep server running despite the error
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED PROMISE REJECTION:', err);
  // Keep server running despite the error
});

// Export the app for Vercel serverless functions
module.exports = app;