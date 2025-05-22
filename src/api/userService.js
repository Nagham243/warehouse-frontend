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
      
      const response = await api.get('/csrf-token/');
      console.log('📥 CSRF API response:', response);
      console.log('📊 Response data:', response.data);
      
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

// CORS-safe CSRF token application function
const applyCsrfTokenSafely = async (config) => {
  try {
    const csrfToken = await getCsrfToken();
    
    if (csrfToken) {
      // Instead of using headers that might be blocked by CORS,
      // include CSRF token in the request body for POST requests
      if (config.method === 'post' && config.data) {
        if (typeof config.data === 'string') {
          try {
            const parsedData = JSON.parse(config.data);
            parsedData.csrfmiddlewaretoken = csrfToken;
            config.data = JSON.stringify(parsedData);
            console.log('✅ CSRF token added to request body');
          } catch (e) {
            console.warn('Could not parse request data as JSON for CSRF token injection');
          }
        } else if (typeof config.data === 'object') {
          config.data.csrfmiddlewaretoken = csrfToken;
          console.log('✅ CSRF token added to request body object');
        }
      }
      
      // For non-POST requests or as fallback, try safe headers first
      // Only use headers that are commonly allowed by CORS
      try {
        config.headers['X-CSRFToken'] = csrfToken;
        console.log('✅ CSRF token set in X-CSRFToken header (may be filtered by CORS)');
      } catch (headerError) {
        console.warn('Could not set CSRF header:', headerError);
      }
    } else {
      console.warn('No CSRF token available for request');
    }
  } catch (error) {
    console.error('Error in CSRF token handling:', error);
  }
  
  return config;
};

api.interceptors.request.use(async (config) => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, { 
    headers: config.headers,
    data: config.data
  });
  
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    config = await applyCsrfTokenSafely(config);
  }
  
  return config;
});

api.interceptors.response.use(
  response => {
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
  
  // Simplified login method that focuses on CORS compatibility
  login: async (credentials) => {
    try {
      console.log('🔑 Starting CORS-compatible login process...');
      console.log('📋 Credentials:', { ...credentials, password: '[REDACTED]' });
      
      // Method 1: Try with CSRF token in body only (most CORS-compatible)
      try {
        console.log('🎯 Attempt 1: Login with CSRF in body only...');
        const csrfToken = await getCsrfToken();
        
        const loginData = { 
          ...credentials,
          ...(csrfToken && { csrfmiddlewaretoken: csrfToken })
        };
        
        console.log('📤 Request data:', { ...loginData, password: '[REDACTED]' });
        
        // Create a request without custom headers to avoid CORS preflight
        const response = await axios.post(
          `${apiBaseURL}/login/`, 
          loginData,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
              // No custom headers to avoid CORS issues
            }
          }
        );
        
        console.log('✅ Login successful (method 1):', response.data);
        return response.data;
      } catch (method1Error) {
        console.log('❌ Method 1 failed:', method1Error.message);
        
        // Method 2: Try without CSRF token at all
        try {
          console.log('🎯 Attempt 2: Login without CSRF token...');
          const response = await axios.post(
            `${apiBaseURL}/login/`, 
            credentials,
            {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          
          console.log('✅ Login successful (method 2 - no CSRF):', response.data);
          return response.data;
        } catch (method2Error) {
          console.log('❌ Method 2 also failed:', method2Error.message);
          
          // Method 3: Try with form data instead of JSON
          try {
            console.log('🎯 Attempt 3: Login with form data...');
            const formData = new FormData();
            formData.append('username', credentials.username);
            formData.append('password', credentials.password);
            
            const csrfToken = await getCsrfToken();
            if (csrfToken) {
              formData.append('csrfmiddlewaretoken', csrfToken);
            }
            
            const response = await axios.post(
              `${apiBaseURL}/login/`, 
              formData,
              {
                withCredentials: true,
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
              }
            );
            
            console.log('✅ Login successful (method 3 - form data):', response.data);
            return response.data;
          } catch (method3Error) {
            console.error('❌ All login methods failed');
            console.error('Final error details:', {
              method1: method1Error.message,
              method2: method2Error.message,
              method3: method3Error.message
            });
            
            // Throw the most informative error
            throw method1Error;
          }
        }
      }
    } catch (error) {
      console.error('❌ Login process failed:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.error('🌐 Network Error - Possible causes:');
        console.error('   1. CORS headers not properly configured on backend');
        console.error('   2. Backend server not responding');
        console.error('   3. Preflight request being blocked');
        console.error('   4. Custom headers not allowed by Access-Control-Allow-Headers');
      }
      
      throw error;
    }
  },
  
  logout: async () => {
    try {
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
