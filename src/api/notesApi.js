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
  const port = 5002; // Updated to match actual server port
  return isMobile 
    ? `http://192.168.68.110:${port}/api` // For testing on mobile devices
    : `http://localhost:${port}/api`;     // For local development
};

// Set up the API base URL
const API_BASE_URL = getApiBaseUrl();

// Log where API requests will go (for debugging)
console.log(`API configured to use: ${API_BASE_URL}`);

// Check if we're having connectivity issues
let hasConnectivityIssue = false;
let lastApiSuccess = Date.now();

/**
 * Detects connectivity issues between frontend and API server
 */
const checkConnectivity = async () => {
  // If we've had a successful API call in the last 5 seconds, connectivity is fine
  if (Date.now() - lastApiSuccess < 5000) return true;
  
  console.log('Checking API connectivity...');
  
  try {
    // Simple health check
    const url = `${API_BASE_URL}/health`;
    console.log('Trying health check at:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      redirect: 'follow',
      referrerPolicy: 'no-referrer'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('API connectivity check: OK', data);
      hasConnectivityIssue = false;
      lastApiSuccess = Date.now();
      return true;
    } else {
      console.error('API connectivity check: Error response', response.status);
      hasConnectivityIssue = true;
      return false;
    }
  } catch (error) {
    console.error('API connectivity check failed:', error);
    hasConnectivityIssue = true;
    return false;
  }
};

// Check connectivity immediately and periodically
checkConnectivity();
setInterval(checkConnectivity, 30000);

/**
 * Creates an exponential backoff delay with jitter
 */
const createBackoffDelay = (retryNumber, baseDelay = 500) => {
  // Calculate exponential backoff with a small amount of jitter
  const expDelay = baseDelay * Math.pow(1.5, retryNumber);
  const jitter = Math.random() * 300;
  return Math.min(expDelay + jitter, 10000); // Cap at 10 seconds
};

/**
 * Handles API requests with consistent error handling and retries
 */
const apiRequest = async (endpoint, options = {}) => {
  // Create the complete URL
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  console.log('API Request to:', url);
  
  // Default options
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    // Set proper CORS mode for local development
    mode: 'cors',
    credentials: 'omit'
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
  
  // Retry configuration
  const MAX_RETRIES = 2;
  let retries = 0;
  let lastError = null;
  
  // If we know we have connectivity issues, check first before trying request
  if (hasConnectivityIssue) {
    const isConnected = await checkConnectivity();
    if (!isConnected) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
  }
  
  while (retries <= MAX_RETRIES) {
    try {
      // Log request attempt (helpful for debugging)
      if (retries > 0) {
        console.log(`API Request retry #${retries}: ${options.method || 'GET'} ${url}`);
      } else {
        console.log(`API Request: ${options.method || 'GET'} ${url}`);
      }
      
      // Make the request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Parse the JSON response
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Invalid response from server. Please try again.');
      }
      
      // Log response status
      console.log(`API Response: ${response.status} from ${url}`);
      
      // Handle error responses
      if (!response.ok) {
        // Special handling for database connection issues
        if (response.status === 503 && data.error?.includes('Database')) {
          throw new Error('The database is temporarily unavailable. Please try again in a moment.');
        }
        
        throw new Error(data.error || data.message || `API error: ${response.status}`);
      }
      
      // Mark successful API call
      lastApiSuccess = Date.now();
      hasConnectivityIssue = false;
      
      return data;
    } catch (error) {
      lastError = error;
      
      // Special handling for timeout errors
      if (error.name === 'AbortError') {
        console.error(`Request timeout for ${url}`);
        if (retries < MAX_RETRIES) {
          retries++;
          const delay = createBackoffDelay(retries);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw new Error('Request timed out. Server took too long to respond.');
      }
      
      // Network errors - these are retryable
      if (
        error.message === 'Failed to fetch' || 
        error.message === 'Network Error' || 
        error.message.includes('network') ||
        error.name === 'TypeError'
      ) {
        if (retries < MAX_RETRIES) {
          retries++;
          hasConnectivityIssue = true;
          
          const delay = createBackoffDelay(retries, 1000);
          console.log(`Retrying API request (${retries}/${MAX_RETRIES}) in ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      // Service unavailable errors - also retryable
      if (error.message.includes('unavailable') || error.message.includes('503')) {
        if (retries < MAX_RETRIES) {
          retries++;
          // Linear backoff for unavailable services
          const delay = 1000 * retries;
          console.log(`Retrying API request (${retries}/${MAX_RETRIES}) in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // Log all errors
      console.error(`API request failed for ${url}:`, error);
      throw error;
    }
  }
  
  // This should never be reached, but just in case
  throw lastError || new Error('Failed to complete API request after multiple retries');
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