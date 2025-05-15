// API service for communicating with the backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function for handling fetch responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }
  
  return data;
};

// Get all non-archived notes
export const fetchNotes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes`);
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
};

// Get all archived notes
export const fetchArchivedNotes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/archived`);
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching archived notes:', error);
    throw error;
  }
};

// Create a new note
export const createNote = async (noteData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
};

// Update an existing note
export const updateNote = async (id, noteData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

// Delete a note
export const deleteNote = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};

// Archive or unarchive a note
export const toggleArchiveStatus = async (id, archived) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${id}/archive`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ archived }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error toggling archive status:', error);
    throw error;
  }
};

// Toggle pin status
export const togglePinStatus = async (id, isPinned) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${id}/pin`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isPinned }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error toggling pin status:', error);
    throw error;
  }
}; 