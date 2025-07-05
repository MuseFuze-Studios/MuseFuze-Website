import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });
    
    // Handle specific error cases
    // Don't automatically redirect on 401 - let the auth context handle it
    
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
  
  updateProfile: (data: { firstName?: string; lastName?: string; email?: string }) =>
    api.put('/users/profile', data),
  
  updateCookies: (data: { cookiesAccepted: boolean }) =>
    api.put('/users/cookies', data),
  
  getUserData: () => api.get('/users/data'),
  
  deleteAccount: () => api.post('/legal/delete-account'),
};

// Staff API
export const staffAPI = {
  // Announcements
  getAnnouncements: () => api.get('/staff/announcements'),
  
  // Bug Reports
  getBugs: () => api.get('/staff/bugs'),
  createBug: (data: any) => api.post('/staff/bugs', data),
  updateBug: (id: number, data: any) => api.put(`/staff/bugs/${id}`, data),
  deleteBug: (id: number) => api.delete(`/staff/bugs/${id}`),
  getTeamMembers: () => api.get('/staff/bugs/team-members'),
  
  // Game Builds
  getBuilds: () => api.get('/staff/builds'),
  downloadBuild: (id: number) => api.get(`/staff/builds/${id}/download`, { responseType: 'blob' }),
  
  // Reviews
  getReviews: (buildId: number) => api.get(`/staff/reviews/${buildId}`),
  createReview: (data: any) => api.post('/staff/reviews', data),
  updateReview: (id: number, data: any) => api.put(`/staff/reviews/${id}`, data),
  deleteReview: (id: number) => api.delete(`/staff/reviews/${id}`),
  
  // Messages
  getMessages: () => api.get('/staff/messages'),
  createMessage: (data: any) => api.post('/staff/messages', data),
  updateMessage: (id: number, data: any) => api.put(`/staff/messages/${id}`, data),
  getReplies: (postId: number) => api.get(`/staff/messages/${postId}/replies`),
  deleteMessage: (id: number) => api.delete(`/staff/messages/${id}`),
  
  // Playtest Sessions
  getPlaytestSessions: () => api.get('/staff/playtest/sessions'),
  createPlaytestSession: (data: any) => api.post('/staff/playtest/sessions', data),
  getPlaytestRSVP: (sessionId: number) => api.get(`/staff/playtest/${sessionId}/rsvp`),
  rsvpPlaytest: (sessionId: number, data: any) => api.post(`/staff/playtest/${sessionId}/rsvp`, data),
  
  // Download History
  getDownloadHistory: () => api.get('/staff/builds/downloads'),
  
  // Finance (Admin only)
  getTransactions: () => api.get('/staff/finance/transactions'),
  createTransaction: (data: any) => {
    console.log('Sending transaction data:', data);
    return api.post('/staff/finance/transactions', data);
  },
  getBudgets: () => api.get('/staff/finance/budgets'),
  createBudget: (data: any) => {
    console.log('Sending budget data:', data);
    return api.post('/staff/finance/budgets', data);
  },
  getForecasts: () => api.get('/staff/finance/forecasts'),
  getCompanyInfo: () => api.get('/staff/finance/company-info'),
  updateCompanyInfo: (data: any) => api.put('/staff/finance/company-info', data),
  getTaxReports: () => api.get('/staff/finance/tax-reports'),
  getTaxDeadlines: () => api.get('/staff/finance/tax-deadlines'),
  generateTaxReport: (data: any) => {
    console.log('Sending tax report data:', data);
    return api.post('/staff/finance/tax-report', data);
  },
};

// Contract API
export const contractAPI = {
  createTemplate: (data: { title: string; content: string }) =>
    api.post('/contracts/templates', data),
  getTemplates: () => api.get('/contracts/templates'),
  assignContract: (data: { userId: number; templateId: number }) =>
    api.post('/contracts/assign', data),
  getUserContracts: () => api.get('/contracts/user'),
  getUserContractsAdmin: (userId: number) => api.get(`/contracts/user/${userId}`),
  signContract: (id: number, fullName: string) =>
    api.post(`/contracts/sign/${id}`, { fullName }),
  requestChange: (data: { contractId: number; type: string; message: string }) =>
    api.post('/contracts/request', data),
  getRequests: (type?: string) =>
    api.get('/contracts/requests', { params: type ? { type } : {} }),
  getRequest: (id: number) => api.get(`/contracts/requests/${id}`),
  resolveRequest: (
    id: number,
    data: { outcome: string; notes: string; newContent?: string }
  ) => api.post(`/contracts/requests/${id}/resolve`, data),
  getDiff: (id: number) => api.get(`/contracts/${id}/diff`),
};

// Admin API
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (userId: number, role: string) =>
    api.put(`/admin/users/${userId}/role`, { role }),
  updateUser: (userId: number, data: any) =>
    api.put(`/admin/users/${userId}`, data),
  deleteUser: (userId: number) => api.delete(`/admin/users/${userId}`),
  getStats: () => api.get('/admin/stats'),
  getServerStatus: () => api.get('/admin/server-status'),
};

export default api;