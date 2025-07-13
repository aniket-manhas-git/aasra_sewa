import React from 'react';
import { useAuth } from '../auth/AuthContext.jsx';

const AuthTest = () => {
  const { isAuthenticated, loading, user, logout } = useAuth();

  if (loading) {
    return <div>Loading authentication status...</div>;
  }

};

export default AuthTest; 