/**
 * Core Network API Client
 * Compatible with React / Vite apiClient signature and handles authenticated requests.
 */

import { API_BASE_URL, getApiBaseUrl, REQUEST_TIMEOUT_MS } from './config';

let activeToken = null;
let unauthorizedHandler = null;

/**
 * Configure global handler for 401 Unauthorized / token expiration
 */
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

/**
 * Configure the active authentication token
 */
export const setAuthToken = (token) => {
  activeToken = token;
};

/**
 * Get the current authentication token
 */
export const getAuthToken = () => {
  return activeToken;
};

/**
 * Core Request Fetcher
 */
export const apiFetch = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body = null,
    headers = {},
    timeoutMs = REQUEST_TIMEOUT_MS,
    token = activeToken,
  } = options;

  const baseUrl = (typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : API_BASE_URL) || API_BASE_URL;
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${(baseUrl || '').replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;

  const requestHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token && !requestHeaders['Authorization']) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const fetchOptions = {
    method,
    headers: requestHeaders,
    signal: controller.signal,
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    if (response.status === 204) {
      return { success: true, data: null, statusCode: 204 };
    }

    const contentType = response.headers.get('content-type') || '';
    let parsedData = null;

    if (contentType.includes('application/json')) {
      parsedData = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => '');
      try {
        parsedData = JSON.parse(text);
      } catch {
        parsedData = text;
      }
    }

    if (response.ok) {
      // Check if backend returned an internal failure payload like { success: false, message: "..." }
      if (parsedData && parsedData.success === false) {
        return {
          success: false,
          error: parsedData.message || parsedData.error || 'Request unsuccessful',
          statusCode: response.status,
          data: parsedData,
        };
      }

      return {
        success: true,
        data: parsedData,
        statusCode: response.status,
      };
    }

    // Extract precise error message
    let errorMessage = (parsedData && (parsedData.message || parsedData.error)) || null;

    if (!errorMessage && parsedData?.errors && typeof parsedData.errors === 'object') {
      const errorKeys = Object.keys(parsedData.errors);
      if (errorKeys.length > 0) {
        const firstVal = parsedData.errors[errorKeys[0]];
        errorMessage = Array.isArray(firstVal) ? firstVal[0] : String(firstVal);
      }
    }

    if (!errorMessage) {
      errorMessage =
        (parsedData && parsedData.title) ||
        `Request failed with status ${response.status}`;
    }

    // Trigger auto-logout if token is expired on protected routes
    if (
      response.status === 401 &&
      activeToken &&
      !String(activeToken).startsWith('mock_') &&
      !endpoint.includes('/login')
    ) {
      if (typeof unauthorizedHandler === 'function') {
        unauthorizedHandler();
      }
    }

    return {
      success: false,
      error: errorMessage,
      statusCode: response.status,
      data: parsedData,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const isTimeout = err.name === 'AbortError';

    return {
      success: false,
      error: isTimeout
        ? 'Connection timed out. Please check your network connection.'
        : 'Network connection error. Server may be unreachable.',
      isTimeout,
      isNetworkError: !isTimeout,
      originalError: err,
    };
  }
};

/**
 * Modern apiClient signature matching the web app implementation.
 * Returns the parsed response data or throws an Error on failure.
 */
export const apiClient = async (endpoint, options = {}) => {
  const result = await apiFetch(endpoint, options);
  if (!result.success) {
    const error = new Error(result.error || `Request failed with status ${result.statusCode || 500}`);
    error.status = result.statusCode;
    error.statusCode = result.statusCode;
    error.data = result.data;
    error.isNetworkError = result.isNetworkError;
    throw error;
  }
  return result.data;
};
