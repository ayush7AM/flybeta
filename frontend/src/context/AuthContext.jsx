import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserProfile, loginUser, registerUser } from '../services/api';
import { endTour } from '../components/tour/tour';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the user's profile and gamification stats
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('flybeta_access');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await getUserProfile();
      setUser(data);
    } catch (err) {
      console.warn('Could not fetch user profile:', err.message);
      // If unauthorized (401), the interceptor will try to refresh.
      // If refresh fails, it will dispatch 'flybeta:logout'.
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on app load
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Listen for custom logout event from axios interceptor (e.g. refresh failed)
  useEffect(() => {
    const handleLogoutEvent = () => {
      setUser(null);
    };
    window.addEventListener('flybeta:logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('flybeta:logout', handleLogoutEvent);
    };
  }, []);

  // Login method
  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await loginUser(username, password);
      localStorage.setItem('flybeta_access', data.access);
      localStorage.setItem('flybeta_refresh', data.refresh);
      await fetchUser();
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Invalid username or password.' 
      };
    }
  };

  // Register method
  const register = async (userData) => {
    setLoading(true);
    try {
      // 1. Register the user
      await registerUser(userData);
      // 2. Automatically log them in
      const data = await loginUser(userData.username, userData.password);
      localStorage.setItem('flybeta_access', data.access);
      localStorage.setItem('flybeta_refresh', data.refresh);
      await fetchUser();
      return { success: true };
    } catch (err) {
      setLoading(false);
      // Extract first error message from DRF validation
      let errorMsg = 'Registration failed.';
      if (err.response?.data) {
        const errors = Object.values(err.response.data);
        if (errors.length > 0 && Array.isArray(errors[0])) {
          errorMsg = errors[0][0];
        }
      }
      return { success: false, error: errorMsg };
    }
  };

  // Logout method
  const logout = () => {
    localStorage.removeItem('flybeta_access');
    localStorage.removeItem('flybeta_refresh');
    endTour();
    setUser(null);
  };

  // Update user stats directly (e.g. after lesson completion)
  const updateUser = useCallback((newStats) => {
    setUser((prev) => (prev ? { ...prev, ...newStats } : null));
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      updateUser, 
      refetchUser: fetchUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
