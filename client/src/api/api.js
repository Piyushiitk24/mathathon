import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
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
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (username) => api.post('/auth/login', { username }),
  getSession: () => api.get('/auth/session'),
  logout: () => api.post('/auth/logout'),
};

// Modules API calls
export const modulesAPI = {
  getAll: () => api.get('/modules'),
  getById: (id) => api.get(`/modules/${id}`),
};

// Questions API calls
export const questionsAPI = {
  getByModuleAndType: (moduleId, type) => api.get(`/questions/${moduleId}/${type}`),
  getById: (id) => api.get(`/questions/${id}`),
};

// Attempts API calls
export const attemptsAPI = {
  create: (attemptData) => api.post('/attempts', attemptData),
  getAll: () => api.get('/attempts'),
  getByUser: (username) => api.get(`/attempts/user/${username}`),
  getByModule: (moduleId) => api.get(`/attempts/module/${moduleId}`),
};

// Admin API calls
export const adminAPI = {
  addQuestion: (questionData, adminPassword) => 
    api.post('/admin/add-question', { ...questionData, admin_password: adminPassword }),
  
  getAttempts: (adminPassword) => 
    api.get('/admin/attempts', { 
      headers: { 'X-Admin-Password': adminPassword } 
    }),
  
  getStats: (adminPassword) => 
    api.get('/admin/stats', { 
      headers: { 'X-Admin-Password': adminPassword } 
    }),
  
  importCsv: (adminPassword) => 
    api.post('/admin/import-csv', { admin_password: adminPassword }),
};

// Utility functions
export const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear().toString().slice(-2);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${hours}${minutes} Hrs on ${day} ${month} ${year}`;
};

export const formatDisplayTime = (username, isoString) => {
  return `${username} at ${formatDateTime(isoString)}`;
};

export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

export const calculateScore = (answers, questions) => {
  let correct = 0;
  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.qId);
    if (question && question.correct_option === answer.chosen) {
      correct++;
    }
  });
  return correct;
};

export default api;
