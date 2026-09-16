// API Client for BDMS Department Portal FastAPI Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

async function handleResponse(response) {
  if (!response.ok) {
    let errorMsg = `Server error (${response.status})`;
    try {
      const errData = await response.json();
      if (errData.detail) {
        if (Array.isArray(errData.detail)) {
          errorMsg = errData.detail.map(e => e.msg).join(', ');
        } else {
          errorMsg = errData.detail;
        }
      }
    } catch {
      // fallback to status code message
    }
    throw new Error(errorMsg);
  }
  return await response.json();
}

export const api = {
  // Fetch maintenance requests for a department
  async getRequests(department, status) {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (status) params.append('status', status);
    
    const url = `${API_BASE_URL}/requests${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    return handleResponse(response);
  },

  // Fetch KPI stats for department
  async getDepartmentStats(department) {
    const response = await fetch(`${API_BASE_URL}/requests/stats?department=${encodeURIComponent(department)}`);
    return handleResponse(response);
  },

  // Fetch a single request by need_id
  async getRequestById(needId) {
    const response = await fetch(`${API_BASE_URL}/requests/${needId}`);
    return handleResponse(response);
  },

  // Create a new request
  async createRequest(payload) {
    const response = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  // Update an existing request
  async updateRequest(needId, payload) {
    const response = await fetch(`${API_BASE_URL}/requests/${needId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  // Submit a draft request
  async submitRequest(needId) {
    const response = await fetch(`${API_BASE_URL}/requests/${needId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  // Delete a draft request
  async deleteRequest(needId) {
    const response = await fetch(`${API_BASE_URL}/requests/${needId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

