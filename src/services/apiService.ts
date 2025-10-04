import axios from 'axios';
import { Application } from '../types';

// AFTER
const API_BASE_URL =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||     // legacy name if you used it before
  '/api';   

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function asArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as any).data)) {
    return (payload as any).data as T[];
  }
  // If server sent HTML or an error JSON, throw with a helpful sample:
  const sample = typeof payload === 'string' ? payload.slice(0, 200) : payload;
  throw new Error('Expected array from API, got: ' + JSON.stringify(sample));
}

export interface ApiApplication {
  _id: string;
  name: string;
  vendor: string;
  version?: string;
  category?: string;
  addedDate: string;
  createdAt: string;
  updatedAt: string;
}

// Convert MongoDB application to frontend format
const convertToFrontendApp = (apiApp: ApiApplication): Application => ({
  id: apiApp._id,
  name: apiApp.name,
  vendor: apiApp.vendor,
  version: apiApp.version,
  category: apiApp.category,
  addedDate: apiApp.addedDate,
});

let tokenProvider: null | (() => Promise<string | null>) = null;

export function setAuthTokenProvider(fn: () => Promise<string | null>) {
  tokenProvider = fn;
}

api.interceptors.request.use(async (config) => {
  if (tokenProvider) {
    try {
      const token = await tokenProvider();
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore; request will proceed unauthenticated
    }
  }
  return config;
});

// Convert frontend application to API format
const convertToApiApp = (app: Omit<Application, 'id' | 'addedDate'>) => ({
  name: app.name,
  vendor: app.vendor,
  version: app.version,
  category: app.category,
});

export const applicationApi = {
  // Get all applications
  async getAll(): Promise<Application[]> {
    const res = await api.get('/applications');
    const list = asArray<ApiApplication>(res.data);
    return list.map(convertToFrontendApp);
  },

  // Get single application
  async getById(id: string): Promise<Application> {
    const res = await api.get<ApiApplication>(`/applications/${id}`);
    return convertToFrontendApp(res.data);
  },

  // Create new application
  async create(app: Omit<Application, 'id' | 'addedDate'>): Promise<Application> {
    const res = await api.post<ApiApplication>('/applications', convertToApiApp(app));
    return convertToFrontendApp(res.data);
  },

  // Bulk create applications
  async bulkCreate(apps: Omit<Application, 'id' | 'addedDate'>[]): Promise<Application[]> {
    const res = await api.post('/applications/bulk', apps.map(convertToApiApp));
    const list = asArray<ApiApplication>(res.data);
    return list.map(convertToFrontendApp);
  },

  // Update application
  async update(id: string, app: Partial<Omit<Application, 'id' | 'addedDate'>>): Promise<Application> {
    const res = await api.put<ApiApplication>(`/applications/${id}`, app);
    return convertToFrontendApp(res.data);
  },

  // Delete application
  async delete(id: string): Promise<void> {
    await api.delete(`/applications/${id}`);
  },

  // Delete all applications
  async deleteAll(): Promise<void> {
    await api.delete('/applications');
  },

  // Health check
  async healthCheck(): Promise<{ status: string; message: string } | string> {
    const res = await api.get('/health', { validateStatus: () => true });
    if (res.status >= 200 && res.status < 300 && typeof res.data === 'object') {
      return res.data as any;
    }
    const sample = typeof res.data === 'string' ? res.data.slice(0, 200) : res.data;
    throw new Error(`Health check failed (${res.status}). Payload: ${JSON.stringify(sample)}`);
    },
};