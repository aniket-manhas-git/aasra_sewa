import React, { createContext, useContext, useEffect, useState } from "react";
import apiService from "../services/api.js";

const AuthContext = createContext({
  isAuthenticated: null,
  loading: true,
  user: null,
  login: () => {},
  logout: () => {},
  register: () => {},
  refreshAuth: () => {},
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const login = async (credentials) => {
    // Clear previous auth state immediately when login starts
    setIsAuthenticated(false);
    setUser(null);
    setLoading(true);
    try {
      const response = await apiService.login(credentials);
      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        console.log("[AuthContext] Login success:", response.data.user);
        return { success: true, data: response.data };
      } else {
        setIsAuthenticated(false);
        setUser(null);
        console.log("[AuthContext] Login failed:", response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      console.log("[AuthContext] Login failed:", error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      setIsAuthenticated(false);
      setUser(null);
      console.log("[AuthContext] Logout success");
      return { success: true };
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      console.log("[AuthContext] Logout failed:", error.message);
      return { success: false, error: error.message };
    }
  };

  const refreshAuth = async () => {
    try {
      setLoading(true);
      const authResult = await apiService.checkAuth();
      setIsAuthenticated(authResult.isAuthenticated);
      setUser(authResult.user || null);
      console.log("[AuthContext] refreshAuth:", authResult);
    } catch (error) {
      console.error("[AuthContext] Auth refresh error:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        user,
        login,
        logout,
        register,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
