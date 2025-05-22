import { useState, useEffect } from "react";
import axios from "axios";

const CommissionDebugger = () => {
  const [apiStatus, setApiStatus] = useState({
    status: "pending",
    message: "Initializing debug checks...",
    details: []
  });
  const [apiResponses, setApiResponses] = useState({});
  const [fixApplied, setFixApplied] = useState(false);

  const checkApiConnection = async () => {
    try {
      setApiStatus({
        status: "checking",
        message: "Checking API connection...",
        details: [...apiStatus.details, "Starting connection test"]
      });

      try {
        await axios.get("/api/csrf-token/", { withCredentials: true });
        setApiStatus(prev => ({
          ...prev,
          details: [...prev.details, "✅ CSRF token endpoint is accessible"]
        }));
      } catch (err) {
        setApiStatus(prev => ({
          ...prev,
          details: [...prev.details, "⚠️ CSRF token endpoint not accessible, might not be an issue if not using CSRF"]
        }));
      }

      try {
        const response = await axios.get("/api/commissions/", { 
          withCredentials: true,
          timeout: 5000
        });
        
        setApiResponses(prev => ({ ...prev, commissions: response.data }));
        
        setApiStatus(prev => ({
          ...prev,
          details: [...prev.details, `✅ Successfully connected to commissions API: ${response.status} ${response.statusText}`]
        }));
        
        return true;
      } catch (err) {
        console.error("API Connection Error:", err);
        
        const errorDetails = {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data
        };
        
        setApiStatus(prev => ({
          status: "error",
          message: "Failed to connect to API",
          details: [...prev.details, `❌ API Error: ${err.message}`, `Details: ${JSON.stringify(errorDetails)}`]
        }));
        
        return false;
      }
    } catch (err) {
      setApiStatus({
        status: "error",
        message: "Debug process failed",
        details: [...apiStatus.details, `❌ Unexpected error: ${err.message}`]
      });
      return false;
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get("/api/auth/user/", { withCredentials: true });
      setApiResponses(prev => ({ ...prev, user: response.data }));
      
      setApiStatus(prev => ({
        ...prev,
        details: [...prev.details, `✅ User is authenticated: ${response.data.username || "User"}`]
      }));
      
      return true;
    } catch (err) {
      setApiStatus(prev => ({
        ...prev,
        details: [...prev.details, `❌ Authentication issue: ${err.message}`]
      }));
      
      return false;
    }
  };
  const applyFix = async () => {
    setFixApplied(true);
    
    setApiStatus(prev => ({
      ...prev,
      details: [...prev.details, "🔧 Attempting to fix API connection..."]
    }));

    axios.defaults.withCredentials = true;
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    
    try {
      const response = await axios.get("/api/commissions/", {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      setApiResponses(prev => ({ ...prev, fixedCommissions: response.data }));
      
      setApiStatus(prev => ({
        status: "fixed",
        message: "Connection fixed successfully!",
        details: [...prev.details, "✅ API connection fixed"]
      }));
    } catch (err) {
      setApiStatus(prev => ({
        ...prev,
        details: [...prev.details, `❌ Fix attempt failed: ${err.message}`]
      }));
    }
  };

  const suggestFixes = () => {
    const suggestions = [
      {
        title: "Update API URL Base",
        description: "Ensure the API URL is correctly configured in frontend",
        code: `// In src/config.js or similar\nexport const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Then in your axios calls:
axios.get(\`\${API_BASE_URL}/api/commissions/\`)`
      },
      {
        title: "Add axios interceptor",
        description: "Set up an axios interceptor to handle authentication and errors",
        code: `// In src/api/axios.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized or other errors
    if (error.response && error.response.status === 401) {
      // Redirect to login or refresh token
      console.log('Authentication error, redirecting to login');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

// Then use this in your components:
// import api from '../api/axios';
// api.get('/commissions/')`
      },
      {
        title: "Update CORS settings in Django",
        description: "Ensure CORS is properly configured in your Django settings",
        code: `# In settings.py

INSTALLED_APPS = [
    # ...
    'corsheaders',
    # ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Make sure this is at the top
    # Other middleware follows
    # ...
]

# For development 
CORS_ALLOW_ALL_ORIGINS = True  # Only use in development!

# For production, specify allowed origins
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://yourdomain.com",
]

CORS_ALLOW_CREDENTIALS = True  # Important for cookies/authentication

# Also check if you need these settings
CSRF_COOKIE_SAMESITE = 'Lax'  # Or 'None' with Secure=True for cross-site requests
SESSION_COOKIE_SAMESITE = 'Lax'  # Or 'None' with Secure=True for cross-site requests
CSRF_COOKIE_HTTPONLY = False  # Allow JavaScript to access the CSRF token
CSRF_USE_SESSIONS = False  # Store CSRF token in cookie rather than in session`
      }
    ];
    
    return suggestions;
  };

  useEffect(() => {
    const runDebugSequence = async () => {
      await checkApiConnection();
      await checkAuthStatus();
    };
    
    runDebugSequence();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Commission API Debugger</h2>
      
      <div className={`p-4 rounded-lg mb-6 ${
        apiStatus.status === "error" ? "bg-red-100 border border-red-300" : 
        apiStatus.status === "fixed" ? "bg-green-100 border border-green-300" :
        "bg-blue-100 border border-blue-300"
      }`}>
        <h3 className="font-bold mb-2">{apiStatus.message}</h3>
        <div className="text-sm">
          {apiStatus.details.map((detail, index) => (
            <div key={index} className="py-1">{detail}</div>
          ))}
        </div>
      </div>
      
      {apiStatus.status === "error" && !fixApplied && (
        <button 
          onClick={applyFix}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors mb-6"
        >
          Attempt Automatic Fix
        </button>
      )}
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-bold text-lg mb-3">Suggested Fixes</h3>
        
        <div className="space-y-4">
          {suggestFixes().map((suggestion, index) => (
            <div key={index} className="border border-gray-200 rounded p-4">
              <h4 className="font-bold">{suggestion.title}</h4>
              <p className="text-gray-600 mb-2">{suggestion.description}</p>
              <pre className="bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">
                <code>{suggestion.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>
      
      {Object.keys(apiResponses).length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-3">API Responses</h3>
          
          <div className="space-y-4">
            {Object.entries(apiResponses).map(([key, value]) => (
              <div key={key} className="border border-gray-200 rounded p-4">
                <h4 className="font-bold mb-2">{key}</h4>
                <pre className="bg-gray-100 p-3 rounded overflow-x-auto max-h-60">
                  {JSON.stringify(value, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionDebugger;