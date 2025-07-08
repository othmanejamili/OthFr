// Updated AuthContext.js with improved password reset functionality and error handling
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// API URL - you can change this easily if needed
const API_URL = 'http://127.0.0.1:8000/api';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Check for token in localStorage on initial load
    const checkAuth = () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setCurrentUser(parsedUser);
          setIsAuthenticated(true);
          
          // Set default auth header for all axios requests
          axios.defaults.headers.common['Authorization'] = `Token ${token}`;
        } catch (err) {
          console.error('Error parsing stored user data:', err);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  const login = async (username, password, rememberMe = false) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting login with:', { username, password: '********' }); // Log for debugging
      
      // Make login request
      const response = await axios.post(`${API_URL}/login/`, {
        username,
        password
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Login response:', response.data); // Log success response
      
      const { token, user_id, username: user, is_admin } = response.data;
      
      // Store auth data
      const userData = { id: user_id, username: user, isAdmin: is_admin };
      
      if (rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // Use sessionStorage if not remembering
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(userData));
      }
      
      // Set auth header for subsequent requests
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      
      setCurrentUser(userData);
      setIsAuthenticated(true);
      setError('');
      
      return { success: true, userId: user_id, isAdmin: is_admin };
    } catch (err) {
      console.error('Login error:', err); // Detailed error in console
      
      // More detailed error handling
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error data:', err.response.data);
        console.error('Error status:', err.response.status);
        
        if (err.response.status === 401) {
          setError('Invalid username or password');
        } else if (err.response.data && err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError(`Server error: ${err.response.status}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Error request:', err.request);
        setError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        console.error('Error message:', err.message);
        setError('Request error: ' + err.message);
      }
      
      return { success: false };
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    // Clear both localStorage and sessionStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // Clear auth header
    delete axios.defaults.headers.common['Authorization'];
    
    setCurrentUser(null);
    setIsAuthenticated(false);
  };
  
  // PASSWORD RESET FUNCTIONS WITH IMPROVED ERROR HANDLING
  
  // Step 1: Request a password reset
  const requestPasswordReset = async (email) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Requesting password reset for email:', email);
      
      const response = await axios.post(`${API_URL}/request-password-reset/`, {
        email
      });
      
      console.log('Password reset request response:', response.data);
      return { success: true, message: response.data.message || 'Reset code sent to your email' };
    } catch (err) {
      console.error('Password reset request error:', err);
      
      let errorMessage = 'Failed to send reset code';
      
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        
        if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.status === 404) {
          errorMessage = 'Email not found in our records';
        } else {
          errorMessage = `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = 'Request error: ' + err.message;
      }
      
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Step 2: Verify the reset code
  const verifyResetCode = async (email, code) => {
    setLoading(true);
    setError('');
    
    try {
      // Add trimming to remove any accidental whitespace
      const trimmedEmail = email.trim();
      const trimmedCode = code.trim();
      
      console.log('Verifying reset code:', { email: trimmedEmail, code: trimmedCode });
      
      const response = await axios.post(`${API_URL}/verify-reset-code/`, {
        email: trimmedEmail,
        code: trimmedCode
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Code verification response:', response.data);
      return { success: true, message: response.data.message || 'Code verified successfully' };
    } catch (err) {
      console.error('Code verification error:', err);
      
      let errorMessage = 'Invalid or expired verification code';
      
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        
        if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data && typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.status === 400) {
          errorMessage = 'Invalid verification code format or expired code';
        }
      } else if (err.request) {
        console.error('Error request:', err.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = 'Request error: ' + err.message;
      }
      
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Step 3: Reset the password with the verified code
  const resetPassword = async (email, code, newPassword) => {
    setLoading(true);
    setError('');
    
    try {
      // Trim inputs to prevent whitespace issues
      const trimmedEmail = email.trim();
      const trimmedCode = code.trim();
      
      console.log('Resetting password:', { email: trimmedEmail, code: trimmedCode, newPassword: '********' });
      
      const response = await axios.post(`${API_URL}/reset-password/`, {
        email: trimmedEmail,
        code: trimmedCode,
        new_password: newPassword
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Password reset response:', response.data);
      return { success: true, message: response.data.message || 'Password reset successfully' };
    } catch (err) {
      console.error('Password reset error:', err);
      
      let errorMessage = 'Failed to reset password';
      
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        
        if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data && typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = 'Request error: ' + err.message;
      }
      
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  const createAdmin = async (username, email, password) => {
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/create-admin/`, {
        username,
        email,
        password
      });
      
      return { success: true, message: response.data.message };
    } catch (err) {
      console.error('Create admin error:', err);
      
      let errorMessage = 'Failed to create admin';
      
      if (err.response && err.response.data && err.response.data.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Check API status
  const checkApiStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/status/`);
      return { online: true, message: response.data.message || 'API is online' };
    } catch (err) {
      console.error('API status check failed:', err);
      return { 
        online: false, 
        message: 'API appears to be offline or unreachable' 
      };
    }
  };
  
  // Validate current token
  const validateToken = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
      return false;
    }
    
    try {
      // Replace with your actual token validation endpoint
      const response = await axios.get(`${API_URL}/validate-token/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      return response.data.valid;
    } catch (err) {
      console.error('Token validation error:', err);
      // If token validation fails, clean up any invalid tokens
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
      return false;
    }
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        loading, 
        error, 
        login, 
        logout, 
        createAdmin,
        checkApiStatus,
        validateToken,
        isAuthenticated,
        isAdmin: currentUser?.isAdmin,
        // Password reset functions
        requestPasswordReset,
        verifyResetCode,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};