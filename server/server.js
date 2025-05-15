const express = require('express');
const cors = require('cors');
const { pool, PORT } = require('./config');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Database connection error:', err.stack));

// Routes

// Get all notes
app.get('/api/notes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notes WHERE archived = false ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ error: 'An error occurred while fetching notes' });
  }
});

// Get archived notes
app.get('/api/notes/archived', async (req, res) => {
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
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});