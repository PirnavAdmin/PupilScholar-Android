import React, { createContext, useContext, useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import { authenticateUser, MOCK_USERS, USER_ROLES } from '../data/mockUsers';
import { loginApi } from '../api/authApi';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import {
  saveAuthSession,
  getAuthSession,
  clearAuthSession,
  isSessionExpired,
  SESSION_EXPIRY_MS,
} from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const expiryTimerRef = useRef(null);

  /**
   * Clear any active expiration timer
   */
  const clearExpiryTimer = useCallback(() => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  }, []);

  /**
   * Logout handler
   * Cleans up token, persistent session storage, and active timers
   */
  const logout = useCallback(async (errorMessage = null) => {
    clearExpiryTimer();
    setUser(null);
    setAuthToken(null);
    await clearAuthSession();

    if (errorMessage) {
      setAuthError(errorMessage);
    } else {
      setAuthError(null);
    }
  }, [clearExpiryTimer]);

  /**
   * Schedules an automatic logout exactly when the 24-hour window lapses
   */
  const scheduleExpiryLogout = useCallback((expiresAt) => {
    clearExpiryTimer();

    if (!expiresAt || typeof expiresAt !== 'number') return;

    const delay = expiresAt - Date.now();
    if (delay <= 0) {
      // Already expired (> 24 hours)
      logout('Your session has expired after 24 hours. Please log in again.');
      return;
    }

    // Schedule exact countdown timer for logout
    expiryTimerRef.current = setTimeout(() => {
      logout('Your session has expired after 24 hours. Please log in again.');
    }, delay);
  }, [clearExpiryTimer, logout]);

  /**
   * Verify token validity against 24-hour expiration
   */
  const checkTokenExpiration = useCallback(async () => {
    try {
      const savedSession = await getAuthSession();
      if (!savedSession || isSessionExpired(savedSession)) {
        await logout('Your session has expired after 24 hours. Please log in again.');
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }, [logout]);

  // Initial session restoration and background listeners
  useEffect(() => {
    // 1. Wire 401 Unauthorized API interceptor to trigger immediate logout
    setUnauthorizedHandler(() => {
      logout('Your session has expired. Please log in again.');
    });

    // 2. Restore active session on app launch
    const restoreSession = async () => {
      try {
        const savedSession = await getAuthSession();
        if (savedSession && savedSession.user && savedSession.token) {
          if (isSessionExpired(savedSession)) {
            await logout('Your session has expired after 24 hours. Please log in again.');
            return;
          }

          setAuthToken(savedSession.token);
          setUser(savedSession.user);
          scheduleExpiryLogout(savedSession.expiresAt);
        }
      } catch {
        // Silently continue
      }
    };

    restoreSession();

    // 3. AppState listener: check expiration when user resumes the app from background
    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkTokenExpiration();
      }
    });

    // 4. Periodic background check every 60 seconds
    const intervalId = setInterval(() => {
      checkTokenExpiration();
    }, 60000);

    return () => {
      clearExpiryTimer();
      appStateSub.remove();
      clearInterval(intervalId);
    };
  }, [checkTokenExpiration, clearExpiryTimer, logout, scheduleExpiryLogout]);

  /**
   * Single Unified Login Handler
   * Connects to live SMS.Api with strict 24-hour session expiration
   */
  const login = async (identifier, password, portal = '') => {
    setIsLoading(true);
    setAuthError(null);

    const cleanId = (identifier || '').trim();
    const cleanPassword = password || '';

    try {
      // Step 1: Call live backend API
      const apiResponse = await loginApi(cleanId, cleanPassword, portal);

      if (apiResponse && apiResponse.user) {
        const liveUser = apiResponse.user;
        setUser(liveUser);
        setAuthError(null);
        setIsLoading(false);

        if (apiResponse.token) {
          const saveRes = await saveAuthSession(apiResponse.token, liveUser, SESSION_EXPIRY_MS);
          if (saveRes?.expiresAt) {
            scheduleExpiryLogout(saveRes.expiresAt);
          }
        }

        return { success: true, user: liveUser, isLive: true };
      }

      throw new Error('No user data returned from authentication server');
    } catch (apiErr) {
      // Step 2: If live login fails, check if input matches demo/mock credentials for fallback
      const mockResult = authenticateUser(cleanId, cleanPassword, portal);

      if (mockResult.success && mockResult.user) {
        const mockUser = { ...mockResult.user, isLiveBackend: false };
        setUser(mockUser);
        setAuthError(null);
        setIsLoading(false);

        const saveRes = await saveAuthSession('mock_token_24h', mockUser, SESSION_EXPIRY_MS);
        if (saveRes?.expiresAt) {
          scheduleExpiryLogout(saveRes.expiresAt);
        }

        return { success: true, user: mockUser, isLive: false };
      }

      // Step 3: Neither live API nor mock matched -> show backend error message
      const errorMsg =
        apiErr.message ||
        (apiErr.data && (apiErr.data.message || apiErr.data.error)) ||
        'Invalid email/mobile number or password.';

      setAuthError(errorMsg);
      setIsLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  /**
   * One-tap demo login helper with 24-hour expiration
   */
  const loginWithDemo = async (targetRole) => {
    setIsLoading(true);
    setAuthError(null);

    return new Promise((resolve) => {
      setTimeout(async () => {
        const demoUser = MOCK_USERS.find((u) => u.role === targetRole);
        if (demoUser) {
          const userWithFlag = { ...demoUser, isLiveBackend: false };
          setUser(userWithFlag);
          setAuthError(null);
          setIsLoading(false);

          const saveRes = await saveAuthSession('mock_demo_token', userWithFlag, SESSION_EXPIRY_MS);
          if (saveRes?.expiresAt) {
            scheduleExpiryLogout(saveRes.expiresAt);
          }

          resolve({ success: true, user: userWithFlag });
        } else {
          setAuthError('Demo user not found for role.');
          setIsLoading(false);
          resolve({ success: false });
        }
      }, 350);
    });
  };

  /**
   * Switch user role on the fly
   */
  const switchRole = (newRole) => {
    const targetUser = MOCK_USERS.find((u) => u.role === newRole);
    if (targetUser) {
      setUser({ ...targetUser, isLiveBackend: false });
    }
  };

  const clearError = () => setAuthError(null);

  const value = useMemo(
    () => ({
      user,
      role: user?.role || null,
      isAuthenticated: Boolean(user),
      isLiveBackend: Boolean(user?.isLiveBackend),
      isLoading,
      authError,
      login,
      loginWithDemo,
      logout,
      switchRole,
      clearError,
      availableRoles: USER_ROLES,
    }),
    [user, isLoading, authError, login, loginWithDemo, logout]
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
