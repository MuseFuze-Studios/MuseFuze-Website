import axios from 'axios';

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // Check for explicit environment variable first
  if (import.meta.env.VITE_API_URL) {
    console.log('🔧 Using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // In production, determine from hostname
  if (import.meta.env.PROD) {
    const hostname = window.location.hostname;
    console.log('🌐 Production hostname:', hostname);
    
    // For musefuzestudios.com, use the same origin with /api path
    // This assumes your backend is serving from the same server
    if (hostname === 'musefuzestudios.com' || hostname === 'www.musefuzestudios.com') {
      return `${window.location.protocol}//${hostname}/api`;
    }
    
    // Netlify deployments - use same origin
    if (hostname.includes('netlify.app')) {
      return `${window.location.protocol}//${hostname}/api`;
    }
    
    // Fallback for other production environments
    return `${window.location.protocol}//${hostname}/api`;
  }
  
  // Development fallback
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🔧 Environment:', import.meta.env.MODE);
console.log('🏗️ Production:', import.meta.env.PROD);
console.log('🌍 Current hostname:', window.location.hostname);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Track if we're already redirecting to prevent loops
let isRedirecting = false;

// Request interceptor to add debugging
api.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log(`📍 Full URL: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: `${error.config?.baseURL}${error.config?.url}`,
      message: error.message,
      data: error.response?.data
    });

    // Handle specific error types
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.error('🚨 Network/CORS Error detected. Possible causes:');
      console.error('   - Backend server is not running');
      console.error('   - CORS not properly configured');
      console.error('   - Wrong API URL');
      console.error('   - Firewall blocking requests');
      console.error('   - API subdomain not configured');
      
      // Show user-friendly error
      if (import.meta.env.PROD) {
        console.error('🔧 Production troubleshooting:');
        console.error('   - Check if backend is deployed and running');
        console.error('   - Verify API domain configuration');
        console.error('   - Check server logs for errors');
      }
    }

    if (error.response?.status === 404) {
      console.error('🚨 404 Error - API endpoint not found:');
      console.error(`   - Requested: ${error.config?.baseURL}${error.config?.url}`);
      console.error('   - Check if backend server is running');
      console.error('   - Verify API routes are properly configured');
    }

    // Only redirect on 401 for protected routes
    if (error.response?.status === 401 && !isRedirecting) {
      const currentPath = window.location.pathname;
      const isAuthPage = ['/login', '/signup'].includes(currentPath);
      const isProtectedPage = ['/dashboard'].includes(currentPath);
      
      if (isProtectedPage && !isAuthPage) {
        isRedirecting = true;
        window.location.href = '/login';
        
        setTimeout(() => {
          isRedirecting = false;
        }, 1000);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    cookiesAccepted: boolean;
  }) => api.post('/auth/register', userData),
  
  logout: () => api.post('/auth/logout'),
  
  me: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  getUserData: () => api.get('/users/data'),
};

// Staff API
export const staffAPI = {
  // Game builds
  getBuilds: () => api.get('/staff/builds'),
  uploadBuild: (formData: FormData) =>
    api.post('/staff/builds', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteBuild: (id: number) => api.delete(`/staff/builds/${id}`),
  
  // Message board
  getMessages: () => api.get('/staff/messages'),
  getReplies: (postId: number) => api.get(`/staff/messages/${postId}/replies`),
  createMessage: (data: { title: string; content: string; parentId?: number }) =>
    api.post('/staff/messages', data),
  updateMessage: (id: number, data: { title: string; content: string }) =>
    api.put(`/staff/messages/${id}`, data),
  deleteMessage: (id: number) => api.delete(`/staff/messages/${id}`),
};

export default api;