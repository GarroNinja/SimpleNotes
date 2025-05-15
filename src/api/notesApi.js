// SimpleNotes API Client

/**
 * Determines the base API URL based on environment
 * - In production: Uses relative "/api" path for Vercel deployment 
 * - In development: Uses localhost or network IP for local testing
 */
const getApiBaseUrl = () => {
  // Environment-specific configuration
  const isProduction = process.env.NODE_ENV === 'production';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  );
  
  // First check for explicit environment variable
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // In production (on Vercel), use relative path
  if (isProduction) {
    return '/api';
  }
  
  // In development, use appropriate local URL
  return isMobile 
    ? 'http://192.168.68.110:5001/api' // For testing on mobile devices
    : 'http://localhost:5001/api';      // For local development
};

// Set up the API base URL
const API_BASE_URL = getApiBaseUrl();

// Log where API requests will go (for debugging)
console.log(`API configured to use: ${API_BASE_URL}`);

/**
 * Handles API requests with consistent error handling
 * @param {string} endpoint - API endpoint path (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise} - Promise resolving to JSON response
 */
const apiRequest = async (endpoint, options = {}) => {
  // Create the complete URL
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  // Default options
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    // Important: Include credentials for cookies/session if needed
    credentials: 'include',
  };
  
  // Merge options
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    // Log request (helpful for debugging)
    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    
    // Make the request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Parse the JSON response
    const data = await response.json();
    
    // Log response status
    console.log(`API Response: ${response.status} from ${url}`);
    
    // Handle error responses
    if (!response.ok) {
      throw new Error(data.error || `API error: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    // Special handling for timeout errors
    if (error.name === 'AbortError') {
      console.error(`Request timeout for ${url}`);
      throw new Error('Request timed out. Server took too long to respond.');
    }
    
    // Log all errors
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
};

/**
 * Get all active (non-archived) notes
 */
export const fetchNotes = () => {
  return apiRequest('notes');
};

/**
 * Get all archived notes
 */
export const fetchArchivedNotes = () => {
  return apiRequest('notes/archived');
};

/**
 * Create a new note
 * @param {Object} noteData - Note data including title, content, etc.
 */
export const createNote = (noteData) => {
  return apiRequest('notes', {
    method: 'POST',
    body: JSON.stringify(noteData),
  });
};

/**
 * Update an existing note
 * @param {number} id - Note ID
 * @param {Object} noteData - Updated note data
 */
export const updateNote = (id, noteData) => {
  return apiRequest(`notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(noteData),
  });
};

/**
 * Delete a note
 * @param {number} id - Note ID
 */
export const deleteNote = (id) => {
  return apiRequest(`notes/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Toggle archive status of a note
 * @param {number} id - Note ID
 * @param {boolean} archived - Whether to archive (true) or unarchive (false)
 */
export const toggleArchiveStatus = (id, archived) => {
  return apiRequest(`notes/${id}/archive`, {
    method: 'PATCH',
    body: JSON.stringify({ archived }),
  });
};

/**
 * Toggle pin status of a note
 * @param {number} id - Note ID
 * @param {boolean} isPinned - Whether to pin (true) or unpin (false)
 */
export const togglePinStatus = (id, isPinned) => {
  return apiRequest(`notes/${id}/pin`, {
    method: 'PATCH',
    body: JSON.stringify({ isPinned }),
  });
}; 