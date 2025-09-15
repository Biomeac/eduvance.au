// Secure API client for frontend-backend communication
class ApiClient {
  constructor() {
    this.baseUrl = '/api';
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.session?.access_token) {
      this.setToken(data.session.access_token);
    }
    
    return data;
  }

  async logout() {
    if (this.token) {
      try {
        await this.request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ accessToken: this.token }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    this.clearToken();
  }

  // Resource methods
  async getSubjects() {
    return this.request('/subjects');
  }

  async getExamSessions() {
    return this.request('/exam-sessions');
  }

  async createResource(resourceData) {
    return this.request('/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData),
    });
  }

  async createPaper(paperData) {
    return this.request('/papers', {
      method: 'POST',
      body: JSON.stringify(paperData),
    });
  }

  // Community requests methods
  async getPendingRequests() {
    return this.request('/community-requests');
  }

  async approveRequest(id) {
    return this.request('/community-requests', {
      method: 'PUT',
      body: JSON.stringify({ id, action: 'approve' }),
    });
  }

  async rejectRequest(id, rejectionReason) {
    return this.request('/community-requests', {
      method: 'PUT',
      body: JSON.stringify({ id, action: 'reject', rejection_reason: rejectionReason }),
    });
  }

  async updateRequest(id, updateData) {
    return this.request('/community-requests', {
      method: 'PUT',
      body: JSON.stringify({ id, action: 'update', ...updateData }),
    });
  }

  // Watermark method
  async watermarkPdf(url) {
    const response = await fetch('/api/watermark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Watermark failed');
    }

    return response;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
