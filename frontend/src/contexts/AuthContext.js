import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/dashboard', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok || response.redirected) {
        // Try to get user info from session if available
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const { email, password } = credentials;
      
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: email, // Using email as username for this system
          password: password
        })
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        setUser({ username: email });
        return { success: true, user: { username: email } };
      } else {
        return {
          success: false,
          message: data.message || 'Login failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error: Could not connect to server'
      };
    }
  };

  const register = async (userData) => {
    try {
      const { email, password, confirm_password } = userData;
      
      // Validate password match
      if (password !== confirm_password) {
        return {
          success: false,
          message: 'Passwords do not match'
        };
      }

      // Validate password length
      if (password.length < 6) {
        return {
          success: false,
          message: 'Password must be at least 6 characters'
        };
      }

      const response = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: email,
          password: password,
          confirm_password: confirm_password
        })
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        setUser({ username: email });
        return { success: true, user: { username: email } };
      } else {
        return {
          success: false,
          message: data.message || 'Registration failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error: Could not connect to server'
      };
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:5001/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
