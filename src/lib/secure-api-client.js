// src/lib/secure-api-client.js
// Secure API client for frontend-backend communication
// No API keys exposed to frontend

class SecureAPIClient {
  constructor() {
    this.baseURL = '/api';
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Public endpoints (no authentication required)
  async getSubjects() {
    return this.request('/subjects');
  }

  async getExamSessions() {
    return this.request('/exam-sessions');
  }

  async getResources(subjectId = null, resourceType = null) {
    const params = new URLSearchParams();
    if (subjectId) params.append('subject_id', subjectId);
    if (resourceType) params.append('resource_type', resourceType);
    
    const queryString = params.toString();
    return this.request(`/resources${queryString ? `?${queryString}` : ''}`);
  }

  async getPapers(subjectId = null, examSession = null) {
    const params = new URLSearchParams();
    if (subjectId) params.append('subject_id', subjectId);
    if (examSession) params.append('exam_session', examSession);
    
    const queryString = params.toString();
    return this.request(`/papers${queryString ? `?${queryString}` : ''}`);
  }

  async getCommunityRequests() {
    return this.request('/community-requests');
  }

  // Staff-only endpoints (require authentication)
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    const token = localStorage.getItem('staff_token');
    if (!token) return;

    try {
      await this.request('/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } finally {
      localStorage.removeItem('staff_token');
      localStorage.removeItem('staff_username');
    }
  }

  async createResource(resourceData) {
    const token = localStorage.getItem('staff_token');
    if (!token) throw new Error('Not authenticated');

    return this.request('/resources', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(resourceData),
    });
  }

  async createPaper(paperData) {
    const token = localStorage.getItem('staff_token');
    if (!token) throw new Error('Not authenticated');

    return this.request('/papers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(paperData),
    });
  }

  async getPendingRequests() {
    const token = localStorage.getItem('staff_token');
    if (!token) throw new Error('Not authenticated');

    return this.request('/community-requests', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async approveRequest(requestId) {
    const token = localStorage.getItem('staff_token');
    if (!token) throw new Error('Not authenticated');

    return this.request(`/community-requests/${requestId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async rejectRequest(requestId) {
    const token = localStorage.getItem('staff_token');
    if (!token) throw new Error('Not authenticated');

    return this.request(`/community-requests/${requestId}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async watermarkPdf(file) {
    const token = localStorage.getItem('staff_token');
    if (!token) throw new Error('Not authenticated');

    const formData = new FormData();
    formData.append('file', file);

    return this.request('/watermark', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
  }

  // Utility methods
  isAuthenticated() {
    return !!localStorage.getItem('staff_token');
  }

  getAuthToken() {
    return localStorage.getItem('staff_token');
  }

  getUsername() {
    return localStorage.getItem('staff_username');
  }
}

// Export singleton instance
export const apiClient = new SecureAPIClient();

// Legacy export for backward compatibility
export default apiClient;
