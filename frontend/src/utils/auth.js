import axios from 'axios';

// Get JWT token from sessionStorage
export const getAuthToken = () => {
  return sessionStorage.getItem('jwtToken');
};

// Get user data from sessionStorage
export const getUserData = () => {
  const userData = sessionStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

// Check if user has specific permission
export const hasPermission = (permission) => {
  const userData = getUserData();
  if (!userData) return false;
  
  // Admin has all permissions
  if (userData.role === 'admin') return true;
  
  // Check specific permission
  return userData.permissions && userData.permissions[permission] === true;
};

// Check if user has any of the specified permissions
export const hasAnyPermission = (permissions) => {
  const userData = getUserData();
  if (!userData) return false;
  
  // Admin has all permissions
  if (userData.role === 'admin') return true;
  
  // Check if user has any of the specified permissions
  return permissions.some(permission => 
    userData.permissions && userData.permissions[permission] === true
  );
};

// Check if user has all specified permissions
export const hasAllPermissions = (permissions) => {
  const userData = getUserData();
  if (!userData) return false;
  
  // Admin has all permissions
  if (userData.role === 'admin') return true;
  
  // Check if user has all specified permissions
  return permissions.every(permission => 
    userData.permissions && userData.permissions[permission] === true
  );
};

// Setup axios interceptor to automatically add JWT token to requests
export const setupAuthInterceptor = () => {
  axios.interceptors.request.use(
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

  // Handle 401 responses (token expired or invalid)
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Token is invalid or expired, redirect to login
        sessionStorage.clear();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

// Logout function
export const logout = () => {
  sessionStorage.clear();
  window.location.href = '/login';
}; 