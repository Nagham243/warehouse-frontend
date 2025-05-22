import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const checkAuthStatus = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth-status/`);
    return response.data.authenticated;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};


const getCsrfToken = async () => {

  const cookies = document.cookie.split(';');
  let csrfToken = null;
  
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'XSRF-TOKEN' || name === 'csrftoken' || name === '_csrf') {
      csrfToken = decodeURIComponent(value);
      break;
    }
  }
  
  if (!csrfToken) {
    csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  }
  
  if (!csrfToken) {
    try {
      const { data } = await api.get('/csrf-token/');
      csrfToken = data.csrfToken;
    } catch (error) {
      console.warn('Failed to fetch CSRF token from API:', error);
    }
  }
  
  return csrfToken;
};

api.interceptors.request.use(async (config) => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, { 
    headers: config.headers,
    data: config.data
  });
  
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    try {
      const csrfToken = await getCsrfToken();
      
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
        config.headers['X-XSRF-TOKEN'] = csrfToken;
        config.headers['CSRF-Token'] = csrfToken;
        config.headers['X-CSRF-TOKEN'] = csrfToken;
      } else {
        console.warn('No CSRF token available for request');
      }
    } catch (error) {
      console.error('Error in CSRF token handling:', error);
    }
  }
  return config;
});

api.interceptors.response.use(
  response => {
    // For debugging, log the response
    console.log(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, { 
      data: response.data 
    });
    return response;
  },
  async (error) => {
    console.error('API Error', {
      request: {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        data: error.config?.data,
        headers: error.config?.headers
      },
      response: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      },
      message: error.message
    });
    
    if (error.response && error.response.status === 403) {
      const isAuthError = error.response.data && 
                         (error.response.data.code === 'auth_required' || 
                          error.response.data.detail === 'Authentication credentials were not provided.');
      
      if (isAuthError) {
        console.error('Authentication error. You need to log in.');
        return Promise.reject({
          isAuthError: true,
          ...error
        });
      }
    }
    return Promise.reject(error);
  }
);

const userService = {
  checkAuth: checkAuthStatus,
  
  login: async (credentials) => {
    try {
      const csrfToken = await getCsrfToken();
      if (csrfToken) {
        api.defaults.headers.common['X-CSRFToken'] = csrfToken;
      }
      
      const response = await api.post('/login/', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const response = await api.post('/api/logout/');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  getUsers: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.user_type) params.append('user_type', filters.user_type);
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
      if (filters.ordering) params.append('ordering', filters.ordering);
      
      const response = await api.get(`/users/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  getUser: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },
  
  createUser: async (userData) => {
    try {
      const csrfToken = await getCsrfToken();
      if (csrfToken) {
        api.defaults.headers.common['X-CSRFToken'] = csrfToken;
      }
      
      console.log("Creating user with data:", userData);
      const response = await api.post('/users/', userData);
      console.log("Create user response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      
      if (error.response) {
        console.error('Server responded with error data:', error.response.data);
        console.error('Status code:', error.response.status);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received from server:', error.request);
      }
      
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await api.patch(`/users/${userId}/`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  },
  
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  },
  
  suspendUser: async (userId) => {
    try {
      try {
        const response = await api.post(`/users/${userId}/suspend/`, { is_active: false });
        return response.data;
      } catch (endpointError) {
        console.log("Suspend endpoint failed, falling back to patch:", endpointError);
        const response = await api.patch(`/users/${userId}/`, { is_active: false });
        return response.data;
      }
    } catch (error) {
      console.error(`Error suspending user ${userId}:`, error);
      throw error;
    }
  },
  
  activateUser: async (userId) => {
    try {
      try {
        const response = await api.post(`/users/${userId}/activate/`, { is_active: true });
        return response.data;
      } catch (endpointError) {
        console.log("Activate endpoint failed, falling back to patch:", endpointError);
        const response = await api.patch(`/users/${userId}/`, { is_active: true });
        return response.data; 
      }
    } catch (error) {
      console.error(`Error activating user ${userId}:`, error);
      throw error;
    }
  },

  getUserStats: async (includeExtended = false) => {
    try {
      const params = includeExtended ? '?extended=true' : '';
      const response = await api.get(`/users/stats/${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },
  
  getFinancialManagers: async () => {
    try {
      const response = await api.get('/users/financial_managers/');
      return response.data;
    } catch (error) {
      console.error('Error fetching financial managers:', error);
      throw error;
    }
  },
  
  getTechnicalSupport: async () => {
    try {
      const response = await api.get('/users/technical_support/');
      return response.data;
    } catch (error) {
      console.error('Error fetching technical support:', error);
      throw error;
    }
  },
  
  getClients: async () => {
    try {
      const response = await api.get('/users/clients/');
      return response.data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },
  
  getVendors: async () => {
    try {
      const response = await api.get('/users/vendors/');
      return response.data;
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  }
};

export default userService;
