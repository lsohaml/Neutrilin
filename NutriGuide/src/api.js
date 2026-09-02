const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');

export async function api(path, options = {}) {
  const token = localStorage.getItem('neutrilin_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let data = null;
  try { data = await response.json(); } catch { /* empty response */ }
  if (!response.ok) throw new Error(data?.error || `Request failed (${response.status})`);
  return data;
}

export { API_BASE };
