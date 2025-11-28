import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/me');
      setUser(res.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Validate email format
      if (!email || !email.includes('@')) {
        return {
          success: false,
          message: 'Please enter a valid email address'
        };
      }

      // Validate password
      if (!password || password.length === 0) {
        return {
          success: false,
          message: 'Please enter your password'
        };
      }

      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      // Trigger cart update
      window.dispatchEvent(new Event('cartUpdated'));
      return { success: true, user: userData };
    } catch (error) {
      // Get error message from backend
      const errorMessage = error.response?.data?.message || '';
      
      // Use backend message directly if it's specific (Email is wrong / Password is wrong)
      if (errorMessage === 'Email is wrong' || errorMessage === 'Password is wrong') {
        return {
          success: false,
          message: errorMessage
        };
      }
      
      // Handle other errors
      let userFriendlyMessage = '';
      if (error.response?.status === 500) {
        userFriendlyMessage = 'Server error. Please try again later.';
      } else if (error.response?.status === 404) {
        userFriendlyMessage = 'User not found. Please register first.';
      } else if (errorMessage) {
        userFriendlyMessage = errorMessage;
      } else {
        userFriendlyMessage = 'Login failed. Please try again.';
      }

      return {
        success: false,
        message: userFriendlyMessage
      };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
        phone
      });
      // Don't auto-login after registration - user needs to login manually
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };


  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const refreshUser = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/me');
      setUser(res.data.user);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

