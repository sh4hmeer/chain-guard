import axios from 'axios';
import { Application } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Convert frontend application to API format
const convertToApiApp = (app: Omit<Application, 'id' | 'addedDate'>) => ({
  name: app.name,
  vendor: app.vendor,
  version: app.version,
  category: app.category,
});

export const applicationApi = {
  // Get all applications
  getAll: async (): Promise<Application[]> => {
    try {
      const response = await api.get<ApiApplication[]>('/applications');
      return response.data.map(convertToFrontendApp);
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  // Get single application
  getById: async (id: string): Promise<Application> => {
    try {
      const response = await api.get<ApiApplication>(`/applications/${id}`);
      return convertToFrontendApp(response.data);
    } catch (error) {
      console.error('Error fetching application:', error);
      throw error;
    }
  },

  // Create new application
  create: async (app: Omit<Application, 'id' | 'addedDate'>): Promise<Application> => {
    try {
      console.log('🚀 Frontend: Creating application:', app);
      const apiApp = convertToApiApp(app);
      console.log('📦 Frontend: Sending to API:', apiApp);
      
      const response = await api.post<ApiApplication>('/applications', apiApp);
      
      console.log('✅ Frontend: Received response:', response.data);
      const frontendApp = convertToFrontendApp(response.data);
      console.log('🎯 Frontend: Converted to frontend format:', frontendApp);
      
      return frontendApp;
    } catch (error) {
      console.error('❌ Frontend: Error creating application:', error);
      throw error;
    }
  },

  // Bulk create applications
  bulkCreate: async (apps: Omit<Application, 'id' | 'addedDate'>[]): Promise<Application[]> => {
    try {
      const apiApps = apps.map(convertToApiApp);
      const response = await api.post<ApiApplication[]>('/applications/bulk', apiApps);
      return response.data.map(convertToFrontendApp);
    } catch (error) {
      console.error('Error bulk creating applications:', error);
      throw error;
    }
  },

  // Update application
  update: async (id: string, app: Partial<Omit<Application, 'id' | 'addedDate'>>): Promise<Application> => {
    try {
      const response = await api.put<ApiApplication>(`/applications/${id}`, app);
      return convertToFrontendApp(response.data);
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  },

  // Delete application
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/applications/${id}`);
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  },

  // Delete all applications
  deleteAll: async (): Promise<void> => {
    try {
      await api.delete('/applications');
    } catch (error) {
      console.error('Error deleting all applications:', error);
      throw error;
    }
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; message: string }> => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error checking API health:', error);
      throw error;
    }
  },
};
