import React, { createContext, useContext, useState, useMemo } from 'react';
import { authenticateUser, MOCK_USERS, USER_ROLES } from '../data/mockUsers';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  /**
   * Single Login handler
   * Works for Teacher, Student, and Parent.
   */
  const login = async (identifier, password, selectedRole = 'all') => {
    setIsLoading(true);
    setAuthError(null);

    return new Promise((resolve) => {
      // Simulate network latency for realistic UX
      setTimeout(() => {
        const result = authenticateUser(identifier, password, selectedRole);

        if (result.success) {
          setUser(result.user);
          setAuthError(null);
          setIsLoading(false);
          resolve({ success: true, user: result.user });
        } else {
          setAuthError(result.error);
          setIsLoading(false);
          resolve({ success: false, error: result.error });
        }
      }, 600);
    });
  };

  /**
   * One-tap demo login helper for seamless testing of each dashboard
   */
  const loginWithDemo = async (targetRole) => {
    setIsLoading(true);
    setAuthError(null);

    return new Promise((resolve) => {
      setTimeout(() => {
        const demoUser = MOCK_USERS.find((u) => u.role === targetRole);
        if (demoUser) {
          setUser(demoUser);
          setAuthError(null);
          setIsLoading(false);
          resolve({ success: true, user: demoUser });
        } else {
          setAuthError('Demo user not found for role.');
          setIsLoading(false);
          resolve({ success: false });
        }
      }, 400);
    });
  };

  /**
   * Logout handler
   */
  const logout = () => {
    setUser(null);
    setAuthError(null);
  };

  /**
   * Switch user role on the fly (handy for testing and multi-role admins)
   */
  const switchRole = (newRole) => {
    const targetUser = MOCK_USERS.find((u) => u.role === newRole);
    if (targetUser) {
      setUser(targetUser);
    }
  };

  const clearError = () => setAuthError(null);

  const value = useMemo(
    () => ({
      user,
      role: user?.role || null,
      isAuthenticated: Boolean(user),
      isLoading,
      authError,
      login,
      loginWithDemo,
      logout,
      switchRole,
      clearError,
      availableRoles: USER_ROLES,
    }),
    [user, isLoading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
