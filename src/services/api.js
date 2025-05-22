import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    }
  });

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("authToken");
      
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

const vendorService = {
  getAllVendors: () => api.get("/vendors/"),
  
  getVendorById: (id) => api.get(`/vendors/${id}/`),
  
  getUnverifiedVendors: () => api.get("/vendors/unverified_vendors/"),
  
  getClassificationSummary: () => api.get("/vendors/classification_summary/"),
  
  verifyVendor: (id, data) => api.post(`/vendors/${id}/verify/`, data),
  
  changeClassification: (id, classification) => api.post(`/vendors/${id}/change_classification/`, { classification }),
  
  uploadDocuments: (id, formData) => api.post(`/vendors/${id}/upload_documents/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }),
  
  updateWorkingHours: (id, workingHours) => api.post(`/vendors/${id}/update_working_hours/`, { working_hours: workingHours }),
  
  updateBranches: (id, branches) => api.post(`/vendors/${id}/update_branches/`, { branches }),
};

export default api;

export { vendorService };
