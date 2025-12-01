import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  logout: () => api.post('/logout'),
};

export const dashboardAPI = {
  getDashboardData: () => api.get('/dashboard'),
};

export const studentsAPI = {
  getStudents: () => api.get('/students'),
  addStudent: (studentData) => api.post('/students', studentData),
  updateStudent: (id, studentData) => api.put(`/students/${id}`, studentData),
  deleteStudent: (id) => api.delete(`/students/${id}`),
};

export const attendanceAPI = {
  getAttendance: () => api.get('/attendance'),
  markAttendance: (name) => api.post('/mark_attendance', { name }),
  markMultipleAttendance: (names) => api.post('/mark_multiple_attendance', { names }),
};

export const faceRecognitionAPI = {
  recognizeFaces: (imageData) => api.post('/recognize_faces', { image: imageData }),
  getCameras: () => api.get('/cameras'),
};

export const reportsAPI = {
  getReports: () => api.get('/reports'),
  exportCSV: () => api.get('/export_csv'),
};

export default api;
