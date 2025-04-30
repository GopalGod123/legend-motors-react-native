// API Configuration
export const API_BASE_URL = 'https://api.staging.legendmotorsglobal.com/api/v1';

// API Key for authenticated requests
export const API_KEY = 'e40371f8f23b4d1fb86722c13245dcf60a7a9cd0377ca50ef58258d4a6ff7148';

// Define multiple possible image base URLs to try
const IMAGE_BASE_URLS = [
  'https://api.staging.legendmotorsglobal.com/api/v1',
  'https://api.staging.legendmotorsglobal.com/media',
  'https://api.staging.legendmotorsglobal.com',
  'https://api.staging.legendmotorsglobal.com/public/images',
  'https://api.staging.legendmotorsglobal.com/uploads'
];

// Export the primary one for direct use
export const API_IMAGE_BASE_URL = IMAGE_BASE_URLS[0];

// Function to get image headers
export const getImageHeaders = () => {
  return {
    'x-api-key': API_KEY
  };
};

// Use this function to construct correct image URLs based on the API response
export const getImageUrl = (path) => {
  if (!path) return null;
  
  // If path already starts with http(s), it's a full URL
  if (path.startsWith('http')) {
    console.log('Full URL detected:', path);
    return path;
  }
  
  // Clean the path - remove any duplicate slashes or spaces
  let cleanPath = path.trim();
  
  // Make sure path starts with a slash if it doesn't already
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }
  
  // Generate array of possible URLs to try
  const possibleUrls = IMAGE_BASE_URLS.map(baseUrl => 
    `${baseUrl}${cleanPath}`
  );
  
  console.log('Possible image URLs:', possibleUrls);
  
  // Return the primary URL (first one) - the CarImage component will handle fallbacks
  return possibleUrls[0];
};

// This function returns all possible URLs for a path, for components
// that want to try multiple fallbacks
export const getAllPossibleImageUrls = (path) => {
  if (!path) return [];
  
  // If path already starts with http(s), it's a full URL
  if (path.startsWith('http')) {
    return [path];
  }
  
  // Clean the path - remove any duplicate slashes or spaces
  let cleanPath = path.trim();
  
  // Make sure path starts with a slash if it doesn't already
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }
  
  // Generate array of possible URLs to try
  return IMAGE_BASE_URLS.map(baseUrl => `${baseUrl}${cleanPath}`);
};

export default {
  API_BASE_URL,
  API_IMAGE_BASE_URL,
  API_KEY,
  getImageUrl,
  getAllPossibleImageUrls,
  getImageHeaders
}; 