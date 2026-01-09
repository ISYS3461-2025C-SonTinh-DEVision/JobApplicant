/**
 * HTTP Utility Class
 * Provides base functions for REST API requests (GET, POST, PUT, PATCH, DELETE)
 * Handles authentication headers, request/response interceptors, and error handling
 * 
 * Architecture Requirement A.2.c:
 * "The front-end must contain a REST HTTP Helper Class to provide a base function 
 * for conducting REST Requests such as GET, POST, PUT, PATCH, and DELETE"
 */

import { API_BASE_URL, DEFAULT_HEADERS, REQUEST_TIMEOUT, AUTH_CONFIG } from '../config/apiConfig';

class HttpUtil {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = { ...DEFAULT_HEADERS };
    this.timeout = REQUEST_TIMEOUT;
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  /**
   * Add request interceptor
   * @param {Function} interceptor - Function to intercept request config
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   * @param {Function} onSuccess - Function to handle successful response
   * @param {Function} onError - Function to handle error response
   */
  addResponseInterceptor(onSuccess, onError) {
    this.responseInterceptors.push({ onSuccess, onError });
  }

  /**
   * Get authentication token from localStorage
   * @returns {string|null} Token or null
   */
  getAuthToken() {
    return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  }

  /**
   * Set authentication token in localStorage
   * @param {string} token - JWT token
   */
  setAuthToken(token) {
    if (token) {
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    }
  }

  /**
   * Clear authentication tokens
   */
  clearTokens() {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  }

  /**
   * Build headers with authentication
   * @param {Object} customHeaders - Additional headers
   * @returns {Object} Headers object
   */
  buildHeaders(customHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    const token = this.getAuthToken();

    if (token) {
      headers['Authorization'] = `${AUTH_CONFIG.TOKEN_TYPE} ${token}`;
    }

    return headers;
  }

  /**
   * Apply request interceptors
   * @param {Object} config - Request configuration
   * @returns {Object} Modified configuration
   */
  async applyRequestInterceptors(config) {
    let modifiedConfig = { ...config };

    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig);
    }

    return modifiedConfig;
  }

  /**
   * Apply response interceptors
   * @param {Response} response - Fetch response
   * @param {Object} data - Response data
   * @returns {Object} Modified data
   */
  async applyResponseInterceptors(response, data) {
    let result = { response, data };

    for (const { onSuccess, onError } of this.responseInterceptors) {
      if (response.ok && onSuccess) {
        result = await onSuccess(result);
      } else if (!response.ok && onError) {
        result = await onError(result);
      }
    }

    return result;
  }

  /**
   * Create abort controller with timeout
   * @returns {AbortController}
   */
  createAbortController() {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), this.timeout);
    return controller;
  }

  /**
   * Parse response based on content type
   * @param {Response} response - Fetch response
   * @returns {Promise<any>} Parsed data
   */
  async parseResponse(response) {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return response.json();
    }

    if (contentType?.includes('text/')) {
      return response.text();
    }

    return response.blob();
  }

  /**
   * Handle HTTP error responses
   * @param {Response} response - Fetch response
   * @param {any} data - Response data
   * @throws {Error} HTTP error with details
   */
  handleError(response, data) {
    const error = new Error(data?.message || `HTTP Error: ${response.status}`);
    error.status = response.status;
    error.statusText = response.statusText;
    error.data = data;
    error.isHttpError = true;

    // Handle specific error codes
    switch (response.status) {
      case 401:
        error.message = data?.message || 'Unauthorized - Please login again';
        // Clear tokens on 401
        this.clearTokens();
        // Dispatch event for auth context to handle
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        break;
      case 403:
        error.message = data?.message || 'Forbidden - Access denied';
        break;
      case 404:
        error.message = data?.message || 'Resource not found';
        break;
      case 409:
        error.message = data?.message || 'Conflict - Resource already exists';
        break;
      case 422:
        error.message = data?.message || 'Validation error';
        error.validationErrors = data?.errors;
        break;
      case 429:
        error.message = data?.message || 'Too many requests - Please try again later';
        break;
      case 500:
        error.message = data?.message || 'Internal server error';
        break;
      default:
        break;
    }

    throw error;
  }

  /**
   * Make HTTP request
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<any>} Response data
   */
  async request(method, endpoint, options = {}) {
    const {
      body,
      headers = {},
      params = {},
      credentials = 'include', // Include cookies for HTTP-only cookie auth
      ...restOptions
    } = options;

    // Build URL with query parameters
    const url = new URL(endpoint, this.baseURL);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Handle arrays - append each value with same key for repeated params
        if (Array.isArray(value)) {
          value.forEach(item => {
            if (item !== undefined && item !== null) {
              url.searchParams.append(key, String(item));
            }
          });
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    });

    // Build request config
    let config = {
      method,
      headers: this.buildHeaders(headers),
      credentials,
      signal: this.createAbortController().signal,
      ...restOptions,
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        // Let browser set Content-Type for FormData
        delete config.headers['Content-Type'];
        config.body = body;
      } else {
        config.body = JSON.stringify(body);
      }
    }

    // Apply request interceptors
    config = await this.applyRequestInterceptors(config);

    try {
      const response = await fetch(url.toString(), config);
      const data = await this.parseResponse(response);

      // Apply response interceptors
      const result = await this.applyResponseInterceptors(response, data);

      if (!response.ok) {
        this.handleError(response, result.data);
      }

      return result.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timeout');
        timeoutError.isTimeout = true;
        throw timeoutError;
      }

      if (error.isHttpError) {
        throw error;
      }

      // Network error
      const networkError = new Error('Network error - Please check your connection');
      networkError.isNetworkError = true;
      networkError.originalError = error;
      throw networkError;
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @param {Object} options - Additional options
   * @returns {Promise<any>} Response data
   */
  get(endpoint, params = {}, options = {}) {
    return this.request('GET', endpoint, { params, ...options });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Additional options
   * @returns {Promise<any>} Response data
   */
  post(endpoint, body = {}, options = {}) {
    return this.request('POST', endpoint, { body, ...options });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Additional options
   * @returns {Promise<any>} Response data
   */
  put(endpoint, body = {}, options = {}) {
    return this.request('PUT', endpoint, { body, ...options });
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Additional options
   * @returns {Promise<any>} Response data
   */
  patch(endpoint, body = {}, options = {}) {
    return this.request('PATCH', endpoint, { body, ...options });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional options
   * @returns {Promise<any>} Response data
   */
  delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, options);
  }

  /**
   * Upload file(s)
   * @param {string} endpoint - API endpoint
   * @param {File|File[]} files - File(s) to upload
   * @param {Object} additionalData - Additional form data
   * @param {Object} options - Additional options
   * @returns {Promise<any>} Response data
   */
  upload(endpoint, files, additionalData = {}, options = {}) {
    const formData = new FormData();

    if (Array.isArray(files)) {
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });
    } else {
      formData.append('file', files);
    }

    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    return this.post(endpoint, formData, options);
  }
}

// Create singleton instance
const httpUtil = new HttpUtil();

// Export both class and singleton
export { HttpUtil };
export default httpUtil;

