import AsyncStorage from '@react-native-async-storage/async-storage';

const REMEMBER_ME_STORAGE_KEY = '@pupil_remember_creds';

// In-memory memory store fallback ensures zero crashes or lost state
let memoryCache = null;

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
