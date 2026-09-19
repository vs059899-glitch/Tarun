import { AnalyticsEvent, BusinessLead, ChatSession, DateFilterOption, LeadStatus } from '../types';

const ADMIN_TOKEN_KEY = 'resa_admin_token';

export const apiClient = {
  // ADMIN AUTH
  getAdminToken(): string | null {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },

  setAdminToken(token: string) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  },

  clearAdminToken() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  },

  async loginAdmin(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success && data.token) {
        this.setAdminToken(data.token);
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid credentials' };
    } catch {
      return { success: false, error: 'Connection error during login' };
    }
  },

  async verifyAdminSession(): Promise<boolean> {
    const token = this.getAdminToken();
    if (!token) return false;
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      return !!data.valid;
    } catch {
      return false;
    }
  },

  async logoutAdmin() {
    const token = this.getAdminToken();
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch {
        // ignore
      }
    }
    this.clearAdminToken();
  },

  // CHAT
  async sendChatMessage(params: {
    message: string;
    history: { role: 'user' | 'model'; parts: { text: string }[] }[];
    sessionId: string;
    userMode?: string;
  }) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      throw new Error(`Chat error: ${res.statusText}`);
    }
    return res.json();
  },

  // SESSIONS
  async createSession(id: string, deviceType: 'Desktop' | 'Mobile' | 'Tablet', userMode: string) {
    try {
      const res = await fetch('/api/analytics/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, deviceType, userMode })
      });
      return res.json();
    } catch (err) {
      console.warn('Failed to register session:', err);
    }
  },

  async updateSession(id: string, updates: Partial<ChatSession>) {
    try {
      const res = await fetch(`/api/analytics/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return res.json();
    } catch (err) {
      console.warn('Failed to update session:', err);
    }
  },

  async getSessions(): Promise<ChatSession[]> {
    const token = this.getAdminToken();
    const res = await fetch('/api/analytics/sessions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json();
  },

  // EVENTS
  async logEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>) {
    try {
      const res = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      return res.json();
    } catch (err) {
      console.warn('Failed to log event:', err);
    }
  },

  // LEADS
  async captureLead(payload: {
    fullName: string;
    email: string;
    companyName?: string;
    phone?: string;
    source?: string;
    sessionId?: string;
    uploadedFileStatus?: string;
    requirement?: string;
    productCategory?: string;
    estimatedQuantity?: string;
  }): Promise<{ success: boolean; message: string; lead: BusinessLead; isNew: boolean; error?: string }> {
    const res = await fetch('/api/leads/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to save lead information.');
    }
    return data;
  },

  async submitLead(lead: {
    fullName: string;
    companyName: string;
    phone: string;
    email: string;
    productCategory: string;
    requirement: string;
    estimatedQuantity?: string;
    sessionId?: string;
    uploadedFileStatus?: string;
    source?: string;
  }) {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit enquiry');
    }
    return data;
  },

  async getLeads(): Promise<BusinessLead[]> {
    const token = this.getAdminToken();
    const res = await fetch('/api/leads', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch leads');
    return res.json();
  },

  async getLeadDetails(id: string): Promise<{
    lead: BusinessLead;
    session?: ChatSession;
    events?: AnalyticsEvent[];
    notifications?: any[];
  }> {
    const token = this.getAdminToken();
    const res = await fetch(`/api/admin/leads/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch lead details');
    const data = await res.json();
    return data;
  },

  async getNotifications(): Promise<any[]> {
    const token = this.getAdminToken();
    const res = await fetch('/api/admin/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async updateLeadStatus(id: string, status: LeadStatus) {
    const token = this.getAdminToken();
    const res = await fetch(`/api/leads/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update lead status');
    return res.json();
  },

  // METRICS & CHARTS
  async getMetrics(dateRange: DateFilterOption, customStart?: string, customEnd?: string) {
    const token = this.getAdminToken();
    let url = `/api/analytics/metrics?range=${dateRange}`;
    if (customStart) url += `&start=${encodeURIComponent(customStart)}`;
    if (customEnd) url += `&end=${encodeURIComponent(customEnd)}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
  },

  // DEMO DATA
  async generateDemoData() {
    const token = this.getAdminToken();
    const res = await fetch('/api/admin/demo-data/generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to generate demo data');
    return res.json();
  },

  async clearDemoData() {
    const token = this.getAdminToken();
    const res = await fetch('/api/admin/demo-data/clear', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to clear demo data');
    return res.json();
  },

  // CSV EXPORT
  exportCsv(type: 'events' | 'leads' | 'sessions') {
    const token = this.getAdminToken();
    const url = `/api/admin/export/${type}`;
    // trigger download with token
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `resa_${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
  }
};
