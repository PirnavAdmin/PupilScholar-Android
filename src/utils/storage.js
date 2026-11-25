import AsyncStorage from '@react-native-async-storage/async-storage';

const REMEMBER_ME_STORAGE_KEY = '@pupil_remember_creds';
const AUTH_SESSION_STORAGE_KEY = '@pupil_auth_session';

// Strict 24-hour token lifetime requirement
export const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// In-memory memory store fallback ensures zero crashes or lost state
let memoryCache = null;
let sessionCache = null;

/**
 * Save credentials to persistent storage
 */
export const saveRememberedCredentials = async (identifier, password) => {
  const payload = {
    identifier: (identifier || '').trim(),
    password: password || '',
    rememberMe: true,
    updatedAt: new Date().toISOString(),
  };

  memoryCache = payload;

  try {
    if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
      await AsyncStorage.setItem(REMEMBER_ME_STORAGE_KEY, JSON.stringify(payload));
    }
    return { success: true };
  } catch (error) {
    // Graceful fallback to memory store if native storage is unavailable
    return { success: true, memoryOnly: true };
  }
};

/**
 * Retrieve saved credentials from persistent storage
 */
export const getRememberedCredentials = async () => {
  try {
    if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
      const raw = await AsyncStorage.getItem(REMEMBER_ME_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          memoryCache = parsed;
          return {
            identifier: parsed.identifier || '',
            password: parsed.password || '',
            rememberMe: true,
          };
        }
      }
    }
  } catch (error) {
    // Silently proceed to memory fallback
  }

  // Check memory cache
  if (memoryCache && typeof memoryCache === 'object') {
    return {
      identifier: memoryCache.identifier || '',
      password: memoryCache.password || '',
      rememberMe: true,
    };
  }

  return null;
};

/**
 * Remove saved credentials from persistent storage
 */
export const clearRememberedCredentials = async () => {
  memoryCache = null;
  try {
    if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
      await AsyncStorage.removeItem(REMEMBER_ME_STORAGE_KEY);
    }
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

/**
 * Check if a session has exceeded the 24-hour limit
 */
export const isSessionExpired = (session) => {
  if (!session) return true;
  const now = Date.now();
  if (session.expiresAt && typeof session.expiresAt === 'number') {
    return now >= session.expiresAt;
  }
  if (session.savedAt) {
    const savedTime = new Date(session.savedAt).getTime();
    if (!isNaN(savedTime)) {
      return now >= savedTime + SESSION_EXPIRY_MS;
    }
  }
  return true;
};

/**
 * Save user auth session with strict 24-hour expiration
 */
export const saveAuthSession = async (token, user, customExpiryMs = SESSION_EXPIRY_MS) => {
  const now = Date.now();
  const expiresAt = now + customExpiryMs;
  const session = {
    token,
    user,
    savedAt: new Date(now).toISOString(),
    expiresAt,
  };

  sessionCache = session;
  try {
    if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
      await AsyncStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
    }
    return { success: true, expiresAt };
  } catch (error) {
    return { success: true, memoryOnly: true, expiresAt };
  }
};

/**
 * Retrieve saved user auth session
 * Automatically clears and returns null if 24 hours have elapsed.
 */
export const getAuthSession = async () => {
  try {
    let session = null;

    if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
      const raw = await AsyncStorage.getItem(AUTH_SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          session = parsed;
        }
      }
    }

    if (!session && sessionCache) {
      session = sessionCache;
    }

    if (session) {
      // Validate 24-hour expiration window
      if (isSessionExpired(session)) {
        await clearAuthSession();
        return null;
      }

      sessionCache = session;
      return session;
    }
  } catch (error) {
    // Ignore and fallback
  }

  return null;
};

/**
 * Clear saved user auth session
 */
export const clearAuthSession = async () => {
  sessionCache = null;
  try {
    if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
      await AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    }
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};
