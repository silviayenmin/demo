import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    timeout: 5000,
});

// Types based on backend Schema
export interface Asset {
    id: string;
    name: string;
    type: string;
    location: string;
    status: 'NORMAL' | 'WARNING' | 'CRITICAL';
    last_updated: string;
}

export interface Alert {
    id: number;
    asset_id: string;
    timestamp: string;
    severity: string;
    message: string;
    acknowledged: boolean;
}

export interface SensorPayload {
    device_id: string;
    timestamp: string; // ISO string
    temperature: number;
    vibration: number;
    current: number;
}

// API Methods
export const AssetService = {
    getAll: async (): Promise<Asset[]> => {
        // START MOCK DATA (Remove when backend is reachable)
        // return [
        //   { id: 'RB-AXLE-001', name: 'Axle #1', type: 'Wheel Bearing', location: 'Coach 12', status: 'NORMAL', last_updated: new Date().toISOString() },
        //   { id: 'RB-AXLE-002', name: 'Axle #2', type: 'Wheel Bearing', location: 'Coach 12', status: 'CRITICAL', last_updated: new Date().toISOString() },
        // ];
        // END MOCK DATA
        const response = await api.get<Asset[]>('/assets/');
        return response.data;
    },

    getById: async (id: string): Promise<Asset> => {
        const response = await api.get<Asset>(`/assets/${id}`);
        return response.data;
    },
};

export const AlertService = {
    getRecent: async (limit: number = 50): Promise<Alert[]> => {
        const response = await api.get<Alert[]>('/alerts/', { params: { limit } });
        return response.data;
    },
};

export default api;
