import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminUser');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Helper functions
const getAuthToken = () => {
  const user = localStorage.getItem('adminUser');
  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      return parsedUser.token;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

const handleApiResponse = (response) => {
  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.error || 'API request failed');
  }
};

const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response?.data?.detail) {
    throw new Error(error.response.data.detail);
  } else if (error.response?.data?.error) {
    throw new Error(error.response.data.error);
  } else {
    throw new Error(error.message || 'Network error occurred');
  }
};

// Authentication API
export const authAPI = {
  login: async (username, password, role) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
        role
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }
};

// Complaints API
export const complaintsAPI = {
  getComplaints: async (params = {}) => {
    try {
      const response = await api.get('/complaints', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  },

  getComplaint: async (complaintId) => {
    try {
      const response = await api.get(`/complaints/${complaintId}`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  },

  assignComplaint: async (complaintId, workerId, workerName) => {
    try {
      const response = await api.put(`/complaints/${complaintId}/assign`, {
        workerId,
        workerName
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  },

  transferComplaint: async (complaintId, department) => {
    try {
      const response = await api.put(`/complaints/${complaintId}/transfer`, {
        department
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  },

  updateComplaintStatus: async (complaintId, status, remarks = '', proofImages = []) => {
    try {
      const response = await api.put(`/complaints/${complaintId}/status`, {
        status,
        remarks,
        proofImages
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  },

  getAnalytics: async () => {
    try {
      const response = await api.get('/complaints/analytics');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }
};

// Users API
export const usersAPI = {
  getUsers: async (search = '') => {
    try {
      const response = await api.get('/users', {
        params: search ? { search } : {}
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  },

  getUser: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }
};

// Admin Management API
export const adminAPI = {
  getWorkers: async () => {
    try {
      const response = await api.get('/admin/workers');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  },

  createWorker: async (workerData) => {
    try {
      const response = await api.post('/admin/workers', workerData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  },

  updateWorker: async (workerId, workerData) => {
    try {
      const response = await api.put(`/admin/workers/${workerId}`, workerData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  },

  deactivateWorker: async (workerId) => {
    try {
      const response = await api.delete(`/admin/workers/${workerId}`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }
};

// File Upload API
export const uploadAPI = {
  uploadProofFiles: async (files) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await api.post('/upload/proof', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }
};

// Constants
export const DEPARTMENTS = [
  "Public Works",
  "Water Department",
  "Waste Management",
  "Traffic Management",
  "Parks & Recreation",
  "Building & Safety"
];

export const CATEGORIES = [
  "Infrastructure",
  "Water",
  "Sanitation",
  "Traffic",
  "Parks",
  "Building"
];

export default api;