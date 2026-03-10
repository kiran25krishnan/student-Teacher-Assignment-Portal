const BASE = 'http://localhost:8000';

const h = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const safe = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail || data?.error || 'Request failed');
  return data;
};

export const authApi = {
  register: (data) =>
    fetch(`${BASE}/auth/register`, { method: 'POST', headers: h(), body: JSON.stringify(data) }).then(safe),

  login: (email, password) =>
    fetch(`${BASE}/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
    }).then(safe),
};

export const studentsApi = {
  getAll: (token) =>
    fetch(`${BASE}/students/`, { headers: h(token) }).then(safe),

  create: (token, data) =>
    fetch(`${BASE}/students/`, { method: 'POST', headers: h(token), body: JSON.stringify(data) }).then(safe),
};

export const marksApi = {
  getAll: (token, filters = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    );
    return fetch(`${BASE}/marks/?${params}`, { headers: h(token) }).then(safe);
  },
  create: (token, data) =>
    fetch(`${BASE}/marks/`, { method: 'POST', headers: h(token), body: JSON.stringify(data) }).then(safe),
  update: (token, id, data) =>
    fetch(`${BASE}/marks/${id}`, { method: 'PUT', headers: h(token), body: JSON.stringify(data) }).then(safe),
  delete: (token, id) =>
    fetch(`${BASE}/marks/${id}`, { method: 'DELETE', headers: h(token) }).then(safe),
};

export const leaveApi = {
  apply: (token, data) =>
    fetch(`${BASE}/leave/apply`, { method: 'POST', headers: h(token), body: JSON.stringify(data) }).then(safe),
  getAll: (token) =>
    fetch(`${BASE}/leave/`, { headers: h(token) }).then(safe),
  approve: (token, id) =>
    fetch(`${BASE}/leave/${id}/approve`, { method: 'PUT', headers: h(token) }).then(safe),
  reject: (token, id) =>
    fetch(`${BASE}/leave/${id}/reject`, { method: 'PUT', headers: h(token) }).then(safe),
};

export const reportApi = {
  get: (token, studentId) =>
    fetch(`${BASE}/report/${studentId}`, { headers: h(token) }).then(safe),
};

export function parseJwt(token) {
  try { return JSON.parse(atob(token.split('.')[1])); }
  catch { return null; }
}
