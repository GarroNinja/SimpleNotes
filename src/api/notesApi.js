// API service for communicating with the backend

// Detect mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  typeof navigator !== 'undefined' ? navigator.userAgent : ''
);

// Determine the base URL
const determineBaseUrl = () => {
  // If an environment variable is set, use that
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Different URLs for mobile vs desktop
  // Note: Mobile devices might need the actual IP or accessible hostname
  // instead of localhost which only works on the device itself
  return isMobile 
    ? 'http://192.168.68.110:5001/api'  // Local network IP for real mobile devices
    : 'http://localhost:5001/api'; // This works for desktop browsers
};

const API_BASE_URL = determineBaseUrl();

// Log which API endpoint we're using - helps with debugging
console.log(`Using API endpoint: ${API_BASE_URL}, Mobile: ${isMobile}`);

// Helper function for handling fetch responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }
  
  return data;
};

// Custom fetch with timeout and retry
const fetchWithTimeout = async (url, options = {}, timeout = 15000, retries = 3) => {
  // On mobile, we might need a longer timeout and more retries
  if (isMobile) {
    timeout = 20000; // 20 seconds for mobile
    retries = 5;     // More retries for mobile
  }
  
  const controller = new AbortController();
  const { signal } = controller;
  
  // Add abort signal to options
  const fetchOptions = {
    ...options,
    signal,
  };
  
  // Set timeout
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.error(`Request to ${url} timed out after ${timeout}ms`);
      throw new Error(`Request timeout - server took too long to respond (${timeout}ms)`);
    }
    
    // If there are retries left and it's a network error (likely mobile connectivity issue)
    if (retries > 0) {
      console.log(`Retrying request to ${url}, ${retries} retries left. Error: ${error.message}`);
      
      // Wait a bit before retrying (exponential backoff)
      const delay = 1000 * Math.pow(2, 4 - retries); // 1s, 2s, 4s, 8s...
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return fetchWithTimeout(url, options, timeout, retries - 1);
    }
    
    throw error;
  }
};

// Get all non-archived notes
export const fetchNotes = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/notes`);
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
};

// Get all archived notes
export const fetchArchivedNotes = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/notes/archived`);
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching archived notes:', error);
    throw error;
  }
};

// Create a new note
export const createNote = async (noteData) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/notes`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/notes/${id}`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/notes/${id}`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/notes/${id}/archive`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/notes/${id}/pin`, {
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