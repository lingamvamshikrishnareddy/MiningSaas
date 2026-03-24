import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - attach JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and refresh tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
        const { accessToken } = response.data.data.tokens || response.data.data;

        localStorage.setItem('accessToken', accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch {
        // Clear the entire auth store (removes auth-storage persist key too)
        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string; details?: any };
  meta?: { pagination?: PaginationMeta };
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<{ user: any; tokens: { accessToken: string; refreshToken: string } }>>('/auth/login', { email, password }),
  googleLogin: (idToken: string) =>
    apiClient.post<ApiResponse<{ user: any; tokens: any }>>('/auth/google', { idToken }),
  register: (data: any) =>
    apiClient.post<ApiResponse<{ user: any; tokens: any }>>('/auth/register', data),
  me: () => apiClient.get<ApiResponse<any>>('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.patch('/auth/change-password', { currentPassword, newPassword }),
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),
};

// Equipment API
export const equipmentApi = {
  getAll: (params?: any) => apiClient.get<ApiResponse<any[]>>('/equipment', { params }),
  getById: (id: string) => apiClient.get<ApiResponse<any>>(`/equipment/${id}`),
  create: (data: any) => apiClient.post<ApiResponse<any>>('/equipment', data),
  update: (id: string, data: any) => apiClient.put<ApiResponse<any>>(`/equipment/${id}`, data),
  delete: (id: string) => apiClient.delete(`/equipment/${id}`),
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/equipment/${id}/status`, { status }),
  getFleetOverview: () => apiClient.get<ApiResponse<any>>('/equipment/stats/overview'),
  getTelemetry: (id: string, hours?: number) =>
    apiClient.get(`/equipment/${id}/telemetry`, { params: { hours } }),
};

// Maintenance API
export const maintenanceApi = {
  getAll: (params?: any) => apiClient.get<ApiResponse<any[]>>('/maintenance', { params }),
  getById: (id: string) => apiClient.get<ApiResponse<any>>(`/maintenance/${id}`),
  create: (data: any) => apiClient.post<ApiResponse<any>>('/maintenance', data),
  update: (id: string, data: any) => apiClient.put<ApiResponse<any>>(`/maintenance/${id}`, data),
  delete: (id: string) => apiClient.delete(`/maintenance/${id}`),
  complete: (id: string, data: any) => apiClient.patch(`/maintenance/${id}/complete`, data),
  getStats: () => apiClient.get<ApiResponse<any>>('/maintenance/stats'),
  getUpcoming: (days?: number) => apiClient.get('/maintenance/upcoming', { params: { days } }),
  getOverdue: () => apiClient.get('/maintenance/overdue'),
};

// Telemetry API
export const telemetryApi = {
  getByEquipment: (equipmentId: string, params?: any) =>
    apiClient.get(`/telemetry/equipment/${equipmentId}`, { params }),
  getLatest: (equipmentId: string) =>
    apiClient.get(`/telemetry/equipment/${equipmentId}/latest`),
  getFleetLatest: (siteId?: string) =>
    apiClient.get('/telemetry/fleet/latest', { params: { siteId } }),
  getAlerts: () => apiClient.get('/telemetry/alerts'),
  getAverages: (equipmentId: string, hours?: number) =>
    apiClient.get(`/telemetry/equipment/${equipmentId}/averages`, { params: { hours } }),
  ingest: (data: any) => apiClient.post('/telemetry/ingest', data),
};

// Fuel API
export const fuelApi = {
  getAll: (params?: any) => apiClient.get('/fuel', { params }),
  getById: (id: string) => apiClient.get(`/fuel/${id}`),
  create: (data: any) => apiClient.post('/fuel', data),
  update: (id: string, data: any) => apiClient.put(`/fuel/${id}`, data),
  delete: (id: string) => apiClient.delete(`/fuel/${id}`),
  getSummary: (params?: any) => apiClient.get('/fuel/summary', { params }),
};

// Production API
export const productionApi = {
  getAll: (params?: any) => apiClient.get('/production', { params }),
  getById: (id: string) => apiClient.get(`/production/${id}`),
  create: (data: any) => apiClient.post('/production', data),
  update: (id: string, data: any) => apiClient.put(`/production/${id}`, data),
  delete: (id: string) => apiClient.delete(`/production/${id}`),
  getSummary: (params?: any) => apiClient.get('/production/summary', { params }),
};

// Inspections API
export const inspectionsApi = {
  getAll: (params?: any) => apiClient.get('/inspections', { params }),
  getById: (id: string) => apiClient.get(`/inspections/${id}`),
  create: (data: any) => apiClient.post('/inspections', data),
  update: (id: string, data: any) => apiClient.put(`/inspections/${id}`, data),
  delete: (id: string) => apiClient.delete(`/inspections/${id}`),
  getStats: () => apiClient.get('/inspections/stats'),
};

// Incidents API
export const incidentsApi = {
  getAll: (params?: any) => apiClient.get('/incidents', { params }),
  getById: (id: string) => apiClient.get(`/incidents/${id}`),
  create: (data: any) => apiClient.post('/incidents', data),
  update: (id: string, data: any) => apiClient.put(`/incidents/${id}`, data),
  close: (id: string, data: any) => apiClient.patch(`/incidents/${id}/close`, data),
  getStats: () => apiClient.get('/incidents/stats'),
};

// Analytics API
export const analyticsApi = {
  getDashboard: () => apiClient.get('/analytics/dashboard'),
  getKPI: () => apiClient.get('/analytics/kpi'),
  getProductionTrend: (params?: any) => apiClient.get('/analytics/production/trend', { params }),
  getMaintenanceCostTrend: (params?: any) => apiClient.get('/analytics/maintenance/cost-trend', { params }),
  getFuelTrend: (params?: any) => apiClient.get('/analytics/fuel/trend', { params }),
  getEquipmentUtilization: (params?: any) => apiClient.get('/analytics/equipment/utilization', { params }),
  getSafetyMetrics: (params?: any) => apiClient.get('/analytics/safety/metrics', { params }),
};

// Sites API
export const sitesApi = {
  getAll: (params?: any) => apiClient.get('/sites', { params }),
  getById: (id: string) => apiClient.get(`/sites/${id}`),
  create: (data: any) => apiClient.post('/sites', data),
  update: (id: string, data: any) => apiClient.put(`/sites/${id}`, data),
  delete: (id: string) => apiClient.delete(`/sites/${id}`),
  getZones: (id: string) => apiClient.get(`/sites/${id}/zones`),
};

// Users API
export const usersApi = {
  getAll: (params?: any) => apiClient.get('/users', { params }),
  getById: (id: string) => apiClient.get(`/users/${id}`),
  create: (data: any) => apiClient.post('/users', data),
  update: (id: string, data: any) => apiClient.put(`/users/${id}`, data),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
  updateRole: (id: string, role: string) => apiClient.patch(`/users/${id}/role`, { role }),
  setStatus: (id: string, isActive: boolean) => apiClient.patch(`/users/${id}/status`, { isActive }),
  getStats: () => apiClient.get('/users/stats'),
};

// Organizations API
export const organizationsApi = {
  getMyOrg: () => apiClient.get('/organizations/me'),
  update: (data: any) => apiClient.put('/organizations/me', data),
  getStats: () => apiClient.get('/organizations/me/stats'),
};

// Subscription & Billing API
export const subscriptionApi = {
  getPlans: () => apiClient.get('/subscriptions/plans'),
  getCurrent: () => apiClient.get('/subscriptions/current'),
  createOrder: (tier: string, billingCycle: string) =>
    apiClient.post('/subscriptions/create-order', { tier, billingCycle }),
  verifyPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => apiClient.post('/subscriptions/verify-payment', data),
  cancel: () => apiClient.post('/subscriptions/cancel'),
  getPaymentStatus: (orderId: string) => apiClient.get(`/subscriptions/payment-status/${orderId}`),
  getInvoices: () => apiClient.get('/subscriptions/invoices'),
  getInvoice: (id: string) => apiClient.get(`/subscriptions/invoices/${id}`),
  downloadInvoice: (id: string) =>
    apiClient.get(`/subscriptions/invoices/${id}/download`, { responseType: 'blob' }),
};

export default apiClient;
