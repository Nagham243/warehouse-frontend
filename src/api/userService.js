import axios from 'axios';

console.log('🔧 Environment variables:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  NODE_ENV: import.meta.env.NODE_ENV,
  DEV: import.meta.env.DEV
});

const apiBaseURL = `${import.meta.env.VITE_API_URL}/api`;
console.log('🌐 API Base URL:', apiBaseURL);

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('✅ Axios instance created with baseURL:', api.defaults.baseURL);

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
  console.log('🔐 Starting CSRF token fetch...');
  
  // First try cookies
  const cookies = document.cookie.split(';');
  let csrfToken = null;
  
  console.log('🍪 Checking cookies:', document.cookie);
  
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'XSRF-TOKEN' || name === 'csrftoken' || name === '_csrf') {
      csrfToken = decodeURIComponent(value);
      console.log(`✅ Found CSRF token in cookie ${name}:`, csrfToken);
      break;
    }
  }
  
  // Try meta tag
  if (!csrfToken) {
    csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      console.log('✅ Found CSRF token in meta tag:', csrfToken);
    }
  }
  
  // Try API endpoint
  if (!csrfToken) {
    try {
      console.log('🌐 Fetching CSRF token from API endpoint...');
      console.log('API base URL:', api.defaults.baseURL);
      
      // Try different possible response structures
      const response = await api.get('/csrf-token/');
      console.log('📥 CSRF API response:', response);
      console.log('📊 Response data:', response.data);
      
      // Try different possible field names
      csrfToken = response.data?.csrfToken || 
                  response.data?.csrf_token || 
                  response.data?.token ||
                  response.data?.csrfmiddlewaretoken ||
                  response.data;
      
      if (csrfToken) {
        console.log('✅ Found CSRF token from API:', csrfToken);
      } else {
        console.warn('❌ No CSRF token found in API response');
      }
    } catch (error) {
      console.error('❌ Failed to fetch CSRF token from API:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
    }
  }
  
  console.log('🔐 Final CSRF token:', csrfToken);
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
        // Only use the most common CSRF header names that are likely allowed by CORS
        config.headers['X-CSRFToken'] = csrfToken;
        // Remove other headers that might not be allowed by CORS
        // config.headers['X-XSRF-TOKEN'] = csrfToken;
        // config.headers['CSRF-Token'] = csrfToken;
        // config.headers['X-CSRF-TOKEN'] = csrfToken;
        
        console.log('✅ CSRF token set in X-CSRFToken header');
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
  
  // Try login without CSRF first to test
  loginWithoutCSRF: async (credentials) => {
    try {
      console.log('🔑 Trying login WITHOUT CSRF token...');
      const response = await api.post('/login/', credentials);
      console.log('✅ Login without CSRF successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Login without CSRF failed:', error.response?.status, error.response?.data);
      throw error;
    }
  },
  
  login: async (credentials) => {
    try {
      console.log('🔑 Starting login process...');
      console.log('📋 Credentials:', { ...credentials, password: '[REDACTED]' });
      
      const csrfToken = await getCsrfToken();
      console.log('🔐 CSRF token for login:', csrfToken);
      
      if (!csrfToken) {
        console.warn('⚠️ No CSRF token available - this might cause 403 error');
      }
      
      // Try multiple approaches for CSRF token
      const requestConfig = {
        headers: {}
      };
      
      const loginData = { ...credentials };
      
      if (csrfToken) {
        // Try all common CSRF token methods
        requestConfig.headers['X-CSRFToken'] = csrfToken;
        requestConfig.headers['X-CSRF-TOKEN'] = csrfToken;
        loginData.csrfmiddlewaretoken = csrfToken;
        loginData.csrf_token = csrfToken;
        
        console.log('✅ CSRF token added to headers and body');
        console.log('📤 Request headers:', requestConfig.headers);
        console.log('📤 Request data:', { ...loginData, password: '[REDACTED]' });
      }
      
      console.log('🌐 Making login request to:', `${api.defaults.baseURL}/login/`);
      
      const response = await api.post('/login/', loginData, requestConfig);
      console.log('✅ Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Login error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        }
      });
      
      if (error.response?.status === 403) {
        console.error('🚫 403 Forbidden - Possible causes:');
        console.error('   1. Missing or invalid CSRF token');
        console.error('   2. Backend expects CSRF token in different format');
        console.error('   3. Session/authentication issue');
        console.error('   4. Backend CSRF validation configuration');
        
        // Try login without CSRF as fallback
        console.log('🔄 Trying login without CSRF token...');
        try {
          return await this.loginWithoutCSRF(credentials);
        } catch (fallbackError) {
          console.error('❌ Login without CSRF also failed');
          throw error; // throw original error
        }
      }
      
      throw error;
    }
  },
  
  logout: async () => {
    try {
      // Fixed: Remove duplicate /api prefix
      const response = await api.post('/logout/');
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
