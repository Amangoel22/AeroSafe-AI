/**
 * Centralized API client.
 * Automatically attaches the JWT token to every request if available.
 * All frontend API files should use this instead of raw fetch().
 */

const API_BASE = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem('aai_token');
}

/**
 * Makes an authenticated fetch request.
 * @param {string} path - API path, e.g. "/api/complaints"
 * @param {RequestInit} options - standard fetch options (method, body, headers, etc.)
 */
export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    // Attach token if present
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // Merge any caller-provided headers (but don't override Content-Type for FormData)
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  return res;
}
